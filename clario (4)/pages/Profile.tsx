
import React, { useState, useEffect, useRef } from 'react';
import { User } from '../types';
import { storageService } from '../services/storageService';
import Button from '../components/Button';
import Avatar, { AVATARS } from '../components/Avatar';
import { Shield, Activity, Save, Mail, LogOut, BookHeart, ChevronRight, Upload } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';

interface ProfileProps {
    refreshUser: () => void;
}

const Profile: React.FC<ProfileProps> = ({ refreshUser }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [nickname, setNickname] = useState('');
  const [bio, setBio] = useState('');
  const [avatarId, setAvatarId] = useState('default');
  const [stats, setStats] = useState({
    activeJourneys: 0,
    lettersWritten: 0
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadProfile = async () => {
    const u = await storageService.getUser();
    setUser(u);
    if (u) {
      setNickname(u.nickname || '');
      setBio(u.bio || '');
      setAvatarId(u.avatarId || 'default');
      
      const journeys = await storageService.getJourneys();
      const letters = await storageService.getLetters();
      
      setStats({
        activeJourneys: journeys.filter(j => j.isStarted).length,
        lettersWritten: letters.length
      });
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handleSave = async () => {
    if (user) {
      await storageService.updateUserProfile({ nickname, bio, avatarId });
      refreshUser(); // Updates parent app state
      await loadProfile(); // Updates local stats/display
      setIsEditing(false);
    }
  };

  const handleLogout = async () => {
    await storageService.logout();
    // App.tsx handles the state change via onAuthStateChanged
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setAvatarId(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  if (!user) return <div className="p-10 text-center opacity-50">Loading profile...</div>;

  return (
    <div className="max-w-md mx-auto space-y-6 pb-20 md:pb-0 animate-fade-in">
      <header className="flex items-center justify-between pb-4 border-b border-motiora-soft/30">
        <div className="flex items-center gap-5">
            <Avatar id={user.avatarId || 'default'} size={64} />
            <div>
            <h1 className="text-2xl font-light text-white">
                {user.nickname || 'Traveler'}
            </h1>
            <p className="text-sm text-motiora-muted">
                {user.username}
            </p>
            </div>
        </div>
        <button 
            onClick={handleLogout}
            className="p-2 text-motiora-muted hover:text-white hover:bg-motiora-soft/30 rounded-lg transition-colors"
            title="Log Out"
        >
            <LogOut size={20} />
        </button>
      </header>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-motiora-card p-4 rounded-xl border border-motiora-soft/50">
          <div className="flex items-center gap-2 text-motiora-muted mb-2">
            <Activity size={14} />
            <span className="text-xs uppercase tracking-wider">Clarity Score</span>
          </div>
          <span className="text-2xl font-light text-white">{Math.round(user.clarityScore)}</span>
        </div>
        <div className="bg-motiora-card p-4 rounded-xl border border-motiora-soft/50">
          <div className="flex items-center gap-2 text-motiora-muted mb-2">
            <Shield size={14} />
            <span className="text-xs uppercase tracking-wider">Community Alias</span>
          </div>
          <span className="text-sm font-medium text-motiora-accent">{user.communityAlias}</span>
        </div>
      </div>

      {/* Edit Section */}
      <section className="bg-motiora-card p-6 rounded-xl border border-motiora-soft/50">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-medium text-white">Personal Details</h2>
          {!isEditing && (
            <button 
              onClick={() => setIsEditing(true)} 
              className="text-xs text-motiora-accent hover:text-white transition-colors"
            >
              Edit
            </button>
          )}
        </div>

        {isEditing ? (
          <div className="space-y-5">
            <div>
              <div className="flex justify-between items-center mb-3">
                <label className="block text-xs text-motiora-muted">Choose a Spirit Avatar</label>
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="text-xs text-motiora-accent hover:text-white flex items-center gap-1 transition-colors"
                >
                  <Upload size={12} /> Upload Custom
                </button>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileUpload} 
                  accept="image/*" 
                  className="hidden" 
                />
              </div>
              
              {avatarId.startsWith('data:image') && (
                <div className="mb-4 flex flex-col items-center">
                  <div className="relative mb-2">
                    <Avatar id={avatarId} size={80} className="ring-2 ring-motiora-accent ring-offset-2 ring-offset-motiora-card" />
                    <button 
                      onClick={() => setAvatarId('default')}
                      className="absolute -top-2 -right-2 bg-motiora-dark text-white rounded-full p-1 border border-motiora-soft hover:bg-red-500/20 hover:text-red-400 transition-colors"
                    >
                      &times;
                    </button>
                  </div>
                  <span className="text-xs text-motiora-accent">Custom Avatar Selected</span>
                </div>
              )}

              <div className="grid grid-cols-5 gap-3 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                 {AVATARS.map(av => (
                   <button 
                     key={av.id}
                     onClick={() => setAvatarId(av.id)}
                     className={`flex items-center justify-center p-1 rounded-full transition-all duration-300 ${
                       avatarId === av.id 
                         ? 'ring-2 ring-motiora-accent ring-offset-2 ring-offset-motiora-card scale-110' 
                         : 'hover:bg-motiora-soft/50 opacity-70 hover:opacity-100'
                     }`}
                     title={av.label}
                   >
                     <Avatar id={av.id} size={40} />
                   </button>
                 ))}
              </div>
            </div>

            <div>
              <label className="block text-xs text-motiora-muted mb-1">What should we call you?</label>
              <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="Name or Nickname"
                className="w-full bg-motiora-dark border border-motiora-soft rounded-lg px-3 py-2 text-white focus:ring-1 focus:ring-motiora-accent outline-none"
              />
            </div>
            <div>
              <label className="block text-xs text-motiora-muted mb-1">A note to yourself (Bio)</label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Currently seeking..."
                rows={2}
                className="w-full bg-motiora-dark border border-motiora-soft rounded-lg px-3 py-2 text-white focus:ring-1 focus:ring-motiora-accent outline-none resize-none"
              />
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" onClick={() => setIsEditing(false)} className="flex-1 py-2 h-auto text-xs">Cancel</Button>
              <Button variant="primary" onClick={handleSave} className="flex-1 py-2 h-auto text-xs flex items-center justify-center gap-2">
                <Save size={14} /> Save
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex justify-between py-2 border-b border-motiora-soft/20">
              <span className="text-sm text-motiora-muted">Name</span>
              <span className="text-sm text-white">{user.nickname || 'Not set'}</span>
            </div>
            <div className="py-2">
              <span className="text-sm text-motiora-muted block mb-1">Bio</span>
              <p className="text-sm text-white italic opacity-80">
                {user.bio || 'No bio written yet.'}
              </p>
            </div>
          </div>
        )}
      </section>

      {/* Safety Net Section */}
      <section className="bg-motiora-card p-4 rounded-xl border border-motiora-soft/50">
        <Link to="/resources" className="flex items-center justify-between group">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-motiora-soft/30 rounded-lg text-teal-400 group-hover:text-teal-300 group-hover:bg-motiora-soft/50 transition-colors">
                    <BookHeart size={20} />
                </div>
                <div>
                    <p className="text-sm text-white font-medium group-hover:text-motiora-accent transition-colors">Professional Support Hub</p>
                    <p className="text-xs text-motiora-muted">Therapy finders and growth resources.</p>
                </div>
            </div>
            <ChevronRight size={16} className="text-motiora-muted group-hover:translate-x-1 transition-transform" />
        </Link>
      </section>

      {/* Journey Summary */}
      <section className="bg-motiora-card p-6 rounded-xl border border-motiora-soft/50">
        <h2 className="text-lg font-medium text-white mb-4">Progress Summary</h2>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-motiora-muted">Active Journeys</span>
            <span className="text-sm text-white font-medium">{stats.activeJourneys}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-motiora-muted">Unsent Letters</span>
            <span className="text-sm text-white font-medium">{stats.lettersWritten}</span>
          </div>
        </div>
      </section>
      
      {/* Support Section */}
      <section className="bg-motiora-card p-6 rounded-xl border border-motiora-soft/50">
        <h2 className="text-lg font-medium text-white mb-4">Feedback</h2>
        <div className="flex items-center gap-3">
            <div className="p-2 bg-motiora-soft/30 rounded-lg text-motiora-muted">
                <Mail size={20} />
            </div>
            <div>
                <p className="text-sm text-motiora-muted mb-1">Have a suggestion for Clario?</p>
                <a href="mailto:my.clario.app@gmail.com" className="text-sm text-motiora-accent hover:underline">my.clario.app@gmail.com</a>
            </div>
        </div>
      </section>
    </div>
  );
};

export default Profile;
