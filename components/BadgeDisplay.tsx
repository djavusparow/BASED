
import React from 'react';
import { BadgeTier } from '../types';
import { WarpletLogo, LamboIcon, FarcasterLogo } from '../constants';
import { Loader2, Sparkles, Twitter } from 'lucide-react';

interface BadgeDisplayProps {
  tier: BadgeTier;
  rank: number;
  imageUrl?: string | null;
  isGenerating?: boolean;
}

const BadgeDisplay: React.FC<BadgeDisplayProps> = ({ tier, rank, imageUrl, isGenerating }) => {
  const getStyles = () => {
    switch (tier) {
      case BadgeTier.PLATINUM:
        return "platinum-gradient border-4 border-white shadow-[0_0_30px_rgba(255,255,255,0.4)]";
      case BadgeTier.GOLD:
        return "bg-gradient-to-br from-yellow-300 via-yellow-500 to-yellow-700 border-4 border-yellow-200 shadow-[0_0_30px_rgba(234,179,8,0.3)]";
      case BadgeTier.SILVER:
        return "bg-gradient-to-br from-slate-300 via-slate-400 to-slate-500 border-4 border-slate-200 shadow-[0_0_30px_rgba(148,163,184,0.3)]";
      case BadgeTier.BRONZE:
        return "bg-gradient-to-br from-purple-500 via-purple-700 to-purple-900 border-4 border-purple-400 shadow-[0_0_30px_rgba(168,85,247,0.3)]";
      default:
        return "bg-gray-800 opacity-50";
    }
  };

  const getTextColor = () => {
    if (tier === BadgeTier.PLATINUM) return "text-blue-900";
    if (tier === BadgeTier.GOLD) return "text-yellow-900";
    return "text-white";
  };

  const getPlaceholderIconStyles = () => {
    switch (tier) {
      case BadgeTier.PLATINUM: return "drop-shadow-[0_0_10px_rgba(255,255,255,1)]";
      case BadgeTier.GOLD: return "drop-shadow-[0_0_10px_rgba(254,240,138,0.8)]";
      case BadgeTier.SILVER: return "drop-shadow-[0_0_10px_rgba(241,245,249,0.8)]";
      case BadgeTier.BRONZE: return "drop-shadow-[0_0_10px_rgba(192,132,252,0.8)]";
      default: return "";
    }
  };

  const handleTwitterShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    const text = `I just checked my @base contribution on BASED IMPRESSION! 🔵\n\nRank: #${rank}\nTier: ${tier} STATUS\n\nCalculating my way to a $LAMBOLESS future with @baseapp @baseposting @jessepollak @brian_armstrong. 🏎️💨\n\nCheck yours here:`;
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const handleWarpcastShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    const appUrl = "https://based-impression.vercel.app";
    const text = `I'm officially BASED! 🔵🎩\n\nJust checked my contribution on BASED IMPRESSION.\nRank: #${rank}\nTier: ${tier} STATUS\n\nEarning my $LAMBOLESS future on @base with @baseapp @baseposting @jessepollak @brian. 🏎️💨\n\nCheck yours: ${appUrl}`;
    const url = `https://warpcast.com/~/compose?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  return (
    <div className={`relative w-64 h-80 rounded-3xl flex flex-col items-center justify-between p-6 overflow-hidden transform transition-all duration-500 hover:scale-105 ${getStyles()}`}>
      <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none">
         <div className="absolute top-10 -right-10 w-48 h-48 border-2 border-white rounded-full animate-pulse"></div>
         <div className="absolute -bottom-10 -left-10 w-48 h-48 border-2 border-white rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      <div className="z-10 text-center w-full relative">
        <div className={`flex items-center justify-center gap-1 mb-1 font-black italic tracking-tighter ${getTextColor()}`}>
          <Sparkles className="w-3 h-3" />
          <h3 className="text-xs uppercase">Based Impression</h3>
          <Sparkles className="w-3 h-3" />
        </div>
        <p className={`text-[10px] font-mono font-bold opacity-80 ${getTextColor()}`}>RANKING #{rank}</p>
        
        <div className="absolute -top-2 -right-2 flex flex-col gap-2">
          <button 
            onClick={handleTwitterShare}
            className={`p-2 rounded-full backdrop-blur-md bg-white/20 border border-white/20 hover:bg-white/40 transition-all ${getTextColor()}`}
            title="Share on X"
          >
            <Twitter className="w-3 h-3" />
          </button>
          <button 
            onClick={handleWarpcastShare}
            className={`p-2 rounded-full backdrop-blur-md bg-white/20 border border-white/20 hover:bg-white/40 transition-all ${getTextColor()}`}
            title="Share on Warpcast"
          >
            <FarcasterLogo className="w-3 h-3" />
          </button>
        </div>
      </div>

      <div className="z-10 flex flex-col items-center gap-4 w-full h-44 justify-center relative group">
        {imageUrl ? (
          <div className="relative w-full h-full">
            <img 
              src={imageUrl} 
              alt="AI Generated Badge" 
              className="w-full h-full object-cover rounded-2xl shadow-2xl border border-white/30 transform transition-transform group-hover:scale-105" 
            />
            {isGenerating && (
              <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] rounded-2xl flex flex-col items-center justify-center gap-2">
                <Loader2 className="w-6 h-6 animate-spin text-white" />
                <p className="text-[8px] font-bold text-white uppercase tracking-widest">Updating...</p>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center w-full h-full bg-black/10 rounded-2xl backdrop-blur-sm border border-white/10 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
            <div className={`flex flex-col items-center gap-2 transition-all ${isGenerating ? 'opacity-30 blur-sm' : 'opacity-100'}`}>
              <WarpletLogo className={`w-24 h-24 ${getTextColor()} ${getPlaceholderIconStyles()}`} />
              <div className="flex flex-col items-center">
                <p className={`text-[10px] font-black uppercase tracking-tighter ${getTextColor()}`}>UNCLAIMED</p>
                <LamboIcon className={`w-12 h-12 ${getTextColor()} ${getPlaceholderIconStyles()} opacity-80`} />
              </div>
            </div>
            {isGenerating && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                <Loader2 className={`w-8 h-8 animate-spin ${getTextColor()}`} />
                <p className={`text-[9px] font-extrabold uppercase tracking-widest ${getTextColor()}`}>Minting Design...</p>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="z-10 text-center w-full">
        <div className={`px-4 py-1.5 rounded-xl text-[10px] font-black border-2 uppercase flex items-center justify-center gap-2 mb-2 ${getTextColor()} ${tier === BadgeTier.PLATINUM ? 'border-blue-900/50 bg-blue-900/10' : 'border-white/50 bg-white/10'}`}>
          {tier} ASSET
        </div>
        <div className={`flex items-center justify-center gap-3 opacity-60 font-mono text-[7px] ${getTextColor()}`}>
          <span>WARPLET 01</span>
          <span className="w-1 h-1 rounded-full bg-current" />
          <span>LAMBO V1</span>
          <span className="w-1 h-1 rounded-full bg-current" />
          <span>FARCASTER INTEGRATED</span>
        </div>
      </div>
      
      <style>{`
        @keyframes shimmer {
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
};

export default BadgeDisplay;
