import React, { useState, useEffect } from 'react';
import { Journey } from '../types';
import { storageService } from '../services/storageService';
import { ChevronRight, PlayCircle, CheckCircle, Flag, Sparkles, Trash2 } from 'lucide-react';
import Button from '../components/Button';
import { Link } from 'react-router-dom';

interface JourneyCardProps {
    journey: Journey;
    onStart: (id: string) => void;
    onCompletePhase: (id: string) => void;
    onDelete: (id: string) => void;
    isCustom?: boolean;
}

const JourneyCard: React.FC<JourneyCardProps> = ({ journey, onStart, onCompletePhase, onDelete, isCustom }) => {
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [loading, setLoading] = useState(false);

  // Defensive programming: Ensure phases exist
  const phases = journey.phases || [];
  const currentPhase = phases[journey.currentPhaseIndex];
  
  if (!currentPhase && phases.length > 0) {
    return null;
  }

  const isJourneyComplete = phases.every(p => p.isCompleted);
  const canStart = !journey.isStarted && !isJourneyComplete;

  const handleAction = async (action: () => void) => {
    setLoading(true);
    await action();
    setLoading(false);
  };

  return (
    <div 
      className={`group rounded-xl border p-5 transition-all duration-300 ${
        isCustom 
           ? 'bg-motiora-accent/5 border-motiora-accent/30 hover:bg-motiora-accent/10'
           : journey.isStarted 
              ? 'bg-motiora-card border-motiora-accent/30 shadow-lg shadow-motiora-accent/5' 
              : 'bg-motiora-card/50 border-motiora-soft hover:bg-motiora-card cursor-pointer'
      } ${loading ? 'opacity-70 pointer-events-none' : ''}`}
      onClick={() => {
        if (canStart) handleAction(() => onStart(journey.id));
      }}
    >
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-2">
            {isCustom && <Sparkles size={14} className="text-motiora-accent" />}
            <h3 className={`text-lg font-medium pr-4 ${isCustom ? 'text-motiora-accent' : 'text-white'}`}>{journey.title}</h3>
        </div>
        
        <div className="flex items-center gap-2">
            {isJourneyComplete ? (
                <span className="text-xs font-mono text-motiora-accent bg-motiora-accent/10 px-2 py-1 rounded flex items-center gap-1">
                <Flag size={10} /> DONE
                </span>
            ) : journey.isStarted ? (
            <span className="text-xs font-mono text-motiora-accent bg-motiora-accent/10 px-2 py-1 rounded">ACTIVE</span>
            ) : (
            <div className="p-1 rounded-full bg-motiora-soft/30 text-motiora-muted group-hover:text-white transition-colors">
                <ChevronRight size={16} />
            </div>
            )}
            
            {isCustom && (
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        if (isConfirmingDelete) {
                           handleAction(() => onDelete(journey.id));
                        } else {
                           setIsConfirmingDelete(true);
                           setTimeout(() => setIsConfirmingDelete(false), 3000);
                        }
                    }}
                    className={`p-1.5 rounded-lg transition-all ml-1 flex items-center gap-1 ${
                        isConfirmingDelete 
                        ? 'bg-red-500 text-white hover:bg-red-600' 
                        : 'text-motiora-muted hover:text-red-400 hover:bg-red-400/10'
                    }`}
                    title={isConfirmingDelete ? "Click to Confirm Delete" : "Delete Path"}
                >
                    <Trash2 size={14} />
                    {isConfirmingDelete && <span className="text-[10px] font-medium pr-1">Confirm</span>}
                </button>
            )}
        </div>
      </div>
      
      <p className="text-sm text-motiora-muted mb-4 leading-relaxed">
        {journey.description}
      </p>

      {journey.isStarted && !isJourneyComplete && currentPhase && (
        <div 
          className="space-y-4 mt-4 pt-4 border-t border-motiora-soft/30 animate-fade-in"
          onClick={(e) => e.stopPropagation()} 
        >
          <div className="flex items-center gap-3 text-sm">
            <div className="w-6 h-6 rounded-full bg-motiora-accent/20 flex items-center justify-center text-motiora-accent text-xs">
              {journey.currentPhaseIndex + 1}
            </div>
            <span className="text-motiora-text font-medium">
              Phase: {currentPhase.title}
            </span>
          </div>
          
          <div className="bg-motiora-dark/50 rounded-lg p-4 text-sm text-motiora-text leading-relaxed border border-motiora-soft/20">
            <p className="mb-3">{currentPhase.content}</p>
            <div className="flex items-start gap-2 text-motiora-muted text-xs italic bg-motiora-soft/10 p-2 rounded">
                <span className="font-semibold not-italic">Action:</span>
                "{currentPhase.action}"
            </div>
          </div>

          <Button 
            variant="primary"
            className="w-full py-2 text-xs flex items-center justify-center gap-2"
            onClick={() => handleAction(() => onCompletePhase(journey.id))}
            isLoading={loading}
          >
            <CheckCircle size={14} />
            Mark Phase as Complete
          </Button>
        </div>
      )}

      {isJourneyComplete && (
          <div className="mt-4 pt-4 border-t border-motiora-soft/30 animate-fade-in text-center">
            <p className="text-sm text-motiora-accent mb-2">You have walked this full path.</p>
            <p className="text-xs text-motiora-muted">Feel free to revisit it anytime you need grounding.</p>
          </div>
      )}

      {canStart && (
        <button 
          onClick={(e) => {
            e.stopPropagation();
            handleAction(() => onStart(journey.id));
          }}
          className="flex items-center gap-2 text-sm text-motiora-accent hover:text-emerald-400 transition-colors"
        >
          <PlayCircle size={16} />
          Begin this journey
        </button>
      )}
    </div>
  );
};

const Journeys: React.FC = () => {
  const [journeys, setJourneys] = useState<Journey[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadJourneys = async () => {
    const data = await storageService.getJourneys();
    setJourneys(data);
    setIsLoading(false);
  };

  useEffect(() => {
    loadJourneys();
  }, []);

  const handleStart = async (id: string) => {
    await storageService.startJourney(id);
    loadJourneys();
  };

  const handleCompletePhase = async (id: string) => {
    await storageService.completeJourneyPhase(id);
    loadJourneys();
  };

  const handleDelete = async (id: string) => {
    await storageService.deleteJourney(id);
    loadJourneys();
  };

  // We only show custom journeys now (filtering happens on the fetched list)
  // Note: For firebase efficiency you might query ONLY custom journeys eventually
  const customJourneys = journeys.filter(j => !j.id.includes('static')); // Assuming simple check or just checking if list exists

  return (
    <div className="max-w-md mx-auto space-y-8 pb-24 md:pb-0">
      <header>
        <h1 className="text-2xl font-light text-white">Paths to Clarity</h1>
        <p className="text-motiora-muted text-sm mt-1">No deadlines. No pressure.</p>
      </header>
      
      {isLoading ? (
          <div className="flex justify-center py-12">
              <div className="w-6 h-6 border-2 border-motiora-accent border-t-transparent rounded-full animate-spin"></div>
          </div>
      ) : (
        <>
            {/* Custom Journeys List */}
            {journeys.length > 0 ? (
                <section className="space-y-4 animate-fade-in">
                <div className="flex items-center gap-2 text-motiora-accent border-b border-motiora-accent/20 pb-2">
                    <Sparkles size={16} />
                    <h2 className="text-sm font-medium uppercase tracking-wider">Your Personal Paths</h2>
                </div>
                <div className="space-y-4">
                    {journeys.map(j => (
                        <JourneyCard 
                        key={j.id} 
                        journey={j} 
                        onStart={handleStart} 
                        onCompletePhase={handleCompletePhase} 
                        onDelete={handleDelete}
                        isCustom={true} 
                        />
                    ))}
                </div>
                </section>
            ) : (
                <div className="bg-motiora-soft/10 border border-motiora-soft/30 rounded-xl p-8 text-center space-y-4 animate-fade-in">
                    <div className="flex justify-center text-motiora-accent mb-2">
                        <Sparkles size={32} />
                    </div>
                    <div>
                        <h3 className="text-white font-medium mb-1">No paths found yet.</h3>
                        <p className="text-sm text-motiora-muted leading-relaxed">
                        Talk to Clario to discover a path made just for you.
                        </p>
                    </div>
                    <Link to="/motivator" className="inline-flex items-center gap-2 text-sm text-motiora-dark bg-motiora-accent hover:bg-emerald-400 transition-colors rounded-lg px-6 py-3 font-medium">
                    Start a Conversation
                    </Link>
                </div>
            )}
        </>
      )}
    </div>
  );
};

export default Journeys;