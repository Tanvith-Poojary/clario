import React, { useState } from 'react';
import { storageService } from '../services/storageService';
import { Logo } from '../components/Logo';
import Button from '../components/Button';
import { Lock, User, ArrowRight, Mail } from 'lucide-react';

const Auth: React.FC = () => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nickname, setNickname] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
        if (!email.trim() || !password.trim()) {
        setError('Please fill in all fields.');
        setIsLoading(false);
        return;
        }

        if (mode === 'login') {
        const result = await storageService.login(email, password);
        if (!result.success) {
            setError(result.message || 'Login failed');
        }
        } else {
        if (!nickname.trim()) {
            setError('Please tell us what to call you.');
            setIsLoading(false);
            return;
        }
        const result = await storageService.register(email, password, nickname);
        if (!result.success) {
            setError(result.message || 'Registration failed');
        }
        }
    } catch (err: any) {
        setError(err.message);
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-motiora-dark">
      <div className="w-full max-w-sm space-y-8 animate-fade-in">
        <div className="flex flex-col items-center gap-4">
          <div className="p-4 bg-motiora-accent/10 rounded-full text-motiora-accent">
            <Logo size={48} />
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-medium text-white tracking-wide">Clario</h1>
            <p className="text-motiora-muted text-sm mt-1">A quiet space for your mind.</p>
          </div>
        </div>

        <div className="bg-motiora-card border border-motiora-soft/50 rounded-2xl p-6 shadow-xl shadow-black/20">
          <div className="flex mb-6 p-1 bg-motiora-dark rounded-lg">
            <button
              onClick={() => { setMode('login'); setError(''); }}
              className={`flex-1 py-2 text-xs font-medium rounded-md transition-all ${
                mode === 'login' ? 'bg-motiora-soft text-white shadow-sm' : 'text-motiora-muted hover:text-white'
              }`}
            >
              Log In
            </button>
            <button
              onClick={() => { setMode('register'); setError(''); }}
              className={`flex-1 py-2 text-xs font-medium rounded-md transition-all ${
                mode === 'register' ? 'bg-motiora-soft text-white shadow-sm' : 'text-motiora-muted hover:text-white'
              }`}
            >
              New Account
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div className="space-y-1 animate-fade-in">
                <label className="text-xs text-motiora-muted ml-1">What should we call you?</label>
                <div className="relative">
                  <User className="absolute left-3 top-3 text-motiora-soft" size={16} />
                  <input
                    type="text"
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    className="w-full bg-motiora-dark border border-motiora-soft rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-motiora-soft focus:ring-1 focus:ring-motiora-accent outline-none transition-all"
                    placeholder="Nickname"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-xs text-motiora-muted ml-1">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 text-motiora-soft" size={16} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-motiora-dark border border-motiora-soft rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-motiora-soft focus:ring-1 focus:ring-motiora-accent outline-none transition-all"
                  placeholder="name@email.com"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs text-motiora-muted ml-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 text-motiora-soft" size={16} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-motiora-dark border border-motiora-soft rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-motiora-soft focus:ring-1 focus:ring-motiora-accent outline-none transition-all"
                  placeholder="Password"
                />
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-xs text-red-400 text-center animate-fade-in">
                {error}
              </div>
            )}

            <Button 
                variant="primary" 
                className="w-full py-3 mt-2 flex items-center justify-center gap-2"
                isLoading={isLoading}
            >
              {mode === 'login' ? 'Enter Space' : 'Begin Journey'}
              <ArrowRight size={16} />
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Auth;