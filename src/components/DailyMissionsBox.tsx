import React from 'react';
import confetti from 'canvas-confetti';
import { DailyMission } from '../types/game';
import { sounds } from '../services/soundEffects';
import { Target, CheckCircle2, Gift, Sparkles, Award, ArrowRight } from 'lucide-react';

interface DailyMissionsBoxProps {
  missions: DailyMission[];
  onClaimReward: (missionId: string, rewardCoins: number) => void;
  onClaimAllBonus?: (bonusCoins: number) => void;
}

export const DailyMissionsBox: React.FC<DailyMissionsBoxProps> = ({
  missions,
  onClaimReward,
  onClaimAllBonus,
}) => {
  const completedCount = missions.filter((m) => m.completed).length;
  const claimedCount = missions.filter((m) => m.claimed).length;
  const allCompleted = missions.length > 0 && completedCount === missions.length;
  const allClaimed = missions.length > 0 && claimedCount === missions.length;

  const handleClaim = (mission: DailyMission) => {
    if (!mission.completed || mission.claimed) return;
    confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
    sounds.playWin();
    sounds.playCoin();
    onClaimReward(mission.id, mission.rewardCoins);
  };

  return (
    <div className="bg-gradient-to-b from-stone-900 via-amber-950/20 to-stone-950 p-4 rounded-3xl border border-amber-500/30 shadow-xl space-y-3 relative overflow-hidden backdrop-blur-md">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-stone-800">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-300 text-lg shadow-inner">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-black text-amber-200">
              දෛනික මෙහෙයුම් (Daily Farm Missions)
            </h2>
            <p className="text-[11px] text-stone-400">
              මෙහෙයුම් සම්පූර්ණ කර දිනපතා අමතර කොයින් දිනාගන්න
            </p>
          </div>
        </div>

        {/* Progress Pill */}
        <div className="bg-amber-500/20 px-3 py-1 rounded-full border border-amber-400/40 text-[11px] font-black text-amber-300 flex items-center gap-1 shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
          <span>{completedCount} / {missions.length} සම්පූර්ණයි</span>
        </div>
      </div>

      {/* Grand Completion Mega Bonus Banner */}
      {allCompleted && !allClaimed && (
        <div className="p-3 bg-gradient-to-r from-amber-600 to-yellow-500 text-stone-950 rounded-2xl shadow-lg animate-bounce flex items-center justify-between font-black text-xs">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-stone-950" />
            <div>
              <span>සුබ පැතුම්! සියලුම මෙහෙයුම් සම්පූර්ණ කළා!</span>
              <span className="block text-[10px] opacity-90">මහා දෛනික බෝනස් හිමිවේ!</span>
            </div>
          </div>
          <span className="bg-stone-950 text-yellow-300 px-2.5 py-1 rounded-xl text-xs font-black shadow-inner">
            +100 Bonus
          </span>
        </div>
      )}

      {/* Missions List */}
      <div className="space-y-2.5">
        {missions.map((mission) => {
          const progressPercent = Math.min(
            100,
            Math.floor((mission.currentCount / mission.targetCount) * 100)
          );
          const isReadyToClaim = mission.completed && !mission.claimed;

          return (
            <div
              key={mission.id}
              className={`p-3 rounded-2xl border transition-all flex flex-col justify-between gap-2 ${
                mission.claimed
                  ? 'bg-stone-950/60 border-stone-800/80 opacity-70'
                  : isReadyToClaim
                  ? 'bg-gradient-to-r from-amber-950/50 via-stone-900 to-yellow-950/40 border-yellow-400/60 shadow-[0_0_15px_rgba(245,158,11,0.25)]'
                  : 'bg-stone-950/80 border-stone-800 hover:border-stone-700'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-2.5">
                  <span className="text-2xl mt-0.5">{mission.icon}</span>
                  <div>
                    <h3 className="text-xs font-bold text-stone-100 flex items-center gap-1.5">
                      <span>{mission.sinhalaTitle}</span>
                      <span className="text-[10px] text-stone-400 font-normal">
                        ({mission.title})
                      </span>
                    </h3>
                    <p className="text-[10px] text-stone-400 mt-0.5">
                      {mission.sinhalaDescription}
                    </p>
                  </div>
                </div>

                <span className="font-mono text-xs font-black text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded-lg border border-amber-500/20 shrink-0">
                  +{mission.rewardCoins} 🪙
                </span>
              </div>

              {/* Progress Bar & Claim Button */}
              <div className="flex items-center justify-between gap-3 pt-1 border-t border-stone-800/60">
                {/* Progress Indicator */}
                <div className="flex-1">
                  <div className="flex justify-between items-center text-[10px] text-stone-400 mb-1">
                    <span>ප්‍රගතිය:</span>
                    <span className="font-mono font-bold text-stone-200">
                      {mission.currentCount} / {mission.targetCount} ({progressPercent}%)
                    </span>
                  </div>
                  <div className="w-full bg-stone-800 h-2 rounded-full overflow-hidden border border-stone-700">
                    <div
                      className={`h-full transition-all duration-500 ${
                        mission.completed
                          ? 'bg-gradient-to-r from-emerald-500 to-green-400'
                          : 'bg-gradient-to-r from-amber-500 to-yellow-400'
                      }`}
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>

                {/* Claim Button */}
                <div className="shrink-0">
                  {mission.claimed ? (
                    <span className="text-[10px] font-bold text-stone-500 bg-stone-900 px-2.5 py-1 rounded-xl flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                      ලබාගත්තා
                    </span>
                  ) : isReadyToClaim ? (
                    <button
                      onClick={() => handleClaim(mission)}
                      className="py-1 px-3 rounded-xl bg-gradient-to-r from-yellow-500 to-amber-600 hover:brightness-110 active:scale-95 text-stone-950 font-black text-xs shadow-md shadow-amber-500/30 flex items-center gap-1 cursor-pointer transition-all animate-pulse"
                    >
                      <Gift className="w-3.5 h-3.5" />
                      <span>ත්‍යාගය ගන්න (+{mission.rewardCoins})</span>
                    </button>
                  ) : (
                    <span className="text-[10px] text-stone-500 font-semibold px-2 py-1">
                      කරමින් පවතී...
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
