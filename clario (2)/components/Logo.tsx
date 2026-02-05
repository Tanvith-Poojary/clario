import React from 'react';

interface LogoProps {
  size?: number;
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({ size = 24, className = "" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    {/* Solid Leaf Shape */}
    <path 
      d="M12 2C5 8 4 15 12 22C20 15 19 8 12 2Z" 
      fill="currentColor"
    />
    
    {/* Central Vein - Lighter Overlay */}
    <path 
      d="M12 2.5V21.5" 
      stroke="white" 
      strokeOpacity="0.4" 
      strokeWidth="1.5" 
      strokeLinecap="round"
    />
  </svg>
);

export default Logo;