import React, { useState, useEffect } from 'react';
import { CommunityPost } from '../types';
import { storageService } from '../services/storageService';
import { COMMUNITY_REACTIONS } from '../constants';
import { MessageCircle, Heart, PenLine, X, Loader2 } from 'lucide-react';
import Button from '../components/Button';

const Community: React.FC = () => {
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [isComposing, setIsComposing] = useState(false);
  const [newPostContent, setNewPostContent] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('General');
  const [userReactions, setUserReactions] = useState<Record<string, string[]>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Initial Load of User Reactions (Local preference)
    storageService.getUserReactions().then(r => setUserReactions(r));

    // Real-time Subscription for Posts
    const unsubscribe = storageService.subscribeToCommunityPosts((newPosts) => {
        setPosts(newPosts);
        setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handlePost = async () => {
    if (!newPostContent.trim()) return;
    // Don't set loading true here, let the subscription handle the UI update
    await storageService.addCommunityPost(newPostContent, selectedCategory);
    setNewPostContent('');
    setIsComposing(false);
  };

  const handleReaction = async (postId: string, reaction: string) => {
    // Optimistic UI update could be done here, but waiting for DB is safer for data consistency
    const updatedReactions = await storageService.toggleCommunityReaction(postId, reaction);
    setUserReactions(updatedReactions);
  };

  const isReacted = (postId: string, reaction: string) => {
    return userReactions[postId]?.includes(reaction);
  };

  return (
    <div className="max-w-md mx-auto space-y-6 pb-20 md:pb-0">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-light text-white">Quiet Space</h1>
          <p className="text-motiora-muted text-sm mt-1">Real voices. Real time.</p>
        </div>
        {!isComposing && (
          <button 
            onClick={() => setIsComposing(true)}
            className="p-2 rounded-full bg-motiora-soft hover:bg-motiora-accent/20 hover:text-motiora-accent transition-all"
          >
            <PenLine size={20} />
          </button>
        )}
      </header>

      {isComposing && (
        <div className="bg-motiora-card border border-motiora-soft rounded-xl p-4 animate-fade-in space-y-3">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs text-motiora-muted uppercase tracking-wider">Sharing anonymously</span>
            <button onClick={() => setIsComposing(false)}><X size={16} className="text-motiora-muted" /></button>
          </div>
          <textarea
            value={newPostContent}
            onChange={(e) => setNewPostContent(e.target.value)}
            placeholder="Share what feels heavy..."
            className="w-full bg-motiora-dark/50 rounded-lg p-3 text-sm text-motiora-text placeholder:text-motiora-soft focus:ring-1 focus:ring-motiora-accent outline-none min-h-[100px] resize-none"
            maxLength={280}
          />
          <div className="flex justify-between items-center">
             <select 
               value={selectedCategory} 
               onChange={(e) => setSelectedCategory(e.target.value)}
               className="bg-transparent text-xs text-motiora-muted border-none outline-none cursor-pointer"
             >
               <option value="General">General</option>
               <option value="Career">Career</option>
               <option value="Burnout">Burnout</option>
               <option value="Family">Family</option>
             </select>
             <Button variant="primary" onClick={handlePost} disabled={!newPostContent.trim()} className="py-2 px-4 text-xs">
               Share
             </Button>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {isLoading && posts.length === 0 ? (
           <div className="flex justify-center py-10">
              <Loader2 className="w-6 h-6 text-motiora-accent animate-spin" />
           </div>
        ) : posts.length === 0 ? (
             <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in border border-dashed border-motiora-soft/30 rounded-xl bg-motiora-card/20">
                <div className="p-4 bg-motiora-soft/10 rounded-full mb-3 text-motiora-muted">
                    <MessageCircle size={32} />
                </div>
                <h3 className="text-white font-medium mb-1">A Quiet Beginning</h3>
                <p className="text-sm text-motiora-muted max-w-[240px] leading-relaxed">
                   The community feed is empty. Be the first to start the conversation.
                </p>
                {!isComposing && (
                    <button 
                        onClick={() => setIsComposing(true)}
                        className="mt-4 text-xs text-motiora-accent hover:underline"
                    >
                        Write a post
                    </button>
                )}
             </div>
        ) : (
            posts.map((post) => (
            <div key={post.id} className="bg-motiora-card rounded-xl p-5 border border-transparent hover:border-motiora-soft/50 transition-colors animate-fade-in">
                <div className="flex justify-between items-start mb-3">
                <span className="text-xs font-medium text-motiora-accent/80">{post.authorAlias}</span>
                <span className="text-[10px] text-motiora-soft px-2 py-1 bg-motiora-dark rounded-full">{post.category}</span>
                </div>
                <p className="text-sm text-motiora-text leading-relaxed mb-4">
                {post.content}
                </p>
                <div className="flex justify-between items-center">
                    <div className="flex gap-2 flex-wrap">
                    {COMMUNITY_REACTIONS.map((reaction, idx) => {
                        const active = isReacted(post.id, reaction);
                        return (
                        <button 
                            key={idx}
                            onClick={() => handleReaction(post.id, reaction)}
                            className={`text-[10px] px-3 py-1.5 rounded-full transition-all duration-300 border ${
                            active 
                                ? 'bg-motiora-accent text-motiora-dark border-motiora-accent font-medium' 
                                : 'bg-motiora-dark text-motiora-muted border-motiora-soft/30 hover:bg-motiora-soft hover:text-white'
                            }`}
                        >
                            {reaction}
                        </button>
                        );
                    })}
                    </div>
                    {/* Just display counts if we had them, for now simple layout */}
                </div>
            </div>
            ))
        )}
      </div>
    </div>
  );
};

export default Community;