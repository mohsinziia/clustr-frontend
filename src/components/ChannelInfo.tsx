import React from 'react';
import { Link } from 'react-router-dom';
import type { Owner } from '../types';
import { useAuth } from '../context/AuthContext'; // Import your new Auth hook
import { UserPlus, UserCheck, Bell, ShieldCheck, User as UserIcon } from 'lucide-react';

interface ChannelInfoProps {
  owner: Owner;
  onSubscribe: (channelId: string) => void;
  variant?: 'light' | 'dark';
}

export const ChannelInfo: React.FC<ChannelInfoProps> = ({ owner, onSubscribe, variant = 'light' }) => {
  const { user } = useAuth(); // Access the logged-in user state
  const isDark = variant === 'dark';

  // Guardrail: Check if the viewed channel belongs to the logged-in user
  const isMe = user?._id === owner._id;

  const formatCount = (num: number = 0) => {
    return Intl.NumberFormat('en-US', {
      notation: "compact",
      maximumFractionDigits: 1
    }).format(num);
  };

  // Helper to extract the URL regardless of format
  const avatarUrl = typeof owner.avatar === 'string'
    ? owner.avatar
    : (owner.avatar as any)?.url; // Fallback if it's an object

  return (
    <div className={`flex items-center justify-between p-5 rounded-3xl border transition-all ${isDark
      ? 'bg-white/5 border-white/10 text-white backdrop-blur-md'
      : 'bg-white border-gray-100 shadow-sm text-gray-900'
      }`}>

      {/* Clickable Identity Section */}
      <Link
        to={`/channel/${owner.username}`}
        className="flex items-center gap-4 group cursor-pointer"
      >
        <div className="relative">
          <img
            src={avatarUrl || '/default-avatar.png'} // TODO: Fallback to default avatar if URL is missing (add default-avatar.png in public folder)
            alt={owner.username}
            className={`w-14 h-14 rounded-full object-cover border-2 transition-all group-hover:border-blue-500 ${isDark ? 'border-blue-500/30' : 'border-blue-100'
              }`}
          />
          {owner.isSubscribed && !isMe && (
            <div className="absolute -bottom-1 -right-1 bg-blue-600 border-2 border-white rounded-full p-1 shadow-lg">
              <Bell size={12} className="text-white fill-current" />
            </div>
          )}
        </div>

        <div>
          <div className="flex items-center gap-1.5">
            <h3 className="font-extrabold text-lg tracking-tight group-hover:text-blue-500 transition-colors">
              {owner.fullName || owner.username}
            </h3>
            {(owner.subscribersCount ?? 0) > 10 && (
              <ShieldCheck size={16} className="text-blue-500 fill-blue-500/10" />
            )}
          </div>
          <p className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            @{owner?.username?.toLowerCase() || 'unknown'} •
            <span className={`ml-1 ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
              {formatCount(owner.subscribersCount)} subscribers
            </span>
          </p>
        </div>
      </Link>

      {/* Action Button Section */}
      <div className="flex items-center gap-2">
        {isMe ? (
          // Rendered if the user is looking at their own profile
          <div className={`flex items-center gap-2 px-5 py-2 rounded-full text-xs font-bold uppercase tracking-widest border ${isDark ? 'bg-white/5 border-white/10 text-gray-400' : 'bg-gray-50 border-gray-200 text-gray-500'
            }`}>
            <UserIcon size={14} />
            Your Channel
          </div>
        ) : (
          // Standard Subscribe Button for other users
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onSubscribe(owner._id);
            }}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-full font-bold text-sm transition-all active:scale-95 shadow-sm ${owner.isSubscribed
              ? (isDark
                ? 'bg-white/10 text-gray-300 hover:bg-white/20 border border-white/10'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200')
              : 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-blue-500/20'
              }`}
          >
            {owner.isSubscribed ? (
              <>
                <UserCheck size={18} />
                <span>Subscribed</span>
              </>
            ) : (
              <>
                <UserPlus size={18} />
                <span>Subscribe</span>
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
};