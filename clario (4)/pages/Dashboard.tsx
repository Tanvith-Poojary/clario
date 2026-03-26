
import React, { useState, useEffect } from 'react';
import { User, MoodType } from '../types';
import { storageService, getLocalTodayDate } from '../services/storageService';
import ClarityChart from '../components/ClarityChart';
import MoodCalendar from '../components/MoodCalendar';
import Avatar from '../components/Avatar';
import { Sun, Cloud, CloudRain, Zap, Calendar, BarChart2, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

interface DashboardProps {
  user: User;
  refreshUser: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ user, refreshUser }) => {
  const [greeting, setGreeting] = useState('');
  const [feelingLogged, setFeelingLogged] = useState(false);
  const [viewMode, setViewMode] = useState<'chart' | 'calendar'>('chart');
  const [isMarkingDone, setIsMarkingDone] = useState(false);

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good morning.');
    else if (hour < 18) setGreeting('Good afternoon.');
    else setGreeting('Good evening.');
  }, []);

  const handleFeeling = async (mood: MoodType, scoreDelta: number) => {
    await storageService.logMood(mood, scoreDelta);
    refreshUser();
    setFeelingLogged(true);
  };

  const handleCompleteDailyAction = async () => {
    setIsMarkingDone(true);
    await storageService.completeDailyAction();
    refreshUser();
    setIsMarkingDone(false);
  };

  const getClarityMessage = (score: number) => {
    if (score < 40) return "It's okay to feel foggy. We're just looking for one clear thought.";
    if (score < 70) return "You're finding your footing.";
    return "You have good clarity today. Hold onto it gently.";
  };

  return (
    <div className="max-w-md mx-auto space-y-8 animate-fade-in pb-24 md:pb-0">
      <header className="flex justify-between items-start">
        <div className="space-y-2">
          <h1 className="text-3xl font-light tracking-tight text-white">
            {greeting} {user.nickname ? <span className="opacity-80">{user.nickname}.</span> : ''}
          </h1>
          <p className="text-motiora-muted text-sm">Take a slow breath.</p>
        </div>
        <Link to="/profile" className="transition-transform hover:scale-105 active:scale-95">
          <Avatar id={user.avatarId || 'default'} size={44} />
        </Link>
      </header>

      {/* Feeling Check-in */}
      {!feelingLogged ? (
        <section className="bg-motiora-card p-6 rounded-2xl border border-motiora-soft/50">
          <h2 className="text-lg font-medium mb-4">How is your mind right now?</h2>
          <div className="grid grid-cols-2 gap-3">
            <button onClick={() => handleFeeling('overwhelmed', -5)} className="flex flex-col items-center justify-center p-4 rounded-xl bg-motiora-dark hover:bg-motiora-soft transition-colors gap-2">
              <CloudRain size={24} className="text-blue-400" />
              <span className="text-sm">Overwhelmed</span>
            </button>
            <button onClick={() => handleFeeling('confused', -2)} className="flex flex-col items-center justify-center p-4 rounded-xl bg-motiora-dark hover:bg-motiora-soft transition-colors gap-2">
              <Cloud size={24} className="text-gray-400" />
              <span className="text-sm">Confused</span>
            </button>
            <button onClick={() => handleFeeling('anxious', 2)} className="flex flex-col items-center justify-center p-4 rounded-xl bg-motiora-dark hover:bg-motiora-soft transition-colors gap-2">
              <Zap size={24} className="text-yellow-500/80" />
              <span className="text-sm">Anxious Energy</span>
            </button>
            <button onClick={() => handleFeeling('clear', 5)} className="flex flex-col items-center justify-center p-4 rounded-xl bg-motiora-dark hover:bg-motiora-soft transition-colors gap-2">
              <Sun size={24} className="text-motiora-accent" />
              <span className="text-sm">Clear</span>
            </button>
          </div>
        </section>
      ) : (
        <section className="bg-motiora-card p-6 rounded-2xl border border-motiora-soft/50 animate-fade-in">
          <div className="text-center space-y-2">
            <span className="inline-block p-2 rounded-full bg-motiora-accent/10 text-motiora-accent mb-2">
              <Sun size={20} />
            </span>
            <h3 className="text-xl font-medium text-white">Check-in complete.</h3>
            <p className="text-motiora-muted text-sm">Your input shapes your journey.</p>
          </div>
        </section>
      )}

      {/* Clarity Score & Patterns */}
      <section className="bg-motiora-card p-6 rounded-2xl border border-motiora-soft/50">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h2 className="text-sm font-medium text-motiora-muted uppercase tracking-wider">Clarity Score</h2>
            {viewMode === 'chart' && (
              <p className="text-3xl font-light text-white mt-1">{Math.round(user.clarityScore)}</p>
            )}
          </div>
          <div className="flex bg-motiora-dark p-1 rounded-lg">
            <button 
              onClick={() => setViewMode('chart')}
              className={`p-1.5 rounded transition-colors ${viewMode === 'chart' ? 'bg-motiora-soft text-white shadow-sm' : 'text-motiora-muted hover:text-white'}`}
              title="Clarity Trend"
            >
              <BarChart2 size={16} />
            </button>
            <button 
              onClick={() => setViewMode('calendar')}
              className={`p-1.5 rounded transition-colors ${viewMode === 'calendar' ? 'bg-motiora-soft text-white shadow-sm' : 'text-motiora-muted hover:text-white'}`}
              title="Mood Patterns"
            >
              <Calendar size={16} />
            </button>
          </div>
        </div>
        
        {viewMode === 'chart' ? (
          <>
            <p className="text-sm text-motiora-muted mb-4">{getClarityMessage(user.clarityScore)}</p>
            <ClarityChart history={user.clarityHistory} />
          </>
        ) : (
          <MoodCalendar history={user.moodHistory || []} />
        )}
      </section>

      {/* Daily Micro-Action */}
      <section className="bg-gradient-to-br from-motiora-card to-motiora-dark p-6 rounded-2xl border border-motiora-accent/20 transition-all duration-300">
        <div className="flex justify-between items-start mb-2">
          <h2 className="text-lg font-medium text-white">Today's Micro-Action</h2>
          {user.lastDailyActionDate === getLocalTodayDate() ? (
            <span className="text-motiora-accent flex items-center gap-1 text-sm">
              <CheckCircle size={16} />
              Done
            </span>
          ) : (
            <button 
              onClick={handleCompleteDailyAction}
              disabled={isMarkingDone}
              className="text-xs px-3 py-1 rounded-full bg-motiora-soft hover:bg-motiora-accent hover:text-motiora-dark transition-colors disabled:opacity-50"
            >
              {isMarkingDone ? 'Marking...' : 'Mark Complete'}
            </button>
          )}
        </div>
        <p className="text-motiora-text font-light leading-relaxed">
          "Sit quietly for 3 minutes without trying to fix, solve, or plan anything. Just exist."
        </p>
      </section>
    </div>
  );
};

export default Dashboard;
