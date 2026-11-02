import React, { useState } from 'react';
import { sounds } from '../services/soundEffects';
import { UserProfile } from '../types/game';
import { Volume2, VolumeX, Save, RotateCcw, HelpCircle, LogOut, User } from 'lucide-react';

interface HeaderBarProps {
  coins: number;
  paddySacks: number;
  seedsCount: number;
  currentUser?: UserProfile | null;
  onReset: () => void;
  onManualSave: () => void;
  onLogout?: () => void;
}

export const HeaderBar: React.FC<HeaderBarProps> = ({
  coins,
  paddySacks,
  seedsCount,
  currentUser,
  onReset,
  onManualSave,
  onLogout,
}) => {
  const [isMuted, setIsMuted] = useState<boolean>(sounds.getMuted());
  const [showHelp, setShowHelp] = useState<boolean>(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState<boolean>(false);
  const [saveToast, setSaveToast] = useState<boolean>(false);

  const toggleSound = () => {
    const next = !isMuted;
    sounds.setMuted(next);
    setIsMuted(next);
  };

  const handleSaveClick = () => {
    onManualSave();
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 2000);
  };

  const handleConfirmLogout = () => {
    setShowLogoutConfirm(false);
    if (onLogout) {
      onLogout();
    }
  };

  return (
    <>
      <header className="sticky top-0 z-30 bg-stone-950/90 backdrop-blur-md border-b border-stone-800/80 px-3 py-2.5 max-w-md mx-auto">
        <div className="flex items-center justify-between">
          {/* Logo / App Name */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-600 to-yellow-400 flex items-center justify-center text-lg shadow-md border border-yellow-200/50">
              🌾
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-xs font-black tracking-wide text-amber-200">ගොවි ගමන</h1>
                {currentUser && (
                  <span className="text-[10px] font-bold text-amber-300 bg-amber-950/70 border border-amber-500/30 px-1.5 py-0.2 rounded-full truncate max-w-[100px]">
                    {currentUser.username}
                  </span>
                )}
              </div>
              <p className="text-[9px] text-emerald-400 font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                ස්වයංක්‍රීයව සුරැකේ (Auto-Saved)
              </p>
            </div>
          </div>

          {/* Quick Stats Pill & Controls */}
          <div className="flex items-center gap-1.5">
            {/* Coins Badge */}
            <div className="bg-gradient-to-r from-amber-500/20 via-yellow-500/20 to-amber-500/10 px-2.5 py-1 rounded-full border border-amber-400/40 flex items-center gap-1 shadow-sm">
              <span className="text-yellow-400 font-bold text-xs">🪙</span>
              <span className="text-xs font-extrabold text-yellow-300 font-mono tracking-tight">{coins}</span>
            </div>

            {/* Sound Toggle */}
            <button
              onClick={toggleSound}
              className="w-7 h-7 rounded-xl bg-stone-900 border border-stone-800 flex items-center justify-center text-stone-300 hover:text-white transition-all cursor-pointer"
              title="Sound Toggle"
            >
              {isMuted ? <VolumeX className="w-3.5 h-3.5 text-rose-400" /> : <Volume2 className="w-3.5 h-3.5 text-emerald-400" />}
            </button>

            {/* Help / Info */}
            <button
              onClick={() => setShowHelp(true)}
              className="w-7 h-7 rounded-xl bg-stone-900 border border-stone-800 flex items-center justify-center text-stone-300 hover:text-white transition-all cursor-pointer"
              title="Help & Info"
            >
              <HelpCircle className="w-3.5 h-3.5 text-amber-300" />
            </button>

            {/* Logout button */}
            {currentUser && onLogout && (
              <button
                onClick={() => setShowLogoutConfirm(true)}
                className="w-7 h-7 rounded-xl bg-stone-900 border border-rose-500/30 hover:border-rose-500 flex items-center justify-center text-rose-400 hover:text-rose-300 transition-all cursor-pointer"
                title="ගිණුමෙන් ඉවත් වන්න (Logout)"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Second Row: Stock Snapshot */}
        <div className="flex items-center justify-between mt-2 pt-2 border-t border-stone-900 text-[10px] text-stone-400">
          <div className="flex items-center gap-3">
            <span>වී මලු: <strong className="text-amber-300">{paddySacks}</strong></span>
            <span>බීජ: <strong className="text-emerald-400">{seedsCount}</strong></span>
            {currentUser && (
              <span className="text-stone-400 font-mono hidden sm:inline">📱 {currentUser.phoneNumber}</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSaveClick}
              className="text-stone-400 hover:text-emerald-300 transition-colors flex items-center gap-1 cursor-pointer"
              title="Manual Save"
            >
              <Save className="w-3 h-3" />
              <span>{saveToast ? 'සුරැකිණි!' : 'Save'}</span>
            </button>

            {currentUser && onLogout && (
              <button
                onClick={() => setShowLogoutConfirm(true)}
                className="text-rose-400/80 hover:text-rose-300 transition-colors flex items-center gap-1 cursor-pointer ml-1"
                title="Logout"
              >
                <span>ලොග් අවුට්</span>
              </button>
            )}
          </div>
        </div>
      </header>


      {/* Help Modal */}
      {showHelp && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-stone-900 border border-amber-500/40 rounded-3xl p-5 max-w-sm w-full shadow-2xl space-y-3 text-stone-200">
            <div className="flex items-center justify-between pb-2 border-b border-stone-800">
              <h3 className="text-sm font-black text-amber-300 flex items-center gap-2">
                <span>🌾</span> ගොවි ගමන උපදෙස් (Game Guide)
              </h3>
              <button
                onClick={() => setShowHelp(false)}
                className="text-stone-400 hover:text-white text-xs font-bold px-2 py-1 bg-stone-800 rounded-lg"
              >
                ✕
              </button>
            </div>

            <div className="text-xs space-y-2 text-stone-300 leading-relaxed max-h-[60vh] overflow-y-auto pr-1">
              <p>
                <strong>1. කුඹුරු 10:</strong> බීජ වපුරා දියවර සපයන්න. විනාඩි 1කින් (60s) වී රන්වන් පැහැයෙන් පැසේ. ට්‍රැක්ටරය යවා කපා වී මඩුවට දමන්න.
              </p>
              <p>
                <strong>2. වාසනා රෝදය:</strong> ඩෑෂ්බෝඩ් එකේ ඇති රවුමේ "GO" බටන් එක ඔබා කැරකෙන්න හරින්න. ඊතලය නවතින තැන ඇති කොයින්/බීජ හිමිවේ!
              </p>
              <p>
                <strong>3. සත්තු කොටු:</strong> හරක්, එළු, කුකුළු, තාරා පැටවුන් ගෙන විනාඩි 1ක් පෝෂණය කරන්න. වැඩුණු පසු කිරි/බිත්තර ලබාගන්න හෝ වැඩි මිලට විකුණන්න.
              </p>
              <p>
                <strong>4. ගොවිපොළ කඩය:</strong> පැමිණෙන ගැණුම්කරුවන්ට බඩු විකුණා වැඩිපුර කොයින් ලබාගන්න.
              </p>
              <p>
                <strong>5. ගෝලයෝ:</strong> සිරිපාල, බන්දු, මනෝජ් ආදී සේවකයින් බඳවාගෙන ගොවිපොළ ස්වයංක්‍රීය කරන්න.
              </p>
              <p>
                <strong>6. ෆීචර්ස් පෙට්ටිය:</strong> කොයින් 150 න් සජීවී කාලගුණය (Live Weather) අන්ලොක් වේ. කොයින් වැඩි වන විට තවත් පහසුකම් විවෘත වේ!
              </p>
              <p>
                <strong>7. ඕෆ්ලයින් සුරැකීම:</strong> ෆෝන් එක ඕෆ් කර පසුව ඕන් කළද ඔබ කරපු දේවල් ඒ විදිහටම සුරැකී පවතී!
              </p>
            </div>

            <div className="pt-2 border-t border-stone-800 flex justify-between items-center">
              <button
                onClick={() => {
                  if (window.confirm('ඔබට ක්‍රීඩාව නැවත මුල සිට ආරම්භ කිරීමට අවශ්‍යද?')) {
                    onReset();
                    setShowHelp(false);
                  }
                }}
                className="text-[11px] text-rose-400 hover:underline flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                නැවත මුල සිට අරඹන්න
              </button>
              <button
                onClick={() => setShowHelp(false)}
                className="py-1.5 px-4 bg-amber-500 hover:bg-amber-400 text-stone-950 font-black text-xs rounded-xl"
              >
                තේරුණා!
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-stone-900 border border-rose-500/40 rounded-3xl p-5 max-w-xs w-full shadow-2xl space-y-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 mx-auto flex items-center justify-center">
              <LogOut className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-black text-rose-300">ගිණුමෙන් ඉවත් වන්නද? (Logout)</h3>
              <p className="text-xs text-stone-300 mt-1">
                ඔබගේ සියලුම ගොවි දත්ත, කුඹුරු සහ කොයින් ආරක්ෂිතව සුරැකී ඇත. නැවත දුරකථන අංකය සහ නම ලබාදී පහසුවෙන්ම ලොග් විය හැක.
              </p>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 py-2 bg-stone-800 hover:bg-stone-700 text-stone-300 font-bold text-xs rounded-xl cursor-pointer"
              >
                අවලංගු කරන්න
              </button>
              <button
                type="button"
                onClick={handleConfirmLogout}
                className="flex-1 py-2 bg-rose-600 hover:bg-rose-500 text-white font-black text-xs rounded-xl cursor-pointer shadow-lg shadow-rose-600/30"
              >
                ඔව්, ලොග් අවුට් වන්න
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

