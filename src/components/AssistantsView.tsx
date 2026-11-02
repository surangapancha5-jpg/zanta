import React from 'react';
import { Assistant } from '../types/game';
import { sounds } from '../services/soundEffects';
import { Users, CheckCircle, Lock, Star, Sparkles } from 'lucide-react';

interface AssistantsViewProps {
  assistants: Assistant[];
  coins: number;
  onHireAssistant: (id: string, cost: number) => void;
  onUpgradeAssistant: (id: string, cost: number) => void;
}

export const AssistantsView: React.FC<AssistantsViewProps> = ({
  assistants,
  coins,
  onHireAssistant,
  onUpgradeAssistant,
}) => {
  const hiredCount = assistants.filter((a) => a.hired).length;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-gradient-to-r from-stone-900 via-indigo-950/40 to-stone-900 p-4 rounded-3xl border border-indigo-500/30 shadow-xl backdrop-blur-md">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 border border-indigo-400/40 flex items-center justify-center text-indigo-300">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-extrabold text-indigo-200">ගොවිපොළ ගෝලයෝ සහ සේවකයෝ (Assistants)</h2>
              <p className="text-[11px] text-stone-400">ඔබ නොමැති විටත් ගොවිපොළ වැඩ ස්වයංක්‍රීයව කරදෙයි</p>
            </div>
          </div>
          <div className="bg-indigo-500/20 px-3 py-1 rounded-full border border-indigo-400/30 text-xs font-bold text-indigo-300">
            සේවයේ: {hiredCount} / {assistants.length}
          </div>
        </div>
      </div>

      {/* Assistants Cards List */}
      <div className="space-y-3">
        {assistants.map((assistant) => {
          const upgradeCost = assistant.cost * (assistant.level + 1);
          const canHire = !assistant.hired && coins >= assistant.cost;
          const canUpgrade = assistant.hired && coins >= upgradeCost;

          return (
            <div
              key={assistant.id}
              className={`p-4 rounded-3xl border transition-all duration-300 ${
                assistant.hired
                  ? 'bg-gradient-to-r from-stone-900 via-indigo-950/30 to-stone-900 border-indigo-500/40 shadow-lg'
                  : 'bg-stone-900/80 border-stone-800 opacity-90'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl font-black shadow-md ${
                      assistant.hired
                        ? 'bg-gradient-to-tr from-indigo-600 to-purple-500 text-white border-2 border-indigo-300'
                        : 'bg-stone-800 text-stone-500 border border-stone-700'
                    }`}
                  >
                    {assistant.id === 'assistant-1' ? '👨‍🌾' : assistant.id === 'assistant-2' ? '🧑‍🌾' : assistant.id === 'assistant-3' ? '👳' : '👩‍🌾'}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-stone-100">{assistant.sinhalaName} ({assistant.name})</h3>
                      {assistant.hired ? (
                        <span className="text-[9px] font-bold text-indigo-300 bg-indigo-500/20 px-2 py-0.5 rounded-full border border-indigo-500/30 flex items-center gap-1">
                          <CheckCircle className="w-2.5 h-2.5 text-indigo-400" />
                          සේවයේ (Lv.{assistant.level})
                        </span>
                      ) : (
                        <span className="text-[9px] font-medium text-stone-500 bg-stone-800 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <Lock className="w-2.5 h-2.5" />
                          අගුළු දමා ඇත
                        </span>
                      )}
                    </div>
                    <p className="text-xs font-semibold text-amber-300 mt-0.5">{assistant.role}</p>
                  </div>
                </div>
              </div>

              {/* Description & Perks */}
              <div className="bg-stone-950/60 p-2.5 rounded-2xl border border-stone-800/80 mb-3 text-xs">
                <p className="text-stone-300 mb-1">{assistant.description}</p>
                <div className="flex items-center gap-1.5 text-indigo-300 font-medium text-[11px]">
                  <Sparkles className="w-3.5 h-3.5 text-yellow-400 shrink-0" />
                  <span>{assistant.perkDescription}</span>
                </div>
              </div>

              {/* Action Button */}
              {assistant.hired ? (
                <div className="flex items-center justify-between">
                  <div className="text-[11px] text-stone-400 flex items-center gap-1">
                    <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                    <span>සේවක කාර්යක්ෂමතාව: 100% + {assistant.level * 10}%</span>
                  </div>
                  <button
                    onClick={() => {
                      if (canUpgrade) {
                        sounds.playCoin();
                        onUpgradeAssistant(assistant.id, upgradeCost);
                      }
                    }}
                    disabled={!canUpgrade}
                    className={`py-1.5 px-3 rounded-xl text-xs font-bold transition-all ${
                      canUpgrade
                        ? 'bg-indigo-600 hover:bg-indigo-500 text-white cursor-pointer active:scale-95 shadow-md'
                        : 'bg-stone-800 text-stone-500 cursor-not-allowed'
                    }`}
                  >
                    උසස් කරන්න (Lv.{assistant.level + 1} - {upgradeCost} කොයින්)
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    if (canHire) {
                      sounds.playCoin();
                      onHireAssistant(assistant.id, assistant.cost);
                    }
                  }}
                  disabled={!canHire}
                  className={`w-full py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                    canHire
                      ? 'bg-gradient-to-r from-indigo-500 to-purple-600 hover:brightness-110 text-white shadow-md active:scale-95 cursor-pointer font-black'
                      : 'bg-stone-800 text-stone-500 cursor-not-allowed'
                  }`}
                >
                  <Users className="w-4 h-4" />
                  <span>සේවයට බඳවා ගන්න ({assistant.cost} කොයින්)</span>
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
