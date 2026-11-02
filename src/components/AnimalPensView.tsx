import React, { useState, useEffect } from 'react';
import { Animal, AnimalType } from '../types/game';
import { sounds } from '../services/soundEffects';
import { PlusCircle, Heart, DollarSign, Milk, Egg, ShieldCheck } from 'lucide-react';

interface AnimalPensViewProps {
  animals: Animal[];
  coins: number;
  onBuyAnimal: (type: AnimalType) => void;
  onFeedAnimal: (animalId: string) => void;
  onCollectProduce: (animalId: string) => void;
  onSellAnimal: (animalId: string) => void;
}

interface AnimalMeta {
  type: AnimalType;
  title: string;
  sinhalaTitle: string;
  buyCost: number;
  sellValue: number;
  produceName: string;
  produceSinhala: string;
  produceIcon: string;
  icon: string;
  penBg: string;
  penBorder: string;
}

const ANIMAL_CATALOG: Record<AnimalType, AnimalMeta> = {
  cow: {
    type: 'cow',
    title: 'Cattle Pen',
    sinhalaTitle: 'හරක් කොටුව',
    buyCost: 60,
    sellValue: 180,
    produceName: 'Fresh Cow Milk',
    produceSinhala: 'නැවුම් එළකිරි',
    produceIcon: '🥛',
    icon: '🐄',
    penBg: 'from-amber-950/70 via-stone-900 to-stone-950',
    penBorder: 'border-amber-600/40',
  },
  goat: {
    type: 'goat',
    title: 'Goat Pen',
    sinhalaTitle: 'එළු කොටුව',
    buyCost: 40,
    sellValue: 125,
    produceName: 'Goat Milk Bottle',
    produceSinhala: 'එළු කිරි බෝතල්',
    produceIcon: '🍼',
    icon: '🐐',
    penBg: 'from-stone-900 via-stone-900/90 to-amber-950/60',
    penBorder: 'border-orange-500/30',
  },
  chicken: {
    type: 'chicken',
    title: 'Poultry Farm',
    sinhalaTitle: 'කුකුළු කොටුව',
    buyCost: 20,
    sellValue: 65,
    produceName: 'Organic Eggs',
    produceSinhala: 'ගමේ බිත්තර',
    produceIcon: '🥚',
    icon: '🐔',
    penBg: 'from-yellow-950/60 via-stone-900 to-stone-950',
    penBorder: 'border-yellow-600/30',
  },
  duck: {
    type: 'duck',
    title: 'Duck Wetland Pen',
    sinhalaTitle: 'තාරා කොටුව',
    buyCost: 30,
    sellValue: 90,
    produceName: 'Duck Egg Crates',
    produceSinhala: 'තාරා බිත්තර',
    produceIcon: '🪶',
    icon: '🦆',
    penBg: 'from-cyan-950/60 via-stone-900 to-stone-950',
    penBorder: 'border-cyan-600/30',
  },
};

export const AnimalPensView: React.FC<AnimalPensViewProps> = ({
  animals,
  coins,
  onBuyAnimal,
  onFeedAnimal,
  onCollectProduce,
  onSellAnimal,
}) => {
  const [selectedTab, setSelectedTab] = useState<AnimalType>('cow');
  const [now, setNow] = useState<number>(Date.now());

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const meta = ANIMAL_CATALOG[selectedTab];
  const penAnimals = animals.filter((a) => a.type === selectedTab);

  const handleSound = (type: AnimalType) => {
    if (type === 'cow') sounds.playCow();
    else if (type === 'goat') sounds.playGoat();
    else if (type === 'chicken' || type === 'duck') sounds.playChicken();
  };

  return (
    <div className="space-y-4">
      {/* Header & Quick Tab Switcher for Pens */}
      <div className="bg-gradient-to-r from-stone-900 via-amber-950/40 to-stone-900 p-3.5 rounded-3xl border border-stone-800 shadow-xl backdrop-blur-md">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-xl">🏡</span>
            <div>
              <h2 className="text-sm font-bold text-amber-200">සත්තු ගාල් සහ කොටු (Animal Pens)</h2>
              <p className="text-[11px] text-stone-400">එක් සතෙකු ලොකු වීමට විනාඩි 1 (60s) • ලොකු වූ පසු විකුණන්න</p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-stone-400 block">ඔබ සතු සතුන්</span>
            <span className="text-xs font-black text-amber-300">{animals.length} ක්</span>
          </div>
        </div>

        {/* 4 Pen Category Selectors */}
        <div className="grid grid-cols-4 gap-1.5">
          {(Object.keys(ANIMAL_CATALOG) as AnimalType[]).map((type) => {
            const item = ANIMAL_CATALOG[type];
            const count = animals.filter((a) => a.type === type).length;
            const isSelected = selectedTab === type;

            return (
              <button
                key={type}
                onClick={() => {
                  setSelectedTab(type);
                  handleSound(type);
                }}
                className={`py-2 px-1 rounded-2xl flex flex-col items-center justify-center transition-all ${
                  isSelected
                    ? 'bg-amber-500 text-stone-950 font-black shadow-lg shadow-amber-500/20 scale-102 ring-2 ring-amber-300'
                    : 'bg-stone-800/80 hover:bg-stone-700/80 text-stone-300 font-medium'
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                <span className="text-[10px] truncate max-w-full">{item.sinhalaTitle}</span>
                <span
                  className={`text-[9px] px-1.5 py-0.2 rounded-full mt-0.5 ${
                    isSelected ? 'bg-stone-900 text-yellow-300' : 'bg-stone-900/60 text-stone-400'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Pen Area */}
      <div
        className={`bg-gradient-to-b ${meta.penBg} p-4 rounded-3xl border ${meta.penBorder} shadow-2xl relative overflow-hidden`}
      >
        {/* Pen Title & Buy New Animal Action */}
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-stone-800">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-2xl shadow-inner">
              {meta.icon}
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-amber-100">{meta.sinhalaTitle} ({meta.title})</h3>
              <p className="text-[11px] text-amber-300/80">
                පැටවුන් මිල: {meta.buyCost} කොයින් • ලොකු වූ විට: {meta.sellValue} කොයින්
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              if (coins >= meta.buyCost) {
                onBuyAnimal(selectedTab);
                handleSound(selectedTab);
              }
            }}
            disabled={coins < meta.buyCost}
            className={`py-1.5 px-3 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-md ${
              coins >= meta.buyCost
                ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-stone-950 hover:brightness-110 active:scale-95 cursor-pointer font-black'
                : 'bg-stone-800 text-stone-500 cursor-not-allowed opacity-60'
            }`}
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>පැටවෙකු ගන්න</span>
          </button>
        </div>

        {/* Animals In This Pen */}
        {penAnimals.length === 0 ? (
          <div className="py-8 text-center bg-stone-950/40 rounded-2xl border border-stone-800/80 p-4">
            <span className="text-4xl block mb-2 opacity-50">{meta.icon}</span>
            <p className="text-xs font-bold text-stone-300 mb-1">මේ කොටුවේ සතුන් නැත</p>
            <p className="text-[11px] text-stone-500 max-w-xs mx-auto mb-3">
              පැටවෙකු මිලදී ගෙන විනාඩි 1 ක් පෝෂණය කරන්න. වැඩුණු පසු කිරි/බිත්තර ලබාගෙන හෝ වැඩි මිලට විකුණන්න.
            </p>
            <button
              onClick={() => {
                if (coins >= meta.buyCost) {
                  onBuyAnimal(selectedTab);
                  handleSound(selectedTab);
                }
              }}
              disabled={coins < meta.buyCost}
              className={`py-2 px-4 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 ${
                coins >= meta.buyCost
                  ? 'bg-amber-500 hover:bg-amber-400 text-stone-950 cursor-pointer shadow-lg'
                  : 'bg-stone-800 text-stone-500 cursor-not-allowed'
              }`}
            >
              <PlusCircle className="w-4 h-4" />
              <span>පළමු පැටවා මිලදී ගන්න ({meta.buyCost} කොයින්)</span>
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {penAnimals.map((animal) => {
              const ageMs = Math.max(0, now - animal.birthTime);
              const isMature = ageMs >= animal.growthDuration;
              const progressPercent = Math.min(100, Math.floor((ageMs / animal.growthDuration) * 100));
              const remainingSeconds = Math.max(0, Math.ceil((animal.growthDuration - ageMs) / 1000));

              return (
                <div
                  key={animal.id}
                  className={`p-3 rounded-2xl border transition-all duration-300 ${
                    isMature
                      ? 'bg-gradient-to-r from-amber-950/40 via-stone-900 to-stone-900 border-amber-500/40 shadow-md'
                      : 'bg-stone-900/90 border-stone-800'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{meta.icon}</span>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-bold text-stone-200">{animal.name}</h4>
                          {isMature ? (
                            <span className="text-[9px] font-black text-amber-400 bg-amber-500/20 px-2 py-0.5 rounded-full border border-amber-500/40 flex items-center gap-1">
                              <ShieldCheck className="w-2.5 h-2.5 text-amber-400" />
                              පූර්ණ වැඩුණු සතෙකි
                            </span>
                          ) : (
                            <span className="text-[9px] font-medium text-cyan-300 bg-cyan-900/40 px-2 py-0.5 rounded-full">
                              පැටවෙකි ({progressPercent}%)
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-stone-400">
                          {isMature ? `නිෂ්පාදන: ${meta.produceSinhala}` : `ලොකු වීමට තව: ${remainingSeconds}s`}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {/* Feed button */}
                      <button
                        onClick={() => {
                          sounds.playWater();
                          onFeedAnimal(animal.id);
                        }}
                        className="p-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-emerald-300 transition-all text-xs flex items-center gap-1"
                        title="කෑම දෙන්න"
                      >
                        <Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-500/30" />
                        <span className="text-[10px]">කෑම</span>
                      </button>
                    </div>
                  </div>

                  {/* Growth Progress Bar */}
                  {!isMature && (
                    <div className="mb-2">
                      <div className="w-full bg-stone-800 h-2 rounded-full overflow-hidden border border-stone-700">
                        <div
                          className="bg-gradient-to-r from-amber-500 to-yellow-400 h-full transition-all duration-1000"
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Actions Row */}
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {/* Collect Milk / Eggs */}
                    <button
                      onClick={() => {
                        sounds.playCoin();
                        onCollectProduce(animal.id);
                      }}
                      disabled={!isMature}
                      className={`py-1.5 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                        isMature
                          ? 'bg-stone-800 hover:bg-stone-700 text-amber-300 border border-amber-500/30 active:scale-95 cursor-pointer'
                          : 'bg-stone-800/40 text-stone-600 cursor-not-allowed'
                      }`}
                    >
                      <span>{meta.produceIcon}</span>
                      <span>{meta.produceSinhala} ගන්න</span>
                    </button>

                    {/* Sell Mature Animal for Coins */}
                    <button
                      onClick={() => {
                        sounds.playCoin();
                        onSellAnimal(animal.id);
                      }}
                      disabled={!isMature}
                      className={`py-1.5 px-2 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all ${
                        isMature
                          ? 'bg-gradient-to-r from-emerald-600 to-green-600 hover:brightness-110 text-white shadow-md active:scale-95 cursor-pointer'
                          : 'bg-stone-800/40 text-stone-600 cursor-not-allowed'
                      }`}
                    >
                      <DollarSign className="w-3.5 h-3.5 text-yellow-300" />
                      <span>{isMature ? `විකුණන්න (+${meta.sellValue})` : 'වැඩුණු පසු විකුණන්න'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
