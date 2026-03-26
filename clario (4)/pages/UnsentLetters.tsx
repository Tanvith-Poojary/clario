import React, { useState, useEffect } from 'react';
import { UnsentLetter } from '../types';
import { storageService } from '../services/storageService';
import { Trash2, Lock } from 'lucide-react';
import Button from '../components/Button';

const UnsentLetters: React.FC = () => {
  const [letters, setLetters] = useState<UnsentLetter[]>([]);
  const [recipient, setRecipient] = useState('');
  const [content, setContent] = useState('');
  const [view, setView] = useState<'list' | 'write'>('list');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadLetters();
  }, []);

  const loadLetters = async () => {
    setIsLoading(true);
    const data = await storageService.getLetters();
    setLetters(data);
    setIsLoading(false);
  };

  const handleSave = async () => {
    if (!content.trim() || !recipient.trim()) return;
    
    // ID is ignored by saveLetter logic which lets Firestore gen ID, 
    // but typescript needs it to match interface.
    const newLetter: UnsentLetter = {
      id: '', 
      recipient,
      content,
      date: new Date().toISOString()
    };
    
    await storageService.saveLetter(newLetter);
    await loadLetters();
    resetForm();
  };

  const handleDelete = async (id: string) => {
    await storageService.deleteLetter(id);
    await loadLetters();
  };

  const resetForm = () => {
    setRecipient('');
    setContent('');
    setView('list');
  };

  return (
    <div className="max-w-md mx-auto space-y-6 pb-20 md:pb-0">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-light text-white">Unsent Letters</h1>
          <p className="text-motiora-muted text-sm mt-1">Speak out, without speaking to them.</p>
        </div>
      </header>

      {view === 'list' ? (
        <div className="space-y-4">
           <button 
             onClick={() => setView('write')}
             className="w-full border border-dashed border-motiora-soft rounded-xl p-6 text-motiora-muted hover:text-white hover:border-motiora-accent/50 hover:bg-motiora-card/30 transition-all flex flex-col items-center gap-2"
           >
             <span className="text-2xl">+</span>
             <span className="text-sm font-medium">Write a new letter</span>
           </button>

           {isLoading ? (
             <div className="text-center py-10 opacity-50">Loading...</div>
           ) : letters.length === 0 ? (
             <div className="text-center py-10 opacity-50">
               <Lock size={48} className="mx-auto mb-4 text-motiora-soft" />
               <p className="text-sm">Your letters stay private.</p>
             </div>
           ) : (
             letters.map(letter => (
               <div key={letter.id} className="bg-motiora-card rounded-xl p-5 border border-motiora-soft/50 relative group">
                 <div className="flex justify-between items-start mb-2">
                   <h3 className="text-sm font-medium text-white">To: {letter.recipient}</h3>
                   <span className="text-[10px] text-motiora-soft">{new Date(letter.date).toLocaleDateString()}</span>
                 </div>
                 <p className="text-sm text-motiora-muted line-clamp-3 italic">
                   "{letter.content}"
                 </p>
                 <button 
                   onClick={() => handleDelete(letter.id)}
                   className="absolute top-4 right-4 text-red-400 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-red-400/10 rounded"
                 >
                   <Trash2 size={16} />
                 </button>
               </div>
             ))
           )}
        </div>
      ) : (
        <div className="animate-fade-in space-y-4">
          <input
            type="text"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            placeholder="To whom? (e.g., My younger self, Dad, Society)"
            className="w-full bg-motiora-card border border-motiora-soft rounded-lg px-4 py-3 text-white placeholder:text-motiora-soft focus:ring-1 focus:ring-motiora-accent outline-none"
          />
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write everything you've wanted to say..."
            className="w-full h-64 bg-motiora-card border border-motiora-soft rounded-lg px-4 py-3 text-white placeholder:text-motiora-soft focus:ring-1 focus:ring-motiora-accent outline-none resize-none"
          />
          <div className="flex gap-3">
            <Button variant="ghost" onClick={resetForm} className="flex-1">Discard</Button>
            <Button variant="primary" onClick={handleSave} className="flex-1" disabled={!recipient || !content}>Save (Private)</Button>
          </div>
          <p className="text-center text-[10px] text-motiora-soft flex items-center justify-center gap-1">
            <Lock size={10} /> Encrypted at rest in Cloud.
          </p>
        </div>
      )}
    </div>
  );
};

export default UnsentLetters;