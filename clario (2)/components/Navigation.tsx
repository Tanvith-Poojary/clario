import React from 'react';
import { Home, Compass, MessageCircle, FileText } from 'lucide-react';
import { useLocation, Link } from 'react-router-dom';
import { Logo } from './Logo';

const NavItem = ({ to, icon: Icon, label, active }: { to: string; icon: any; label: string; active: boolean }) => (
  <Link
    to={to}
    className={`flex flex-col items-center justify-center p-2 transition-colors duration-300 ${
      active ? 'text-motiora-accent' : 'text-motiora-muted hover:text-motiora-text'
    }`}
  >
    <Icon size={24} strokeWidth={active ? 2.5 : 2} />
    <span className="text-[10px] mt-1 font-medium tracking-wide">{label}</span>
  </Link>
);

const Navigation: React.FC = () => {
  const location = useLocation();
  const currentPath = location.pathname;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-motiora-card/90 backdrop-blur-md border-t border-motiora-soft md:left-0 md:top-0 md:bottom-0 md:w-24 md:border-r md:border-t-0 md:flex md:flex-col md:justify-center z-50">
      <div className="flex justify-around items-center h-16 md:flex-col md:h-auto md:gap-8 md:w-full">
        <NavItem to="/" icon={Home} label="Home" active={currentPath === '/'} />
        <NavItem to="/journeys" icon={Compass} label="Paths" active={currentPath === '/journeys'} />
        <NavItem to="/motivator" icon={Logo} label="Clario" active={currentPath === '/motivator'} />
        <NavItem to="/community" icon={MessageCircle} label="Community" active={currentPath === '/community'} />
        <NavItem to="/letters" icon={FileText} label="Letters" active={currentPath === '/letters'} />
      </div>
    </nav>
  );
};

export default Navigation;