
import React from 'react';
import { ArrowLeft, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

const Resources: React.FC = () => {
  return (
    <div className="max-w-md mx-auto space-y-6 pb-20 md:pb-0 animate-fade-in">
      <header className="flex items-center gap-4 border-b border-motiora-soft/30 pb-4">
        <Link to="/profile" className="p-2 -ml-2 text-motiora-muted hover:text-white transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-light text-white">Professional Hub</h1>
        </div>
      </header>

      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="p-4 bg-motiora-soft/10 rounded-full mb-4 text-motiora-muted">
             <Clock size={32} />
        </div>
        <h2 className="text-xl font-medium text-white mb-2">Coming Soon</h2>
        <p className="text-sm text-motiora-muted max-w-[260px] leading-relaxed">
          We are currently curating a list of trusted professional resources to support your journey.
        </p>
      </div>
    </div>
  );
};

export default Resources;
