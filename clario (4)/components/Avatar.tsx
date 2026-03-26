import React from 'react';
import { 
  User, Cat, Dog, Rabbit, Bird, Turtle, Snail, Leaf, TreeDeciduous, Flower2, Zap, Fish, Cloud,
  Ghost, Flame, Moon, Sun, Star, Heart, Music, Gamepad2, Coffee, Camera, Crown, Rocket, Anchor, Umbrella, Snowflake, Droplet, Mountain, Bug
} from 'lucide-react';

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
  { id: 'ghost', icon: Ghost, color: 'bg-purple-500/20 text-purple-400', label: 'Ghost' },
  { id: 'flame', icon: Flame, color: 'bg-red-500/20 text-red-400', label: 'Flame' },
  { id: 'moon', icon: Moon, color: 'bg-indigo-600/20 text-indigo-400', label: 'Moon' },
  { id: 'sun', icon: Sun, color: 'bg-amber-500/20 text-amber-400', label: 'Sun' },
  { id: 'star', icon: Star, color: 'bg-yellow-400/20 text-yellow-300', label: 'Star' },
  { id: 'heart', icon: Heart, color: 'bg-rose-600/20 text-rose-400', label: 'Heart' },
  { id: 'music', icon: Music, color: 'bg-fuchsia-500/20 text-fuchsia-400', label: 'Music' },
  { id: 'gamepad', icon: Gamepad2, color: 'bg-violet-500/20 text-violet-400', label: 'Gamepad' },
  { id: 'coffee', icon: Coffee, color: 'bg-amber-700/30 text-amber-500', label: 'Coffee' },
  { id: 'camera', icon: Camera, color: 'bg-slate-600/20 text-slate-400', label: 'Camera' },
  { id: 'crown', icon: Crown, color: 'bg-amber-400/20 text-amber-400', label: 'Crown' },
  { id: 'rocket', icon: Rocket, color: 'bg-red-600/20 text-red-500', label: 'Rocket' },
  { id: 'anchor', icon: Anchor, color: 'bg-blue-700/30 text-blue-500', label: 'Anchor' },
  { id: 'umbrella', icon: Umbrella, color: 'bg-cyan-500/20 text-cyan-400', label: 'Umbrella' },
  { id: 'snowflake', icon: Snowflake, color: 'bg-sky-400/20 text-sky-300', label: 'Snowflake' },
  { id: 'droplet', icon: Droplet, color: 'bg-blue-500/20 text-blue-400', label: 'Droplet' },
  { id: 'mountain', icon: Mountain, color: 'bg-slate-500/20 text-slate-400', label: 'Mountain' },
  { id: 'bug', icon: Bug, color: 'bg-lime-500/20 text-lime-400', label: 'Bug' },
];

interface AvatarProps {
  id?: string;
  size?: number;
  className?: string;
}

export const Avatar: React.FC<AvatarProps> = ({ id = 'default', size = 40, className = '' }) => {
  if (id && id.startsWith('data:image')) {
    return (
      <div 
        className={`rounded-full overflow-hidden border border-white/10 ${className}`}
        style={{ width: size, height: size, minWidth: size, minHeight: size }}
      >
        <img src={id} alt="Avatar" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
      </div>
    );
  }

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