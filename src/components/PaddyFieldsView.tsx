import React, { useState, useEffect } from 'react';
import { PaddyField } from '../types/game';
import { sounds } from '../services/soundEffects';
import { Sprout, Droplets, Sparkles, AlertCircle, Play } from 'lucide-react';

interface PaddyFieldsViewProps {
  fields: PaddyField[];
  seedsCount: number;
  coins: number;
  onPlant: (fieldId: number) => void;
  onPlantAll: () => void;
  onWater: (fieldId: number) => void;
  onWaterAll: () => void;
  onHarvest: (fieldId: number) => void;
  onTractorHarvestAll: () => void;
}

export const PaddyFieldsView: React.FC<PaddyFieldsViewProps> = ({
  fields,
  seedsCount,
  coins: _coins,
  onPlant,
  onPlantAll,
  onWater,
  onWaterAll,
  onHarvest,
  onTractorHarvestAll,
}) => {
  const [now, setNow] = useState<number>(Date.now());
  const [isTractorActive, setIsTractorActive] = useState<boolean>(false);

  // 1-second interval to update remaining time counters accurately
  useEffect(() => {
    const timer = setInterval(() => {
      setNow(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const ripeCount = fields.filter((f) => {
    if (f.status === 'ripe') return true;
    if (f.status === 'growing' && f.plantedAt && now - f.plantedAt >= f.growthDuration) return true;
    return false;
  }).length;

  const emptyCount = fields.filter((f) => f.status === 'empty').length;

  const handleTractorDispatch = () => {
    if (ripeCount === 0 || isTractorActive) return;
    setIsTractorActive(true);
    sounds.playTractor();
    setTimeout(() => {
      onTractorHarvestAll();
      setIsTractorActive(false);
    }, 1400);
  };

  return (
    <div className="space-y-4">
      {/* Overview Control Bar */}
      <div className="bg-gradient-to-r from-emerald-950/80 via-stone-900/90 to-emerald-950/80 p-3.5 rounded-3xl border border-emerald-500/30 shadow-lg backdrop-blur-md">
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-2">
            <span className="text-xl">🌾</span>
            <div>
              <h2 className="text-sm font-bold text-emerald-200">රාජකීය කුඹුරු යාය (10 Fields)</h2>
              <p className="text-[11px] text-emerald-400/80">වී පැලවීම: විනාඩි 1 (60s) • නියමිත දියවර හා රැකවරණය</p>
            </div>
          </div>
          <div className="bg-emerald-500/20 px-2.5 py-1 rounded-full border border-emerald-400/30 text-[11px] font-bold text-emerald-300">
            බීජ තොගය: {seedsCount}
          </div>
        </div>

        {/* Action Buttons Row */}
        <div className="grid grid-cols-3 gap-2">
          {/* Sow All */}
          <button
            onClick={() => {
              if (emptyCount > 0 && seedsCount > 0) {
                sounds.playHarvest();
                onPlantAll();
              }
            }}
            disabled={emptyCount === 0 || seedsCount === 0}
            className={`py-2 px-2 rounded-xl text-xs font-bold flex flex-col items-center justify-center transition-all ${
              emptyCount > 0 && seedsCount > 0
                ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-md active:scale-95 cursor-pointer'
                : 'bg-stone-800 text-stone-500 cursor-not-allowed opacity-60'
            }`}
          >
            <div className="flex items-center gap-1">
              <Sprout className="w-3.5 h-3.5" />
              <span>වපුරන්න</span>
            </div>
            <span className="text-[9px] font-normal opacity-90">හිස් කුඹුරු ({emptyCount})</span>
          </button>

          {/* Water All */}
          <button
            onClick={() => {
              sounds.playWater();
              onWaterAll();
            }}
            className="py-2 px-2 rounded-xl text-xs font-bold bg-cyan-700 hover:bg-cyan-600 text-white shadow-md active:scale-95 cursor-pointer flex flex-col items-center justify-center transition-all"
          >
            <div className="flex items-center gap-1">
              <Droplets className="w-3.5 h-3.5" />
              <span>දියවර</span>
            </div>
            <span className="text-[9px] font-normal opacity-90">කුඹුරු 10ටම ජලය</span>
          </button>

          {/* Tractor Harvest All */}
          <button
            onClick={handleTractorDispatch}
            disabled={ripeCount === 0 || isTractorActive}
            className={`py-2 px-2 rounded-xl text-xs font-bold flex flex-col items-center justify-center transition-all ${
              ripeCount > 0
                ? 'bg-gradient-to-r from-red-600 to-amber-600 hover:brightness-110 text-white shadow-lg shadow-red-900/40 active:scale-95 cursor-pointer ring-2 ring-yellow-400'
                : 'bg-stone-800 text-stone-500 cursor-not-allowed opacity-60'
            }`}
          >
            <div className="flex items-center gap-1">
              <span className="text-sm">🚜</span>
              <span>{isTractorActive ? 'කපමින්...' : 'ට්‍රැක්ටරය'}</span>
            </div>
            <span className="text-[9px] font-normal opacity-90">පැසුණු ({ripeCount}) කපන්න</span>
          </button>
        </div>
      </div>

      {/* Tractor Animation Banner when active */}
      {isTractorActive && (
        <div className="bg-gradient-to-r from-red-600 via-amber-600 to-red-600 text-white p-3 rounded-2xl flex items-center justify-between shadow-xl animate-pulse">
          <div className="flex items-center gap-3">
            <span className="text-2xl animate-bounce">🚜</span>
            <div>
              <p className="font-extrabold text-xs">ට්‍රැක්ටරය මඟින් කුඹුරු යාය කපා අස්වැන්න නෙළයි!</p>
              <p className="text-[10px] text-amber-200">වී මඩුවට කෙලින්ම ගෙන ගොස් බානු ලැබේ...</p>
            </div>
          </div>
          <span className="text-xl">🌾🌾</span>
        </div>
      )}

      {/* The 10 Paddy Fields Grid */}
      <div className="grid grid-cols-2 gap-3">
        {fields.map((field) => {
          const isGrowing = field.status === 'growing';
          let isRipe = field.status === 'ripe';
          let progressPercent = 0;
          let remainingSeconds = 0;

          if (isGrowing && field.plantedAt) {
            const elapsed = Math.max(0, now - field.plantedAt);
            progressPercent = Math.min(100, Math.floor((elapsed / field.growthDuration) * 100));
            remainingSeconds = Math.max(0, Math.ceil((field.growthDuration - elapsed) / 1000));
            if (elapsed >= field.growthDuration) {
              isRipe = true;
            }
          }

          return (
            <div
              key={field.id}
              className={`relative rounded-2xl p-3 border transition-all duration-300 flex flex-col justify-between overflow-hidden min-h-[145px] ${
                isRipe
                  ? 'bg-gradient-to-b from-amber-900/60 via-yellow-950/80 to-stone-900 border-yellow-400 shadow-[0_0_15px_rgba(234,179,8,0.3)]'
                  : isGrowing
                  ? 'bg-gradient-to-b from-emerald-950/70 via-stone-900 to-stone-950 border-emerald-600/40'
                  : 'bg-stone-900/80 border-stone-800'
              }`}
            >
              {/* Field Header */}
              <div className="flex items-center justify-between z-10">
                <div className="flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-stone-800 text-stone-300 text-[10px] font-bold flex items-center justify-center border border-stone-700">
                    #{field.id}
                  </span>
                  <span className="text-[11px] font-semibold text-stone-300">
                    කුඹුර {field.id}
                  </span>
                </div>
                {isRipe ? (
                  <span className="text-[10px] font-extrabold text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded-full border border-amber-400/50 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-yellow-400" />
                    පැසී ඇත!
                  </span>
                ) : isGrowing ? (
                  <span className="text-[10px] font-medium text-emerald-300 bg-emerald-500/20 px-2 py-0.5 rounded-full border border-emerald-500/40">
                    පැලවෙමින්
                  </span>
                ) : (
                  <span className="text-[10px] font-medium text-stone-400 bg-stone-800 px-2 py-0.5 rounded-full">
                    හිස් ඉඩම
                  </span>
                )}
              </div>

              {/* Visual Display Center */}
              <div className="my-2 flex flex-col items-center justify-center z-10">
                {isRipe ? (
                  <div className="text-center group">
                    <div className="text-3xl animate-bounce duration-1000">🌾🌾</div>
                    <span className="text-[10px] font-extrabold text-yellow-300 tracking-wide mt-1 block">
                      රන්වන් කරල් සූදානම්
                    </span>
                  </div>
                ) : isGrowing ? (
                  <div className="w-full text-center">
                    <div className="text-2xl mb-1">🌱</div>
                    {/* Progress Bar */}
                    <div className="w-full bg-stone-800 h-2 rounded-full overflow-hidden border border-emerald-500/20">
                      <div
                        className="bg-gradient-to-r from-emerald-500 to-yellow-400 h-full transition-all duration-1000"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                    <div className="flex justify-between items-center text-[10px] text-stone-400 mt-1">
                      <span>{progressPercent}%</span>
                      <span className="text-emerald-300 font-mono font-bold">
                        {remainingSeconds}s ඉතිරිව
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-1">
                    <div className="text-2xl opacity-60">🟫</div>
                    <span className="text-[10px] text-stone-400 mt-0.5 block">
                      සාරවත් කළු මැටි
                    </span>
                  </div>
                )}
              </div>

              {/* Bottom Action Button */}
              <div className="z-10 mt-1">
                {isRipe ? (
                  <button
                    onClick={() => onHarvest(field.id)}
                    className="w-full py-1.5 px-2 bg-gradient-to-r from-yellow-500 to-amber-600 hover:brightness-110 active:scale-95 text-stone-950 font-black text-xs rounded-xl shadow-md flex items-center justify-center gap-1.5 cursor-pointer transition-all"
                  >
                    <span>🚜 අස්වැන්න කපන්න</span>
                  </button>
                ) : isGrowing ? (
                  <button
                    onClick={() => onWater(field.id)}
                    className="w-full py-1.5 px-2 bg-cyan-900/70 hover:bg-cyan-800 text-cyan-200 text-xs font-semibold rounded-xl flex items-center justify-center gap-1 active:scale-95 transition-all"
                  >
                    <Droplets className="w-3.5 h-3.5 text-cyan-400" />
                    <span>දියවර සපයන්න</span>
                  </button>
                ) : (
                  <button
                    onClick={() => onPlant(field.id)}
                    disabled={seedsCount <= 0}
                    className={`w-full py-1.5 px-2 text-xs font-bold rounded-xl flex items-center justify-center gap-1 transition-all ${
                      seedsCount > 0
                        ? 'bg-emerald-600 hover:bg-emerald-500 text-white active:scale-95 cursor-pointer shadow-sm'
                        : 'bg-stone-800 text-stone-500 cursor-not-allowed'
                    }`}
                  >
                    <Sprout className="w-3.5 h-3.5" />
                    <span>{seedsCount > 0 ? 'බීජ වපුරන්න' : 'බීජ නැත'}</span>
                  </button>
                )}
              </div>

              {/* Subtle background terrain texture effect */}
              <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#22c55e_1px,transparent_1px)] [background-size:12px_12px] pointer-events-none" />
            </div>
          );
        })}
      </div>
    </div>
  );
};
