import React, { useState, useEffect } from 'react';
import { CommunityPost } from '../types';
import { storageService } from '../services/storageService';
import { COMMUNITY_REACTIONS } from '../constants';
import { MessageCircle, Heart, PenLine, X, Loader2, MessageSquare, AlertTriangle, Trash2 } from 'lucide-react';
import Button from '../components/Button';

const Community: React.FC = () => {
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [isComposing, setIsComposing] = useState(false);
  const [newPostContent, setNewPostContent] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('General');
  const [userReactions, setUserReactions] = useState<Record<string, string[]>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [expandedComments, setExpandedComments] = useState<Record<string, boolean>>({});
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const [syncError, setSyncError] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [postToDelete, setPostToDelete] = useState<string | null>(null);

  useEffect(() => {
    storageService.getUser().then(u => setCurrentUserId(u?.id || null));

    // Initial Load of User Reactions (Local preference)
    storageService.getUserReactions().then(r => setUserReactions(r));

    // Real-time Subscription for Posts
    const unsubscribe = storageService.subscribeToCommunityPosts((newPosts, errorMsg) => {
        setPosts(newPosts);
        setIsLoading(false);
        if (errorMsg) {
            setSyncError(errorMsg);
        }
    });

    return () => unsubscribe();
  }, []);

  const handlePost = async () => {
    if (!newPostContent.trim()) return;
    // Don't set loading true here, let the subscription handle the UI update
    try {
      await storageService.addCommunityPost(newPostContent, selectedCategory);
    } catch (e: any) {
      setSyncError(e.message || "Failed to sync post to cloud.");
    }
    setNewPostContent('');
    setIsComposing(false);
  };

  const handleReaction = async (postId: string, reaction: string) => {
    // Optimistic UI update could be done here, but waiting for DB is safer for data consistency
    try {
      const updatedReactions = await storageService.toggleCommunityReaction(postId, reaction);
      setUserReactions(updatedReactions);
    } catch (e: any) {
      setSyncError(e.message || "Failed to sync reaction to cloud.");
    }
  };

  const isReacted = (postId: string, reaction: string) => {
    return userReactions[postId]?.includes(reaction);
  };

  const toggleComments = (postId: string) => {
    setExpandedComments(prev => ({ ...prev, [postId]: !prev[postId] }));
  };

  const handleAddComment = async (postId: string) => {
    const content = commentInputs[postId];
    if (!content || !content.trim()) return;

    setCommentInputs(prev => ({ ...prev, [postId]: '' }));
    try {
      await storageService.addCommunityComment(postId, content);
    } catch (e: any) {
      setSyncError(e.message || "Failed to sync comment to cloud.");
    }
  };

  const handleDeletePost = async (postId: string) => {
    setPostToDelete(null);
    try {
      await storageService.deleteCommunityPost(postId);
    } catch (e: any) {
      setSyncError(e.message || "Failed to delete post.");
    }
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

      {syncError && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-start gap-3 animate-fade-in">
          <AlertTriangle className="text-red-400 shrink-0 mt-0.5" size={18} />
          <div>
            <h3 className="text-sm font-medium text-red-400 mb-1">Cloud Sync Issue</h3>
            <p className="text-xs text-red-300/80 leading-relaxed">
              {syncError}
            </p>
            <p className="text-xs text-red-300/80 mt-2">
              Posts are currently saving to your local device only. To fix this, check your Firebase Console: ensure Firestore Database is created, Security Rules allow access, and Email/Password Auth is enabled.
            </p>
          </div>
        </div>
      )}

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
            <div key={post.id} className="bg-motiora-card rounded-xl p-5 border border-transparent hover:border-motiora-soft/50 transition-colors animate-fade-in relative">
                {postToDelete === post.id && (
                  <div className="absolute inset-0 bg-motiora-dark/90 backdrop-blur-sm z-10 rounded-xl flex flex-col items-center justify-center p-4 animate-fade-in">
                    <p className="text-white text-sm mb-4">Are you sure you want to delete this post?</p>
                    <div className="flex gap-3">
                      <Button variant="secondary" onClick={() => setPostToDelete(null)} className="py-2 px-4 text-xs">Cancel</Button>
                      <Button variant="primary" onClick={() => handleDeletePost(post.id)} className="py-2 px-4 text-xs bg-red-500 hover:bg-red-600 text-white border-none">Delete</Button>
                    </div>
                  </div>
                )}
                <div className="flex justify-between items-start mb-3">
                  <span className="text-xs font-medium text-motiora-accent/80">{post.authorAlias}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-motiora-soft px-2 py-1 bg-motiora-dark rounded-full">{post.category}</span>
                    {currentUserId && post.authorId === currentUserId && (
                      <button 
                        onClick={() => setPostToDelete(post.id)}
                        className="text-motiora-muted hover:text-red-400 transition-colors p-1"
                        title="Delete Post"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
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
                    <button 
                        onClick={() => toggleComments(post.id)}
                        className="flex items-center gap-1.5 text-xs text-motiora-muted hover:text-white transition-colors ml-2"
                    >
                        <MessageSquare size={14} />
                        <span>{post.comments?.length || 0}</span>
                    </button>
                </div>

                {expandedComments[post.id] && (
                    <div className="mt-4 pt-4 border-t border-motiora-soft/30 space-y-3 animate-fade-in">
                        {post.comments && post.comments.length > 0 ? (
                            <div className="space-y-3 max-h-48 overflow-y-auto custom-scrollbar pr-2">
                                {post.comments.map(comment => (
                                    <div key={comment.id} className="bg-motiora-dark/50 p-3 rounded-lg">
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="text-[10px] font-medium text-motiora-accent/80">{comment.authorAlias}</span>
                                            <span className="text-[9px] text-motiora-muted">
                                                {new Date(comment.timestamp).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <p className="text-xs text-motiora-text">{comment.content}</p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-xs text-motiora-muted text-center py-2">No comments yet. Be the first to reply.</p>
                        )}

                        <div className="flex gap-2 mt-2">
                            <input
                                type="text"
                                value={commentInputs[post.id] || ''}
                                onChange={(e) => setCommentInputs(prev => ({ ...prev, [post.id]: e.target.value }))}
                                placeholder="Write a supportive reply..."
                                className="flex-1 bg-motiora-dark border border-motiora-soft rounded-lg px-3 py-2 text-xs text-white focus:ring-1 focus:ring-motiora-accent outline-none"
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleAddComment(post.id);
                                }}
                            />
                            <Button variant="primary" onClick={() => handleAddComment(post.id)} className="py-2 px-3 text-xs" disabled={!commentInputs[post.id]?.trim()}>
                                Reply
                            </Button>
                        </div>
                    </div>
                )}
            </div>
            ))
        )}
      </div>
    </div>
  );
};

export default Community;