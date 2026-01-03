
import React, { useState, useEffect, useCallback } from 'react';
import { 
  Twitter, 
  Wallet, 
  CheckCircle2, 
  AlertCircle, 
  ShieldCheck,
  Zap, 
  Info,
  Loader2,
  X,
  Lock,
  LogOut,
  RefreshCcw,
  History,
  Clock,
  Sparkles,
  UserCheck,
  Globe,
  Trophy,
  Calendar,
  Share2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import sdk from '@farcaster/frame-sdk';
import { 
  UserStats, 
  ScoreBreakdown, 
  BadgeTier, 
  ClaimRecord,
  SNAPSHOT_FREEZE, 
  CLAIM_START,
  CLAIM_END
} from './types';
import { getBasedMessage, generateBadgeImage, generateAppLogo } from './services/geminiService';
import BadgeDisplay from './components/BadgeDisplay';
import { FarcasterLogo } from './constants';

interface LeaderboardUser {
  rank: number;
  username: string;
  score: number;
  lastChange?: 'up' | 'down' | null;
  previousRank?: number;
}

const INITIAL_LEADERBOARD: LeaderboardUser[] = Array.from({ length: 100 }, (_, i) => ({
  rank: i + 1,
  username: `based_user_${i + 1}`,
  score: 1000 - i * 9.5
}));

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<UserStats | null>(null);
  const [score, setScore] = useState<ScoreBreakdown | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>(INITIAL_LEADERBOARD);
  const [loading, setLoading] = useState(false);
  const [farcasterLoading, setFarcasterLoading] = useState(false);
  const [identityLoading, setIdentityLoading] = useState(false);
  const [twitterSyncing, setTwitterSyncing] = useState(false);
  const [farcasterStep, setFarcasterStep] = useState(0);
  const [claiming, setClaiming] = useState(false);
  const [hasClaimed, setHasClaimed] = useState(false);
  const [claimHistory, setClaimHistory] = useState<ClaimRecord[]>([]);
  const [generatingImage, setGeneratingImage] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [aiMessage, setAiMessage] = useState<string>("");
  const [badgeImageUrl, setBadgeImageUrl] = useState<string | null>(null);
  const [appLogoUrl, setAppLogoUrl] = useState<string | null>(null);
  const [now, setNow] = useState(new Date());
  const [view, setView] = useState<'dash' | 'ranks'>('dash');
  const [fid, setFid] = useState<number | null>(null);

  const isFrozen = now >= SNAPSHOT_FREEZE;
  const isClaimable = now >= CLAIM_START && now <= CLAIM_END;
  const isExpired = now > CLAIM_END;

  const calculateScore = useCallback(async (user: UserStats) => {
    setLoading(true);
    const basePoints = Math.min((user.baseAppAgeDays / 730) * 100 * 0.20, 20);
    const twitterPoints = Math.min((user.twitterAgeDays / 3650) * 100 * 0.30, 30);
    const contributionPoints = Math.min((user.tweetCount / 500) * 100 * 0.50, 50);
    const total = basePoints + twitterPoints + contributionPoints + (user.farcasterConnected ? 5 : 0);
    setScore({ baseAppPoints: basePoints, twitterAgePoints: twitterPoints, contributionPoints: contributionPoints, totalScore: total });
    
    const tier = getTier(user.rank);
    const effectiveName = user.displayName || user.username;
    
    getBasedMessage(effectiveName, user.rank, total).then(setAiMessage);
    
    if (tier !== BadgeTier.NONE) {
      setGeneratingImage(true);
      const img = await generateBadgeImage(tier, effectiveName, user.rank);
      setBadgeImageUrl(img);
      setGeneratingImage(false);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    const init = async () => {
      try {
        generateAppLogo().then(setAppLogoUrl);
        const context = await sdk.context;
        if (context?.user) {
          const userFid = context.user.fid;
          setFid(userFid);
          const userData: UserStats = {
            rank: Math.floor(Math.random() * 500) + 1,
            username: context.user.username || `fid_${userFid}`,
            displayName: context.user.username,
            identityType: 'FNAME',
            baseAppAgeDays: 300,
            twitterAgeDays: 800,
            tweetCount: 120,
            lamboLessBalance: 2.0,
            walletConnected: true,
            twitterConnected: true,
            farcasterConnected: true
          };
          setCurrentUser(userData);
          const claimKey = `claimed_fid_${userFid}`;
          const historyKey = `history_fid_${userFid}`;
          if (localStorage.getItem(claimKey)) setHasClaimed(true);
          const savedHistory = localStorage.getItem(historyKey);
          if (savedHistory) setClaimHistory(JSON.parse(savedHistory));
        }
        sdk.actions.ready();
      } catch (e) {
        console.error("Initialization failed:", e);
      }
    };
    init();
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (isFrozen) return;
    const interval = setInterval(() => {
      setLeaderboard(prev => {
        const newLeaderboard = [...prev];
        const numUpdates = Math.floor(Math.random() * 2) + 1;
        for (let i = 0; i < numUpdates; i++) {
          const idx = Math.floor(Math.random() * newLeaderboard.length);
          const change = (Math.random() - 0.4) * 15;
          newLeaderboard[idx] = { ...newLeaderboard[idx], score: Math.max(0, newLeaderboard[idx].score + change), lastChange: change > 0 ? 'up' : 'down' };
        }
        return [...newLeaderboard].sort((a, b) => b.score - a.score).map((user, index) => ({ ...user, previousRank: user.rank, rank: index + 1 }));
      });
      setTimeout(() => setLeaderboard(prev => prev.map(u => ({ ...u, lastChange: null }))), 1500);
    }, 4000);
    return () => clearInterval(interval);
  }, [isFrozen]);

  const connectWallet = () => {
    if (fid) return;
    setLoading(true);
    setHasClaimed(false);
    setTimeout(() => {
      const newUser: UserStats = {
        rank: 42,
        username: "Vitalik_Enjoyer",
        displayName: "Vitalik_Enjoyer",
        identityType: 'NONE',
        baseAppAgeDays: 450,
        twitterAgeDays: 1200,
        tweetCount: 85,
        lamboLessBalance: 2.50,
        walletConnected: true,
        twitterConnected: true,
        farcasterConnected: false
      };
      setCurrentUser(newUser);
      setLoading(false);
    }, 1000);
  };

  const resolveIdentity = async () => {
    if (!currentUser || identityLoading) return;
    setIdentityLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setCurrentUser(prev => {
      if (!prev) return null;
      const isENS = Math.random() > 0.5;
      return {
        ...prev,
        displayName: isENS ? `${prev.username}.eth` : `@${prev.username}`,
        identityType: isENS ? 'ENS' : 'FNAME'
      };
    });
    setIdentityLoading(false);
    if (score) calculateScore(currentUser);
  };

  const syncTwitterData = async () => {
    if (!currentUser || twitterSyncing || hasClaimed) return;
    setTwitterSyncing(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    const updatedUser = { ...currentUser, twitterAgeDays: currentUser.twitterAgeDays + Math.floor(Math.random() * 5), tweetCount: currentUser.tweetCount + Math.floor(Math.random() * 25) + 5 };
    setCurrentUser(updatedUser);
    setTwitterSyncing(false);
    if (score) calculateScore(updatedUser);
  };

  const connectFarcaster = async () => {
    if (!currentUser || currentUser.farcasterConnected) return;
    setFarcasterLoading(true);
    setFarcasterStep(1);
    setTimeout(() => setFarcasterStep(2), 500);
    setTimeout(() => setFarcasterStep(3), 1000);
    await new Promise(resolve => setTimeout(resolve, 1500));
    const updatedUser: UserStats = { ...currentUser, farcasterConnected: true, identityType: 'FNAME', displayName: currentUser.username };
    setCurrentUser(updatedUser);
    setFarcasterLoading(false);
    setFarcasterStep(0);
    if (score) calculateScore(updatedUser);
  };

  const getTier = (rank: number): BadgeTier => {
    if (rank >= 1 && rank <= 5) return BadgeTier.PLATINUM;
    if (rank >= 6 && rank <= 25) return BadgeTier.GOLD;
    if (rank >= 26 && rank <= 500) return BadgeTier.SILVER;
    if (rank >= 501 && rank <= 1000) return BadgeTier.BRONZE;
    return BadgeTier.NONE;
  };

  const handleManualCalculate = () => {
    if (currentUser) calculateScore(currentUser);
  };

  const regenerateDesign = async () => {
    if (!currentUser || generatingImage) return;
    const tier = getTier(currentUser.rank);
    if (tier === BadgeTier.NONE) return;
    setGeneratingImage(true);
    const img = await generateBadgeImage(tier, currentUser.displayName || currentUser.username, currentUser.rank);
    if (img) setBadgeImageUrl(img);
    setGeneratingImage(false);
  };

  const initiateClaim = () => {
    if (hasClaimed) return alert("Already claimed.");
    if (isExpired) return alert("The claim window has closed.");
    if (!isClaimable) return alert("Claim window is not yet active.");
    if (currentUser && (currentUser.rank > 1000 || currentUser.lamboLessBalance < 1 || !currentUser.farcasterConnected)) return alert("Ineligible.");
    setShowConfirmModal(true);
  };

  const executeClaim = () => {
    if (!currentUser) return;
    setShowConfirmModal(false); setClaiming(true);
    setTimeout(() => {
      const tier = getTier(currentUser.rank);
      const newRecord: ClaimRecord = { tier, rank: currentUser.rank, timestamp: new Date().toISOString(), id: Math.random().toString(36).substring(7) };
      const updatedHistory = [newRecord, ...claimHistory];
      setClaimHistory(updatedHistory); setHasClaimed(true); setClaiming(false);
      localStorage.setItem(fid ? `claimed_fid_${fid}` : 'guest_claimed', 'true');
      localStorage.setItem(fid ? `history_fid_${fid}` : 'guest_history', JSON.stringify(updatedHistory));
      alert("NFT Claimed!");
    }, 2000);
  };

  const handleGlobalShare = () => {
    const text = "🔵 Check your contribution score on BASED IMPRESSION! \n\nI'm earning my $LAMBOLESS future on @base with @baseapp. Join the movement! 🏎️💨";
    const appUrl = "https://based-impression.vercel.app";
    const url = `https://warpcast.com/~/compose?text=${encodeURIComponent(text)}&embeds[]=${encodeURIComponent(appUrl)}`;
    window.open(url, '_blank');
  };

  const closeFrame = () => sdk.actions.close();
  const formatDate = (isoString: string) => new Date(isoString).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  const getTierColorClass = (tier: BadgeTier) => {
    switch (tier) {
      case BadgeTier.PLATINUM: return 'text-white border-white bg-white/10';
      case BadgeTier.GOLD: return 'text-yellow-500 border-yellow-500/50 bg-yellow-500/10';
      case BadgeTier.SILVER: return 'text-slate-400 border-slate-400/50 bg-slate-400/10';
      case BadgeTier.BRONZE: return 'text-purple-400 border-purple-400/50 bg-purple-400/10';
      default: return 'text-gray-500 border-gray-500/50';
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center p-4 md:p-6 bg-black text-white selection:bg-base-blue overflow-x-hidden">
      <AnimatePresence>
        {farcasterLoading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl">
            <motion.div initial={{ scale: 0.9, y: 10 }} animate={{ scale: 1, y: 0 }} className="w-full max-w-sm glass-card rounded-3xl p-8 border-base-blue/30 text-center flex flex-col items-center gap-6">
              <div className="relative"><div className="w-20 h-20 bg-purple-500/20 rounded-full flex items-center justify-center animate-pulse"><FarcasterLogo className="w-10 h-10 text-purple-500" /></div><div className="absolute inset-0 border-2 border-base-blue rounded-full border-t-transparent animate-spin" /></div>
              <div className="space-y-2"><h3 className="text-xl font-bold uppercase tracking-tighter">Syncing Farcaster</h3><p className="text-sm text-gray-400 font-medium">{farcasterStep === 1 && "Fetching Warpcast context..."}{farcasterStep === 2 && "Verifying FID and Username..."}{farcasterStep === 3 && "Linking Based Impression..."}</p></div>
              <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden"><motion.div initial={{ width: "0%" }} animate={{ width: `${(farcasterStep / 3) * 100}%` }} className="h-full bg-base-blue shadow-[0_0_10px_#0052FF]" /></div>
              <div className="flex items-center gap-2 text-[10px] text-base-blue font-bold uppercase tracking-widest opacity-60"><RefreshCcw className="w-3 h-3 animate-reverse-spin" />Secure Protocol</div>
            </motion.div>
          </motion.div>
        )}
        {showConfirmModal && currentUser && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} className="w-full max-md glass-card rounded-3xl p-6 border-white/20 shadow-2xl">
              <div className="flex justify-between items-center mb-6"><h3 className="text-xl font-bold flex items-center gap-2"><Lock className="w-5 h-5 text-base-blue" />Confirm Claim</h3><button onClick={() => setShowConfirmModal(false)} className="text-gray-400 hover:text-white transition-colors"><X className="w-6 h-6" /></button></div>
              <div className="space-y-4 mb-8"><p className="text-sm text-gray-400 leading-relaxed">Confirm your one-time claim for the <span className="text-white font-bold">{getTier(currentUser.rank)}</span> tier badge.</p><div className="bg-white/5 rounded-2xl p-4 space-y-2 border border-white/5"><div className="flex justify-between text-xs"><span className="text-gray-500">Tier:</span><span className="font-bold text-base-blue">{getTier(currentUser.rank)}</span></div><div className="flex justify-between text-xs"><span className="text-gray-500">Claim Limit:</span><span className="text-red-400 font-bold uppercase text-[9px]">1 per account</span></div></div></div>
              <div className="flex gap-4"><button onClick={() => setShowConfirmModal(false)} className="flex-1 py-3 rounded-2xl border border-white/10 font-bold hover:bg-white/5 transition-colors">Cancel</button><button onClick={executeClaim} className="flex-1 py-3 bg-base-blue rounded-2xl font-bold hover:brightness-110 transition-all shadow-[0_0_20px_rgba(0,82,255,0.3)]">Confirm</button></div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <header className="w-full max-w-5xl flex justify-between items-center mb-8">
        <div className="flex items-center gap-3">
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="w-12 h-12 bg-base-blue/20 rounded-xl flex items-center justify-center overflow-hidden border border-white/10 shadow-lg"
          >
            {appLogoUrl ? (
              <img src={appLogoUrl} alt="App Logo" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center font-bold text-lg animate-pulse bg-base-blue text-white">B</div>
            )}
          </motion.div>
          <div className="flex flex-col">
            <h1 className="text-xl font-black tracking-tighter uppercase hidden sm:block leading-none">Based Impression</h1>
            {currentUser?.displayName && <span className="text-[10px] font-mono text-base-blue font-bold tracking-tighter uppercase sm:block hidden">{currentUser.displayName}</span>}
          </div>
          <h1 className="text-xl font-extrabold tracking-tighter uppercase sm:hidden">BASED</h1>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={handleGlobalShare}
            className="p-2 bg-base-blue rounded-full hover:brightness-110 transition-all shadow-[0_0_15px_rgba(0,82,255,0.4)] group"
            title="Share App"
          >
            <Share2 className="w-4 h-4 text-white group-hover:scale-110 transition-transform" />
          </button>
          <button onClick={() => setView('ranks')} className={`text-xs font-bold transition-colors ${view === 'ranks' ? 'text-base-blue' : 'text-gray-400'}`}>LEADERS</button>
          <button onClick={() => setView('dash')} className={`text-xs font-bold transition-colors ${view === 'dash' ? 'text-base-blue' : 'text-gray-400'}`}>DASH</button>
          <button onClick={closeFrame} className="p-2 bg-white/5 rounded-full hover:bg-white/10 transition-colors"><LogOut className="w-4 h-4 text-gray-400" /></button>
        </div>
      </header>

      <main className="w-full max-w-5xl">
        {view === 'dash' ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <section className="glass-card rounded-3xl p-6 relative overflow-hidden">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-lg font-bold mb-1 flex items-center gap-2">
                      {currentUser?.displayName || "Your Impact"}
                      {currentUser?.identityType === 'ENS' && <Globe className="w-4 h-4 text-sky-400" title="ENS Resolved" />}
                      {currentUser?.identityType === 'FNAME' && <UserCheck className="w-4 h-4 text-purple-400" title="fName Verified" />}
                    </h3>
                    <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Farcaster fid: {fid || 'Guest'}</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={resolveIdentity} disabled={!currentUser || identityLoading || hasClaimed} className="p-3 bg-white/5 border border-white/10 text-white rounded-xl hover:bg-white/10 transition-colors disabled:opacity-30" title="Personalize via ENS/fName">
                      {identityLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Globe className="w-5 h-5 text-sky-400" />}
                    </button>
                    <button onClick={syncTwitterData} disabled={!currentUser || twitterSyncing || hasClaimed} className="p-3 bg-white/5 border border-white/10 text-white rounded-xl hover:bg-white/10 transition-colors disabled:opacity-30 group" title="Sync Twitter">
                      {twitterSyncing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Twitter className="w-5 h-5 text-sky-400 group-hover:scale-110 transition-transform" />}
                    </button>
                    <button onClick={handleManualCalculate} disabled={!currentUser || loading || generatingImage || hasClaimed} className="p-3 bg-white text-black rounded-xl hover:bg-gray-200 transition-colors disabled:opacity-30 shadow-[0_0_15px_rgba(255,255,255,0.2)]">
                      {loading || generatingImage ? <Loader2 className="w-5 h-5 animate-spin" /> : <ShieldCheck className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
                {!score ? (
                  <div className="h-40 flex flex-col items-center justify-center border-2 border-dashed border-white/10 rounded-2xl"><Zap className="w-8 h-8 text-gray-500 mb-2" /><p className="text-gray-500 text-sm">Hit the checkpoint to calculate</p>{!currentUser && <button onClick={connectWallet} className="mt-4 text-xs text-base-blue hover:underline font-bold">Connect Account</button>}</div>
                ) : (
                  <div className="space-y-6">
                    <div className="flex items-end gap-2"><motion.span key={score.totalScore} initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-5xl font-black tracking-tighter">{score.totalScore.toFixed(2)}</motion.span><span className="text-base-blue font-bold mb-2 uppercase text-[10px]">Points</span></div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {[
                        { label: "BaseApp Age", val: score.baseAppPoints, icon: <Info className="w-3 h-3" /> },
                        { label: "Twitter Age", val: score.twitterAgePoints, icon: <Twitter className="w-3 h-3" /> },
                        { label: "Social Action", val: score.contributionPoints + (currentUser?.farcasterConnected ? 5 : 0), icon: <RefreshCcw className="w-3 h-3" /> }
                      ].map((item) => (
                        <div key={item.label} className="bg-white/5 p-4 rounded-2xl border border-white/5 relative group">
                          <div className="flex justify-between items-start mb-1"><p className="text-[9px] text-gray-500 uppercase font-black">{item.label}</p><div className="opacity-0 group-hover:opacity-40 transition-opacity">{item.icon}</div></div>
                          <p className="text-lg font-bold tabular-nums">{item.val.toFixed(2)}</p>
                          {item.label === "Twitter Age" && twitterSyncing && <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px] rounded-2xl flex items-center justify-center"><Loader2 className="w-4 h-4 animate-spin text-sky-400" /></div>}
                        </div>
                      ))}
                    </div>
                    {aiMessage && <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-base-blue/10 border border-base-blue/20 p-4 rounded-xl italic text-xs text-blue-200 leading-relaxed">"{aiMessage}"</motion.div>}
                  </div>
                )}
              </section>
              <section className="glass-card rounded-3xl p-6">
                <h4 className="font-bold mb-4 flex items-center gap-2"><Info className="w-4 h-4 text-base-blue" /> Eligibility Checklist</h4>
                <div className="space-y-3">
                   {[
                     { label: "Farcaster Connectivity", desc: "Native Frame context", check: currentUser?.farcasterConnected, icon: <FarcasterLogo className="text-purple-400" />, action: connectFarcaster, isProcessing: farcasterLoading },
                     { label: "Web3 Identity Resolver", desc: "ENS or fName Link", check: currentUser?.identityType !== 'NONE', icon: <Globe className="text-sky-400" />, action: resolveIdentity, isProcessing: identityLoading },
                     { label: "Twitter Connectivity", desc: "Linked to BaseApp", check: currentUser?.twitterConnected, icon: <Twitter className="text-sky-400" /> },
                     { label: "Leaderboard Ranking", desc: "Must be Top 1000", check: currentUser && currentUser.rank <= 1000, icon: <Trophy className="text-yellow-500" /> },
                     { label: "$LAMBOLESS Balance", desc: "Hold > $1", check: currentUser && currentUser.lamboLessBalance >= 1, icon: <Wallet className="text-purple-400" /> }
                   ].map((req, i) => (
                     <div key={i} className={`flex items-center justify-between p-3 rounded-xl border transition-all ${req.check ? "bg-white/[0.08] border-white/10" : "bg-white/5 border-white/5"}`}>
                        <div className="flex items-center gap-3"><div className="w-4 h-4">{req.icon}</div><div><p className="text-xs font-semibold">{req.label}</p><p className="text-[9px] text-gray-500">{req.desc}</p></div></div>
                        <div className="flex items-center gap-2">
                          {!req.check && req.action && currentUser && !hasClaimed && !fid && <button onClick={req.action} disabled={req.isProcessing} className="text-[9px] font-bold text-white bg-base-blue px-3 py-1.5 rounded-lg hover:brightness-110 transition-all flex items-center gap-2">Connect</button>}
                          <AnimatePresence mode="wait">
                            {req.check ? (
                              <motion.div initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} key="check" className="flex items-center gap-2">
                                {req.label === "Web3 Identity Resolver" && <span className="text-[8px] font-bold text-sky-400 uppercase tracking-tighter">{currentUser?.identityType}</span>}
                                <CheckCircle2 className="w-4 h-4 text-green-500" />
                              </motion.div>
                            ) : (!req.isProcessing && <motion.div key="alert"><AlertCircle className="w-4 h-4 text-red-500 opacity-30" /></motion.div>)}
                          </AnimatePresence>
                        </div>
                     </div>
                   ))}
                </div>
              </section>
            </div>
            <div className="lg:col-span-1 space-y-6">
              <div className="glass-card rounded-3xl p-6 flex flex-col items-center">
                <div className="w-full flex justify-between items-center mb-4"><h3 className="font-bold uppercase tracking-tighter text-xs">Based Badge</h3>{currentUser && currentUser.rank <= 1000 && score && <button onClick={regenerateDesign} disabled={generatingImage || hasClaimed} className="text-[9px] flex items-center gap-1.5 font-bold text-base-blue hover:text-white transition-colors disabled:opacity-30"><RefreshCcw className={`w-3 h-3 ${generatingImage ? 'animate-spin' : ''}`} />Regenerate</button>}</div>
                <div className="relative group scale-90 sm:scale-100">
                  {currentUser && currentUser.rank <= 1000 ? (
                    <><BadgeDisplay tier={getTier(currentUser.rank)} rank={currentUser.rank} imageUrl={badgeImageUrl} isGenerating={generatingImage} /><AnimatePresence>{hasClaimed && <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none"><div className="bg-green-500 text-white font-black text-lg px-4 py-1 rounded-full rotate-[-12deg] shadow-2xl border-2 border-white">CLAIMED</div></motion.div>}</AnimatePresence></>
                  ) : <div className="w-64 h-80 rounded-2xl border-2 border-dashed border-white/10 flex flex-col items-center justify-center text-center p-6 text-gray-600 text-sm">Enter Top 1000 to unlock</div>}
                </div>
                <div className="w-full mt-6 space-y-3">
                   <div className="flex items-center justify-center gap-2 text-[9px] font-bold text-gray-500 uppercase tracking-widest">
                     <Calendar className="w-3 h-3" />
                     Deadline: Jan 31, 23:59 UTC
                   </div>
                   <button 
                    onClick={initiateClaim} 
                    disabled={!isClaimable || claiming || !currentUser || currentUser.rank > 1000 || !currentUser.farcasterConnected || hasClaimed} 
                    className={`w-full py-3.5 rounded-2xl font-bold transition-all flex justify-center items-center gap-2 uppercase text-[10px] ${hasClaimed ? 'bg-green-600 text-white' : isExpired ? 'bg-red-900/40 text-red-500 border border-red-500/20' : 'bg-base-blue hover:brightness-110 disabled:bg-white/5 disabled:text-gray-700'}`}
                   >
                     {claiming && <Loader2 className="w-3 h-3 animate-spin" />}
                     {hasClaimed ? <><CheckCircle2 className="w-3 h-3" /> Badge Distributed</> : isExpired ? "Claim Window Closed" : isClaimable ? (claiming ? "Claiming..." : "Claim Badge") : "Locked Until Jan 16"}
                   </button>
                </div>
              </div>
              <section className="glass-card rounded-3xl p-6">
                <h4 className="font-bold mb-4 flex items-center gap-2 text-xs uppercase tracking-tighter"><History className="w-3.5 h-3.5 text-base-blue" /> Claim History</h4>
                <div className="space-y-3 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                  {claimHistory.length === 0 ? <div className="text-center py-6 border border-dashed border-white/10 rounded-xl"><Clock className="w-6 h-6 text-gray-700 mx-auto mb-2" /><p className="text-[10px] text-gray-600 uppercase font-bold">No assets found</p></div> :
                    claimHistory.map((record) => (<motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} key={record.id} className="bg-white/5 border border-white/5 p-3 rounded-xl flex items-center justify-between group hover:border-white/20 transition-all"><div className="flex items-center gap-3"><div className={`w-2 h-2 rounded-full ${getTierColorClass(record.tier).split(' ')[0].replace('text-', 'bg-')}`} /><div><p className={`text-[10px] font-black uppercase tracking-tighter ${getTierColorClass(record.tier).split(' ')[0]}`}>{record.tier}</p><p className="text-[8px] text-gray-500 font-mono">RANK #{record.rank}</p></div></div><div className="text-right"><p className="text-[8px] text-gray-500 uppercase font-black">{formatDate(record.timestamp)}</p><CheckCircle2 className="w-3 h-3 text-green-500/50 inline-block mt-1" /></div></motion.div>))}
                </div>
              </section>
            </div>
          </div>
        ) : (
          <div className="glass-card rounded-3xl overflow-hidden">
            <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/5"><div><h3 className="text-lg font-bold uppercase tracking-tighter">Live Ranking</h3><p className="text-[10px] text-gray-500 font-mono">Real-time contribution feed</p></div><div className="flex items-center gap-2 text-base-blue font-bold text-[9px] uppercase tracking-widest"><div className="w-1.5 h-1.5 bg-base-blue rounded-full animate-ping" />Live</div></div>
            <div className="max-h-[600px] overflow-y-auto">
              <table className="w-full text-left border-collapse">
                <thead className="sticky top-0 bg-black/90 backdrop-blur-md z-10 text-[9px] text-gray-500 uppercase font-black border-b border-white/10"><tr><th className="px-6 py-4">Rank</th><th className="px-6 py-4">User</th><th className="px-6 py-4 text-right">Score</th></tr></thead>
                <tbody className="relative"><AnimatePresence initial={false}>{leaderboard.map((user) => (
                  <motion.tr key={user.username} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ layout: { type: "spring", stiffness: 300, damping: 30 }, opacity: { duration: 0.2 } }} className={`border-b border-white/5 group transition-colors duration-500 ${currentUser?.username === user.username ? 'bg-base-blue/10' : 'hover:bg-white/5'}`}>
                    <td className="px-6 py-3"><span className={`text-xs font-black ${user.rank <= 5 ? 'text-blue-400' : 'text-gray-400'}`}>#{user.rank}</span></td>
                    <td className="px-6 py-3"><div className="flex items-center gap-2"><div className={`w-6 h-6 rounded-full flex items-center justify-center text-[8px] font-black ${user.rank <= 5 ? 'bg-blue-500/20 text-blue-400' : 'bg-white/5 text-gray-500'}`}>{user.username.charAt(0).toUpperCase()}</div><span className="font-mono text-xs tracking-tighter truncate max-w-[100px]">{user.username}</span></div></td>
                    <td className="px-6 py-3 text-right tabular-nums"><motion.div animate={user.lastChange ? { scale: [1, 1.2, 1], color: user.lastChange === 'up' ? "#4ade80" : "#f87171" } : { scale: 1, color: "#fff" }} className="flex items-center justify-end gap-1 text-xs font-black">{user.score.toFixed(1)}</motion.div></td>
                  </motion.tr>))}</AnimatePresence>
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
      <footer className="mt-12 opacity-30 text-[9px] uppercase font-black tracking-widest pb-6 flex items-center gap-4"><span>Based Impression</span><span className="w-1 h-1 rounded-full bg-white" /><FarcasterLogo className="w-2.5 h-2.5" /><span>V2 Frame Integrated</span><span className="w-1 h-1 rounded-full bg-white" /><span>Powered by Base</span></footer>
      <style>{`@keyframes reverse-spin { from { transform: rotate(360deg); } to { transform: rotate(0deg); } } .animate-reverse-spin { animation: reverse-spin 1s linear infinite; } .custom-scrollbar::-webkit-scrollbar { width: 2px; } .custom-scrollbar::-webkit-scrollbar-track { background: transparent; } .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.1); border-radius: 10px; }`}</style>
    </div>
  );
};

export default App;
