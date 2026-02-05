import React from 'react';
import { User, Cat, Dog, Rabbit, Bird, Turtle, Snail, Leaf, TreeDeciduous, Flower2, Zap, Fish, Cloud } from 'lucide-react';

export const AVATARS = [
  { id: 'default', icon: User, color: 'bg-slate-700 text-slate-200', label: 'Default' },
  { id: 'cat', icon: Cat, color: 'bg-orange-500/20 text-orange-400', label: 'Cat' },
  { id: 'dog', icon: Dog, color: 'bg-amber-600/20 text-amber-400', label: 'Dog' },
  { id: 'rabbit', icon: Rabbit, color: 'bg-pink-500/20 text-pink-400', label: 'Rabbit' },
  { id: 'bird', icon: Bird, color: 'bg-sky-500/20 text-sky-400', label: 'Bird' },
  { id: 'turtle', icon: Turtle, color: 'bg-emerald-600/20 text-emerald-400', label: 'Turtle' },
  { id: 'fish', icon: Fish, color: 'bg-blue-600/20 text-blue-400', label: 'Fish' },
  { id: 'snail', icon: Snail, color: 'bg-indigo-500/20 text-indigo-400', label: 'Snail' },
  { id: 'leaf', icon: Leaf, color: 'bg-green-500/20 text-green-400', label: 'Leaf' },
  { id: 'flower', icon: Flower2, color: 'bg-rose-500/20 text-rose-400', label: 'Flower' },
  { id: 'tree', icon: TreeDeciduous, color: 'bg-teal-700/30 text-teal-400', label: 'Tree' },
  { id: 'cloud', icon: Cloud, color: 'bg-slate-500/30 text-slate-300', label: 'Cloud' },
  { id: 'spark', icon: Zap, color: 'bg-yellow-500/20 text-yellow-400', label: 'Spark' },
];

interface AvatarProps {
  id?: string;
  size?: number;
  className?: string;
}

export const Avatar: React.FC<AvatarProps> = ({ id = 'default', size = 40, className = '' }) => {
  const avatar = AVATARS.find(a => a.id === id) || AVATARS[0];
  const Icon = avatar.icon;
  
  return (
    <div 
      className={`rounded-full flex items-center justify-center border border-white/5 ${avatar.color} ${className}`}
      style={{ width: size, height: size, minWidth: size, minHeight: size }}
    >
      <Icon size={size * 0.5} strokeWidth={1.5} />
    </div>
  );
};

export default Avatar;