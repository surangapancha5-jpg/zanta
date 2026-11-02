import React, { useRef, useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { sounds } from '../services/soundEffects';
import { Sparkles, Award, RefreshCw } from 'lucide-react';

interface WheelSegment {
  label: string;
  subLabel: string;
  type: 'coins' | 'seeds' | 'jackpot';
  value: number;
  color: string;
  textColor: string;
}

const SEGMENTS: WheelSegment[] = [
  { label: '20 Coins', subLabel: 'කොයින් 20', type: 'coins', value: 20, color: '#f59e0b', textColor: '#ffffff' },
  { label: '50 Coins', subLabel: 'කොයින් 50', type: 'coins', value: 50, color: '#10b981', textColor: '#ffffff' },
  { label: '10 Seeds', subLabel: 'වී බීජ 10', type: 'seeds', value: 10, color: '#3b82f6', textColor: '#ffffff' },
  { label: '100 Coins', subLabel: 'කොයින් 100', type: 'coins', value: 100, color: '#8b5cf6', textColor: '#ffffff' },
  { label: '500 JACKPOT', subLabel: 'මහා ජයග්‍රහණය', type: 'jackpot', value: 500, color: '#ec4899', textColor: '#ffffff' },
  { label: '35 Coins', subLabel: 'කොයින් 35', type: 'coins', value: 35, color: '#14b8a6', textColor: '#ffffff' },
  { label: '150 Coins', subLabel: 'කොයින් 150', type: 'coins', value: 150, color: '#f97316', textColor: '#ffffff' },
  { label: '20 Seeds', subLabel: 'වී බීජ 20', type: 'seeds', value: 20, color: '#06b6d4', textColor: '#ffffff' },
];

interface FortuneWheelProps {
  onReward: (type: 'coins' | 'seeds' | 'jackpot', amount: number) => void;
  coins: number;
  freeSpins: number;
}

export const FortuneWheel: React.FC<FortuneWheelProps> = ({ onReward, coins: _coins, freeSpins }) => {
  const [rotation, setRotation] = useState<number>(0);
  const [isSpinning, setIsSpinning] = useState<boolean>(false);
  const [lastWin, setLastWin] = useState<WheelSegment | null>(null);
  const currentRotationRef = useRef<number>(0);
  const lastTickAngleRef = useRef<number>(0);

  const numSegments = SEGMENTS.length;
  const segmentAngle = 360 / numSegments;

  const spin = () => {
    if (isSpinning) return;
    setIsSpinning(true);
    setLastWin(null);

    // Pick a random target segment
    const targetIdx = Math.floor(Math.random() * numSegments);
    const extraRotations = 5 + Math.floor(Math.random() * 3); // 5 to 7 full circles

    // Needle points at top (270 deg or -90 deg from center-right)
    // Wheel rotates clockwise
    const targetAngle = (360 - (targetIdx * segmentAngle + segmentAngle / 2) + 270) % 360;
    const finalRotation = currentRotationRef.current + (extraRotations * 360) + targetAngle - (currentRotationRef.current % 360);

    const startRot = currentRotationRef.current;
    const totalDelta = finalRotation - startRot;
    const duration = 4000; // 4 seconds spin
    const startTime = performance.now();

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / duration);
      // Ease out cubic
      const easeOut = 1 - Math.pow(1 - progress, 3.5);
      const curRot = startRot + totalDelta * easeOut;
      currentRotationRef.current = curRot;
      setRotation(curRot);

      // Play tick sound when passing each segment boundary
      if (Math.abs(curRot - lastTickAngleRef.current) >= segmentAngle) {
        sounds.playWheelTick();
        lastTickAngleRef.current = curRot;
      }

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setIsSpinning(false);
        const winningSeg = SEGMENTS[targetIdx];
        setLastWin(winningSeg);

        if (winningSeg.type === 'jackpot') {
          confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
          sounds.playWin();
        } else {
          sounds.playCoin();
          confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
        }

        onReward(winningSeg.type, winningSeg.value);
      }
    };

    requestAnimationFrame(animate);
  };

  return (
    <div className="bg-gradient-to-b from-amber-900/60 via-stone-900/80 to-stone-950 p-4 rounded-3xl border border-amber-500/30 shadow-2xl relative overflow-hidden text-center backdrop-blur-md">
      {/* Header Badge */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-amber-500/20 border border-amber-400 flex items-center justify-center text-amber-300">
            <Sparkles className="w-4 h-4 animate-spin text-amber-300" style={{ animationDuration: '6s' }} />
          </div>
          <div className="text-left">
            <h3 className="text-sm font-bold text-amber-200 tracking-wide">වාසනා රෝදය (Lucky Spin)</h3>
            <p className="text-[11px] text-amber-300/80">දිනපතා නොමිලේ කොයින් සහ ත්‍යාග දිනාගන්න</p>
          </div>
        </div>
        <div className="bg-amber-500/20 px-2.5 py-1 rounded-full border border-amber-400/40 text-[11px] font-bold text-amber-300 flex items-center gap-1">
          <RefreshCw className="w-3 h-3" />
          <span>ස්පින්: {freeSpins > 0 ? `${freeSpins} නොමිලේ` : 'නොමිලේ'}</span>
        </div>
      </div>

      {/* The Wheel Container */}
      <div className="relative mx-auto my-2 w-[270px] h-[270px] flex items-center justify-center">
        {/* Needle Indicator at Top */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -mt-2 z-30 filter drop-shadow-md">
          <div className="w-0 h-0 border-l-[14px] border-l-transparent border-r-[14px] border-r-transparent border-t-[28px] border-t-yellow-300" />
          <div className="w-2.5 h-2.5 bg-red-600 rounded-full mx-auto -mt-6 border border-white" />
        </div>

        {/* Outer Golden Rim */}
        <div className="absolute inset-0 rounded-full p-2 bg-gradient-to-tr from-amber-600 via-yellow-300 to-amber-700 shadow-[0_0_25px_rgba(245,158,11,0.4)]">
          {/* Rotating Wheel SVG */}
          <div
            className="w-full h-full rounded-full overflow-hidden shadow-inner relative"
            style={{
              transform: `rotate(${rotation}deg)`,
              transition: isSpinning ? 'none' : 'transform 0.1s ease-out',
            }}
          >
            <svg viewBox="0 0 300 300" className="w-full h-full">
              {SEGMENTS.map((seg, i) => {
                const startAngle = i * segmentAngle;
                const endAngle = startAngle + segmentAngle;
                const startRad = (startAngle * Math.PI) / 180;
                const endRad = (endAngle * Math.PI) / 180;

                const x1 = 150 + 150 * Math.cos(startRad);
                const y1 = 150 + 150 * Math.sin(startRad);
                const x2 = 150 + 150 * Math.cos(endRad);
                const y2 = 150 + 150 * Math.sin(endRad);

                const textAngle = startAngle + segmentAngle / 2;
                const textRad = (textAngle * Math.PI) / 180;
                const textX = 150 + 95 * Math.cos(textRad);
                const textY = 150 + 95 * Math.sin(textRad);

                return (
                  <g key={i}>
                    <path
                      d={`M 150 150 L ${x1} ${y1} A 150 150 0 0 1 ${x2} ${y2} Z`}
                      fill={seg.color}
                      stroke="#ffffff"
                      strokeWidth="2"
                    />
                    <g transform={`rotate(${textAngle + 90}, ${textX}, ${textY})`}>
                      <text
                        x={textX}
                        y={textY - 4}
                        fill={seg.textColor}
                        fontSize="12"
                        fontWeight="bold"
                        textAnchor="middle"
                        filter="drop-shadow(0 1px 2px rgba(0,0,0,0.8))"
                      >
                        {seg.label}
                      </text>
                      <text
                        x={textX}
                        y={textY + 10}
                        fill="#fef08a"
                        fontSize="9"
                        fontWeight="medium"
                        textAnchor="middle"
                      >
                        {seg.subLabel}
                      </text>
                    </g>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>

        {/* Central GO Button */}
        <button
          onClick={spin}
          disabled={isSpinning}
          className={`absolute z-20 w-18 h-18 rounded-full font-black text-lg tracking-wider uppercase transition-all duration-200 shadow-2xl flex flex-col items-center justify-center border-4 ${
            isSpinning
              ? 'bg-stone-700 border-stone-500 text-stone-400 cursor-not-allowed scale-95'
              : 'bg-gradient-to-b from-yellow-400 via-amber-500 to-yellow-600 border-white text-stone-900 hover:scale-105 active:scale-95 cursor-pointer shadow-amber-500/50'
          }`}
          style={{
            boxShadow: isSpinning
              ? 'none'
              : '0 0 20px rgba(245, 158, 11, 0.7), inset 0 2px 4px rgba(255, 255, 255, 0.6)',
          }}
        >
          <span className="leading-tight font-extrabold text-xl">GO</span>
          <span className="text-[8px] font-bold tracking-normal uppercase -mt-0.5 text-stone-950/80">කැරකෙන්න</span>
        </button>
      </div>

      {/* Win Banner / Notice */}
      {lastWin && (
        <div className="mt-3 py-2 px-3 bg-amber-500/20 border border-amber-400/50 rounded-2xl animate-bounce flex items-center justify-center gap-2 text-amber-200">
          <Award className="w-5 h-5 text-yellow-400" />
          <span className="text-xs font-bold">
            සුබ පැතුම්! ඔබට <span className="text-yellow-300 font-extrabold">{lastWin.label} ({lastWin.subLabel})</span> හිමිවිය!
          </span>
        </div>
      )}
    </div>
  );
};
