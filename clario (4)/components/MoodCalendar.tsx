
import React, { useMemo } from 'react';
import { MoodEntry, MoodType } from '../types';
import { CloudRain, Cloud, Zap, Sun, Circle } from 'lucide-react';

interface MoodCalendarProps {
  history: MoodEntry[];
}

const MoodCalendar: React.FC<MoodCalendarProps> = ({ history }) => {
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();

  // Helper to get array of days in the current month
  const daysInMonth = useMemo(() => {
    const days = [];
    const date = new Date(currentYear, currentMonth, 1);
    while (date.getMonth() === currentMonth) {
      days.push(new Date(date));
      date.setDate(date.getDate() + 1);
    }
    return days;
  }, [currentMonth, currentYear]);

  // Convert history to a Map for O(1) lookup
  const moodMap = useMemo(() => {
    const map = new Map<string, MoodType>();
    history.forEach(entry => map.set(entry.date, entry.mood));
    return map;
  }, [history]);

  // Helper to format date consistently with storage (YYYY-MM-DD)
  const formatDateKey = (date: Date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  const getMoodIcon = (mood?: MoodType) => {
    switch (mood) {
      case 'overwhelmed': return <CloudRain size={16} className="text-blue-400" />;
      case 'confused': return <Cloud size={16} className="text-gray-400" />;
      case 'anxious': return <Zap size={16} className="text-yellow-500/80" />;
      case 'clear': return <Sun size={16} className="text-motiora-accent" />;
      default: return <div className="w-1.5 h-1.5 rounded-full bg-motiora-soft/30" />;
    }
  };

  const getMoodLabel = (mood?: MoodType) => {
    switch (mood) {
      case 'overwhelmed': return 'Rain';
      case 'confused': return 'Cloud';
      case 'anxious': return 'Storm';
      case 'clear': return 'Sun';
      default: return '';
    }
  };

  return (
    <div className="w-full mt-4 animate-fade-in">
      <div className="flex justify-between items-center mb-4 px-2">
        <h3 className="text-sm font-medium text-white">
          {today.toLocaleString('default', { month: 'long' })} Patterns
        </h3>
        <span className="text-xs text-motiora-muted">{currentYear}</span>
      </div>
      
      <div className="grid grid-cols-7 gap-2">
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
          <div key={i} className="text-center text-[10px] text-motiora-soft font-medium py-1">
            {d}
          </div>
        ))}
        
        {/* Empty cells for start of month padding */}
        {Array.from({ length: daysInMonth[0].getDay() }).map((_, i) => (
          <div key={`pad-${i}`} />
        ))}

        {daysInMonth.map((date) => {
          const dateKey = formatDateKey(date);
          const mood = moodMap.get(dateKey);
          const isToday = date.getDate() === today.getDate();

          return (
            <div 
              key={dateKey} 
              className={`aspect-square flex flex-col items-center justify-center rounded-lg border transition-all ${
                isToday 
                  ? 'bg-motiora-soft/20 border-motiora-accent/30' 
                  : 'bg-transparent border-transparent hover:bg-white/5'
              }`}
              title={mood ? `${date.toLocaleDateString()}: ${getMoodLabel(mood)}` : date.toLocaleDateString()}
            >
              <div className="mb-1">{getMoodIcon(mood)}</div>
              <span className={`text-[9px] ${isToday ? 'text-white font-bold' : 'text-motiora-muted'}`}>
                {date.getDate()}
              </span>
            </div>
          );
        })}
      </div>
      
      <div className="mt-6 flex justify-center gap-4 text-[10px] text-motiora-muted">
        <div className="flex items-center gap-1"><CloudRain size={10} className="text-blue-400"/> Heavy</div>
        <div className="flex items-center gap-1"><Cloud size={10} className="text-gray-400"/> Foggy</div>
        <div className="flex items-center gap-1"><Zap size={10} className="text-yellow-500/80"/> Anxious</div>
        <div className="flex items-center gap-1"><Sun size={10} className="text-motiora-accent"/> Clear</div>
      </div>
    </div>
  );
};

export default MoodCalendar;
