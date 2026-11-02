import React, { useState, useEffect } from 'react';
import { FeatureItem } from '../types/game';
import { LiveWeatherReport, fetchLiveWeather, SRI_LANKA_REGIONS } from '../services/weatherService';
import { sounds } from '../services/soundEffects';
import {
  Gift,
  Lock,
  CheckCircle2,
  CloudRain,
  Sun,
  Truck,
  HeartHandshake,
  Plane,
  Camera,
  Radio,
  RefreshCw,
  MapPin,
  Volume2,
  VolumeX,
  Sparkles,
} from 'lucide-react';
import { LiveNewsBox } from './LiveNewsBox';

interface FeaturesBoxViewProps {
  features: FeatureItem[];
  coins: number;
  onTriggerRainBonus: () => void;
  onActivateDrone: () => void;
}

export const FeaturesBoxView: React.FC<FeaturesBoxViewProps> = ({
  features,
  coins,
  onTriggerRainBonus,
  onActivateDrone,
}) => {
  const [selectedRegion, setSelectedRegion] = useState(SRI_LANKA_REGIONS[0]);
  const [weatherData, setWeatherData] = useState<LiveWeatherReport | null>(null);
  const [isLoadingWeather, setIsLoadingWeather] = useState<boolean>(false);
  const [isRadioPlaying, setIsRadioPlaying] = useState<boolean>(false);
  const [droneStatus, setDroneStatus] = useState<string>('Ready for flight');

  // Weather feature unlock check
  const isWeatherUnlocked = coins >= 150;

  useEffect(() => {
    if (isWeatherUnlocked && !weatherData) {
      loadWeather(selectedRegion.lat, selectedRegion.lon, selectedRegion.name);
    }
  }, [isWeatherUnlocked]);

  const loadWeather = async (lat: number, lon: number, name: string) => {
    setIsLoadingWeather(true);
    try {
      const data = await fetchLiveWeather(lat, lon, name, name);
      setWeatherData(data);
      if (data.isRaining) {
        onTriggerRainBonus();
      }
    } catch {
      // handled inside service
    } finally {
      setIsLoadingWeather(false);
    }
  };

  const handleRegionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const reg = SRI_LANKA_REGIONS.find((r) => r.name === e.target.value) || SRI_LANKA_REGIONS[0];
    setSelectedRegion(reg);
    loadWeather(reg.lat, reg.lon, reg.name);
  };

  const handleToggleRadio = () => {
    const state = sounds.toggleAmbientMusic();
    setIsRadioPlaying(state);
  };

  const handleLaunchDrone = () => {
    sounds.playTractor();
    setDroneStatus('ගුවන්ගතව ඇත... වෙළඳපොළට භාණ්ඩ රැගෙන යයි 🛸');
    onActivateDrone();
    setTimeout(() => {
      setDroneStatus('සාර්ථකව භාණ්ඩ අලෙවි කර ආපසු පැමිණියේය! (+120 කොයින්)');
      sounds.playCoin();
    }, 3000);
  };

  // Find next unlock target
  const lockedFeatures = features.filter((f) => coins < f.unlockCoins);
  const nextTarget = lockedFeatures.length > 0 ? lockedFeatures[0] : null;
  const progressToNext = nextTarget
    ? Math.min(100, Math.floor((coins / nextTarget.unlockCoins) * 100))
    : 100;

  return (
    <div className="space-y-4">
      {/* Features Hub Header */}
      <div className="bg-gradient-to-r from-amber-950/80 via-stone-900 to-amber-950/80 p-4 rounded-3xl border border-amber-500/40 shadow-xl backdrop-blur-md">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-300">
              <Gift className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-extrabold text-amber-200">ෆීචර්ස් පෙට්ටිය (Features Box Hub)</h2>
              <p className="text-[11px] text-amber-300/80">කොයින් වැඩි වන විට සුපිරි පහසුකම් 180+ අන්ලොක් වේ</p>
            </div>
          </div>
          <div className="bg-amber-500/20 px-3 py-1 rounded-full border border-amber-400/30 text-xs font-black text-amber-300">
            {coins} කොයින්
          </div>
        </div>

        {/* Next Unlock Progress Bar */}
        {nextTarget ? (
          <div className="bg-stone-950/80 p-3 rounded-2xl border border-stone-800">
            <div className="flex justify-between items-center text-xs mb-1.5">
              <span className="text-stone-300 font-medium flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
                ඊළඟ අන්ලොක් එක: <span className="text-amber-300 font-bold">{nextTarget.sinhalaTitle}</span>
              </span>
              <span className="text-stone-400 font-mono text-[11px]">
                {coins} / {nextTarget.unlockCoins} කොයින්
              </span>
            </div>
            <div className="w-full bg-stone-800 h-2.5 rounded-full overflow-hidden border border-amber-500/20">
              <div
                className="bg-gradient-to-r from-amber-500 to-yellow-400 h-full transition-all duration-500"
                style={{ width: `${progressToNext}%` }}
              />
            </div>
            <p className="text-[10px] text-stone-400 mt-1.5">
              තව කොයින් {nextTarget.unlockCoins - coins} ක් උපයාගත් පසු මෙම පහසුකම ක්‍රියාත්මක වේ.
            </p>
          </div>
        ) : (
          <div className="bg-emerald-950/40 p-2.5 rounded-2xl border border-emerald-500/30 text-center text-xs text-emerald-300 font-bold">
            🎉 සියලුම මූලික සුපිරි පහසුකම් සාර්ථකව අන්ලොක් වී ඇත!
          </div>
        )}
      </div>

      {/* FEATURE 1: 150 COINS - LIVE WEATHER STATION */}
      <div
        className={`p-4 rounded-3xl border transition-all ${
          isWeatherUnlocked
            ? 'bg-gradient-to-b from-sky-950/70 via-stone-900 to-stone-950 border-sky-500/40 shadow-xl'
            : 'bg-stone-900/60 border-stone-800 opacity-80'
        }`}
      >
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div
              className={`w-11 h-11 rounded-2xl flex items-center justify-center text-xl shadow-md ${
                isWeatherUnlocked
                  ? 'bg-sky-500/20 text-sky-300 border border-sky-400/50'
                  : 'bg-stone-800 text-stone-500'
              }`}
            >
              <CloudRain className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-extrabold text-stone-100">
                  සජීවී කාලගුණ අනාවැකිය (Live Weather)
                </h3>
                {isWeatherUnlocked ? (
                  <span className="text-[9px] font-black text-sky-300 bg-sky-500/20 px-2 py-0.5 rounded-full border border-sky-500/40 flex items-center gap-1">
                    <CheckCircle2 className="w-2.5 h-2.5 text-sky-400" />
                    අන්ලොක් විය (150 Coins)
                  </span>
                ) : (
                  <span className="text-[9px] font-bold text-amber-400 bg-amber-500/20 px-2 py-0.5 rounded-full border border-amber-500/30 flex items-center gap-1">
                    <Lock className="w-2.5 h-2.5" />
                    කොයින් 150 න් අන්ලොක් වේ
                  </span>
                )}
              </div>
              <p className="text-[11px] text-stone-400 mt-0.5">
                සජීවී දේශගුණික තොරතුරු සහ වර්ෂාපතන නොමිලේ දියවර බෝනස්
              </p>
            </div>
          </div>
        </div>

        {isWeatherUnlocked ? (
          <div className="space-y-3 mt-2">
            {/* Region Selector */}
            <div className="flex items-center gap-2 bg-stone-950/80 p-2 rounded-2xl border border-stone-800">
              <MapPin className="w-4 h-4 text-sky-400 shrink-0" />
              <select
                value={selectedRegion.name}
                onChange={handleRegionChange}
                className="bg-transparent text-xs text-stone-200 font-semibold focus:outline-none w-full cursor-pointer"
              >
                {SRI_LANKA_REGIONS.map((r) => (
                  <option key={r.name} value={r.name} className="bg-stone-900 text-white">
                    {r.name}
                  </option>
                ))}
              </select>
              <button
                onClick={() => loadWeather(selectedRegion.lat, selectedRegion.lon, selectedRegion.name)}
                disabled={isLoadingWeather}
                className="p-1 rounded-lg hover:bg-stone-800 text-stone-400 hover:text-white transition-all cursor-pointer"
                title="Refresh"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoadingWeather ? 'animate-spin' : ''}`} />
              </button>
            </div>

            {/* Current Weather Card */}
            {weatherData && (
              <div className="bg-gradient-to-r from-sky-900/30 to-blue-950/40 p-3 rounded-2xl border border-sky-500/30 text-xs">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <span className="text-2xl font-black text-white">{weatherData.temperature}°C</span>
                    <span className="text-[11px] text-sky-300 font-bold ml-2">
                      {weatherData.sinhalaCondition}
                    </span>
                  </div>
                  <div className="text-right text-[11px] text-stone-300">
                    <div>ආර්ද්‍රතාව: <span className="font-bold text-white">{weatherData.humidity}%</span></div>
                    <div>සුළඟ: <span className="font-bold text-white">{weatherData.windSpeed} km/h</span></div>
                  </div>
                </div>

                <div className="p-2 rounded-xl bg-stone-950/60 border border-sky-400/20 text-[11px] text-stone-300 flex items-center gap-2">
                  <span className="text-lg">📢</span>
                  <span>{weatherData.sinhalaFarmAdvice}</span>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="p-3 bg-stone-950/40 rounded-2xl border border-stone-800 text-xs text-stone-400">
            වී අස්වැන්න කපා වී මඩුවට විකුණා කොයින් 150 ඉක්මවූ සැනින් මෙම සජීවී කාලගුණ පහසුකම ස්වයංක්‍රීයව විවෘත වේ!
          </div>
        )}
      </div>

      {/* FEATURE 2: SOLAR IRRIGATION PUMP (300 COINS) */}
      <div
        className={`p-4 rounded-3xl border transition-all ${
          coins >= 300
            ? 'bg-gradient-to-b from-amber-950/40 via-stone-900 to-stone-950 border-amber-500/40'
            : 'bg-stone-900/60 border-stone-800 opacity-80'
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-300">
              <Sun className="w-5 h-5 text-yellow-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-xs font-bold text-stone-200">සූර්ය බල වාරිමාර්ග පද්ධතිය (Solar Pump)</h4>
                {coins >= 300 ? (
                  <span className="text-[9px] font-bold text-emerald-300 bg-emerald-500/20 px-2 py-0.5 rounded-full">
                    සක්‍රීයයි (300 Coins)
                  </span>
                ) : (
                  <span className="text-[9px] font-medium text-stone-500 bg-stone-800 px-2 py-0.5 rounded-full">
                    කොයින් 300
                  </span>
                )}
              </div>
              <p className="text-[11px] text-stone-400 mt-0.5">
                කුඹුරු 10 ටම දියවර නිරන්තරව සපයා වී පැලවීමේ කාලය අඩු කරයි.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* FEATURE 3: VILLAGE DRONE CARGO (1200 COINS) */}
      <div
        className={`p-4 rounded-3xl border transition-all ${
          coins >= 1200
            ? 'bg-gradient-to-b from-indigo-950/40 via-stone-900 to-stone-950 border-indigo-500/40'
            : 'bg-stone-900/60 border-stone-800 opacity-80'
        }`}
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 border border-indigo-400/40 flex items-center justify-center text-indigo-300">
              <Plane className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-xs font-bold text-stone-200">ග්‍රාමීය ඩ්‍රෝන ප්‍රවාහනය (Drone Cargo)</h4>
                {coins >= 1200 ? (
                  <span className="text-[9px] font-bold text-indigo-300 bg-indigo-500/20 px-2 py-0.5 rounded-full">
                    අන්ලොක් විය (1200 Coins)
                  </span>
                ) : (
                  <span className="text-[9px] font-medium text-stone-500 bg-stone-800 px-2 py-0.5 rounded-full">
                    කොයින් 1200
                  </span>
                )}
              </div>
              <p className="text-[11px] text-stone-400 mt-0.5">
                නගරයට කෙලින්ම ගොවි භාණ්ඩ යවා 1.5x කොයින් උපයන්න.
              </p>
            </div>
          </div>
        </div>

        {coins >= 1200 && (
          <div className="mt-2 pt-2 border-t border-stone-800 flex items-center justify-between">
            <span className="text-[11px] text-indigo-300">{droneStatus}</span>
            <button
              onClick={handleLaunchDrone}
              className="py-1.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold active:scale-95 cursor-pointer shadow-md"
            >
              ඩ්‍රෝනය යවන්න 🛸
            </button>
          </div>
        )}
      </div>

      {/* FEATURE 4: GOVI FM RADIO (3500 COINS) */}
      <div
        className={`p-4 rounded-3xl border transition-all ${
          coins >= 3500
            ? 'bg-gradient-to-b from-purple-950/40 via-stone-900 to-stone-950 border-purple-500/40'
            : 'bg-stone-900/60 border-stone-800 opacity-80'
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-500/20 border border-purple-400/40 flex items-center justify-center text-purple-300">
              <Radio className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-xs font-bold text-stone-200">ගොවි එෆ්.එම් රේඩියෝව (Govi FM Radio)</h4>
                {coins >= 3500 ? (
                  <span className="text-[9px] font-bold text-purple-300 bg-purple-500/20 px-2 py-0.5 rounded-full">
                    අන්ලොක් විය
                  </span>
                ) : (
                  <span className="text-[9px] font-medium text-stone-500 bg-stone-800 px-2 py-0.5 rounded-full">
                    කොයින් 3500
                  </span>
                )}
              </div>
              <p className="text-[11px] text-stone-400 mt-0.5">
                ගොවිබිමට සැනසීම ගෙනෙන ගම්බද නාද රටා ශ්‍රවණය කරන්න.
              </p>
            </div>
          </div>

          {coins >= 3500 && (
            <button
              onClick={handleToggleRadio}
              className={`py-1.5 px-3 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                isRadioPlaying
                  ? 'bg-purple-600 text-white shadow-lg'
                  : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
              }`}
            >
              {isRadioPlaying ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
              <span>{isRadioPlaying ? 'විකාශනය නවත්වන්න' : 'වාදනය කරන්න'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Real-time Hiru News Live Feed */}
      <LiveNewsBox />
    </div>
  );
};
