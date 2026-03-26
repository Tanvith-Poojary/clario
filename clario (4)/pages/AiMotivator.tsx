import React, { useState, useEffect, useRef } from 'react';
import { Message, MessageSender } from '../types';
import { generateAIResponse, createJourneyFromChat, analyzeChat } from '../services/geminiService';
import { storageService } from '../services/storageService';
import { Send, Sparkles, Trash2, Activity } from 'lucide-react';
import { Logo } from '../components/Logo';
import { useNavigate } from 'react-router-dom';

const AiMotivator: React.FC = () => {
  const navigate = useNavigate();
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isGeneratingPath, setIsGeneratingPath] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isConfirmingClear, setIsConfirmingClear] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Track current score locally for display in header
  const [currentScore, setCurrentScore] = useState(50);
  const [scoreTrend, setScoreTrend] = useState<'up' | 'down' | 'neutral'>('neutral');

  const [messages, setMessages] = useState<Message[]>([]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    // Load initial data
    const init = async () => {
        const user = await storageService.getUser();
        if(user) setCurrentScore(user.clarityScore);
        
        const history = await storageService.getChatHistory();
        if (history && history.length > 0) {
            setMessages(history);
        } else {
            setMessages([{
                id: 'welcome',
                text: "I'm listening. No judgment, no rush. What's on your mind today?",
                sender: MessageSender.AI,
                timestamp: Date.now()
            }]);
        }
        setLoading(false);
    }
    init();
  }, []);

  useEffect(() => {
    if(!loading) scrollToBottom();
  }, [messages, loading]);

  // Automatic Analysis Logic
  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    
    // Trigger analysis after every AI response (excluding the initial welcome)
    // We check length > 1 to ensure there's at least one user message exchanged.
    if (lastMessage?.sender === MessageSender.AI && messages.length > 1) {
        performSilentAnalysis();
    }
  }, [messages]);

  const performSilentAnalysis = async () => {
    if (isAnalyzing) return;
    setIsAnalyzing(true);
    
    // We analyze the last few turns to keep context relevant but focused on recent change
    // Taking last 6 messages ensures we have enough context without overloading
    const recentHistory = messages.slice(-6).map(m => ({
        role: m.sender === MessageSender.User ? 'user' : 'ai',
        parts: [{ text: m.text }]
    }));

    const result = await analyzeChat(recentHistory);
    if (result && result.scoreDelta !== 0) {
        const newScore = await storageService.updateClarityScore(result.scoreDelta);
        if (newScore !== undefined) {
            // Determine trend for visual feedback
            if (newScore > currentScore) setScoreTrend('up');
            else if (newScore < currentScore) setScoreTrend('down');
            else setScoreTrend('neutral');

            setCurrentScore(newScore);
            
            // Reset trend visual after 2 seconds
            setTimeout(() => setScoreTrend('neutral'), 2000);
        }
    }
    setIsAnalyzing(false);
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      text: input,
      sender: MessageSender.User,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);
    
    // Save User Msg
    await storageService.saveMessage(userMsg);

    const history = messages.map(m => ({
      role: m.sender === MessageSender.User ? 'user' : 'ai',
      parts: [{ text: m.text }]
    }));

    try {
      const responseText = await generateAIResponse(userMsg.text, history);
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        text: responseText,
        sender: MessageSender.AI,
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, aiMsg]);
      await storageService.saveMessage(aiMsg);

    } catch (error) {
       // handled silently
    } finally {
      setIsTyping(false);
    }
  };

  const handleCreatePath = async () => {
    if (messages.length < 3) return; 
    
    setIsGeneratingPath(true);
    setMessages(prev => [...prev, {
        id: 'system-generating',
        text: "I'm reflecting on our conversation to create a path for you...",
        sender: MessageSender.System,
        timestamp: Date.now()
    }]);

    const history = messages.map(m => ({
      role: m.sender === MessageSender.User ? 'user' : 'ai',
      parts: [{ text: m.text }]
    }));

    const journeyData = await createJourneyFromChat(history);
    
    if (journeyData) {
      await storageService.saveCustomJourney(journeyData);
      navigate('/journeys');
    } else {
       setIsGeneratingPath(false);
       setMessages(prev => prev.filter(m => m.id !== 'system-generating').concat({
         id: Date.now().toString(),
         text: "I couldn't quite map a full path from our short chat yet. Tell me a little more?",
         sender: MessageSender.AI,
         timestamp: Date.now()
       }));
    }
  };

  const handleClearChat = async () => {
    await storageService.clearChatHistory();
    setMessages([{
        id: 'welcome',
        text: "I'm listening. No judgment, no rush. What's on your mind today?",
        sender: MessageSender.AI,
        timestamp: Date.now()
    }]);
    setIsConfirmingClear(false);
  };

  const handleClearClick = () => {
    if (isConfirmingClear) {
        handleClearChat();
    } else {
        setIsConfirmingClear(true);
        setTimeout(() => setIsConfirmingClear(false), 3000);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Dynamic style for score based on trend
  const getScoreStyle = () => {
      if (scoreTrend === 'up') return 'text-motiora-accent border-motiora-accent/50 bg-motiora-accent/10';
      if (scoreTrend === 'down') return 'text-red-400 border-red-400/50 bg-red-400/10';
      if (isAnalyzing) return 'text-motiora-muted border-motiora-accent/30';
      return 'text-motiora-muted border-motiora-soft/30';
  };

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] md:h-[calc(100vh-40px)] max-w-2xl mx-auto relative">
      <header className="pb-4 border-b border-motiora-soft/50 mb-4 flex items-center justify-between px-2">
         <div className="flex items-center gap-3">
            <div className="p-2 bg-motiora-accent/10 rounded-full text-motiora-accent">
              <Logo size={24} />
            </div>
            <div>
              <h1 className="text-lg font-medium text-white">Clario</h1>
              <p className="text-xs text-motiora-muted">Listening.</p>
            </div>
         </div>
         
         <div className="flex gap-2 items-center">
           {/* Display current score subtly with trend indication */}
           <div className={`hidden sm:flex items-center gap-2 text-xs font-mono px-2 py-1 rounded border transition-all duration-500 ${getScoreStyle()}`}>
               {isAnalyzing && scoreTrend === 'neutral' ? <Activity size={12} className="animate-pulse" /> : null}
               Clarity: {Math.round(currentScore)}
           </div>

           <button 
             onClick={handleClearClick}
             className={`p-2 rounded-lg transition-all text-xs border flex items-center gap-1 ${
                isConfirmingClear
                  ? 'bg-red-500/20 text-red-400 border-red-500/50 hover:bg-red-500/30'
                  : 'bg-motiora-soft/30 hover:bg-red-500/10 text-motiora-muted hover:text-red-400 border-transparent hover:border-red-500/30'
             }`}
             title={isConfirmingClear ? "Confirm Clear" : "Clear Conversation"}
           >
             <Trash2 size={16} />
             {isConfirmingClear && <span className="font-medium pr-1">Confirm</span>}
           </button>

           {messages.length > 2 && (
             <button 
                 onClick={handleCreatePath}
                 disabled={isGeneratingPath}
                 className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-motiora-soft/30 hover:bg-motiora-accent/10 text-motiora-muted hover:text-motiora-accent transition-all text-xs border border-transparent hover:border-motiora-accent/30"
                 title="Create Action Plan"
               >
                 {isGeneratingPath ? (
                   <span className="animate-pulse">Creating...</span>
                 ) : (
                   <>
                     <Sparkles size={14} />
                     <span className="hidden sm:inline">Path</span>
                   </>
                 )}
               </button>
           )}
         </div>
      </header>

      <div className="flex-1 overflow-y-auto space-y-5 pr-2 scrollbar-thin">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${
                msg.sender === MessageSender.System ? 'justify-center' : 
                msg.sender === MessageSender.User ? 'justify-end' : 'justify-start'
            }`}
          >
            {msg.sender === MessageSender.System ? (
                <span className="text-xs text-motiora-muted italic bg-motiora-soft/20 px-3 py-1 rounded-full">{msg.text}</span>
            ) : (
                <div
                className={`max-w-[85%] rounded-2xl px-5 py-3 text-sm leading-relaxed ${
                    msg.sender === MessageSender.User
                    ? 'bg-motiora-accent/10 text-motiora-text border border-motiora-accent/20 rounded-br-none'
                    : 'bg-motiora-card text-motiora-text border border-motiora-soft rounded-bl-none'
                }`}
                >
                {msg.text}
                </div>
            )}
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start animate-fade-in">
            <div className="bg-motiora-card border border-motiora-soft rounded-2xl rounded-bl-none px-4 py-3 flex items-center gap-1">
              <div className="w-1.5 h-1.5 bg-motiora-muted rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-1.5 h-1.5 bg-motiora-muted rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-1.5 h-1.5 bg-motiora-muted rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="mt-4 relative">
        <div className="absolute inset-0 bg-gradient-to-t from-motiora-dark via-motiora-dark/50 to-transparent -top-10 pointer-events-none" />
        <div className="relative flex items-end gap-2 bg-motiora-card border border-motiora-soft rounded-xl p-2 focus-within:ring-1 focus-within:ring-motiora-accent/50 transition-all">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your thoughts..."
            className="w-full bg-transparent border-none focus:ring-0 resize-none text-sm max-h-32 min-h-[44px] py-3 px-2 text-motiora-text placeholder:text-motiora-soft"
            rows={1}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isTyping}
            className="p-3 bg-motiora-accent/10 text-motiora-accent rounded-lg hover:bg-motiora-accent/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mb-[1px]"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AiMotivator;