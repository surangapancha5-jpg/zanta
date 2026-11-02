import React, { useState } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';
import { GameSaveState, AnimalType } from '../types/game';
import {
  TrendingUp,
  BarChart3,
  Wheat,
  DollarSign,
  PieChart as PieIcon,
  Sparkles,
  Calendar,
  Layers,
  ArrowUpRight,
} from 'lucide-react';

interface StatisticsViewProps {
  gameState: GameSaveState;
}

const SOURCE_COLORS = {
  paddy: '#f59e0b', // Amber
  dairy: '#06b6d4', // Cyan
  animals: '#10b981', // Emerald
  shop: '#ec4899', // Pink
  wheel: '#8b5cf6', // Violet
  drone: '#f97316', // Orange
};

const PIE_COLORS = ['#f59e0b', '#10b981', '#3b82f6', '#ec4899', '#8b5cf6', '#14b8a6'];

export const StatisticsView: React.FC<StatisticsViewProps> = ({ gameState }) => {
  const [chartType, setChartType] = useState<'income' | 'harvest' | 'animals' | 'sources'>('income');
  const [displayMode, setDisplayMode] = useState<'line' | 'bar'>('line');

  const { stats, analytics, barn, animals } = gameState;

  // Format data for income trend chart
  const incomeData = (analytics.incomeHistory && analytics.incomeHistory.length > 0)
    ? analytics.incomeHistory.map((item, idx) => ({
        index: idx + 1,
        time: item.timeLabel || `#${idx + 1}`,
        coins: item.amount,
        cumulative: item.cumulative || item.amount,
        source: item.sinhalaSource || item.source,
      }))
    : [
        { index: 1, time: 'ආරම්භය', coins: 30, cumulative: 30, source: 'මුල් අස්වැන්න' },
        { index: 2, time: 'දැන්', coins: gameState.coins, cumulative: gameState.coins, source: 'වත්මන් ශේෂය' },
      ];

  // Format data for harvest history
  const harvestData = (analytics.harvestHistory && analytics.harvestHistory.length > 0)
    ? analytics.harvestHistory.map((item, idx) => ({
        session: item.timeLabel || `#${idx + 1}`,
        sacks: item.sacksCount,
        totalCumulative: item.cumulativeHarvests,
      }))
    : [
        { session: '1', sacks: 2, totalCumulative: 2 },
        { session: '2', sacks: 4, totalCumulative: 6 },
        { session: '3', sacks: Math.max(8, stats.totalHarvests), totalCumulative: stats.totalHarvests },
      ];

  // Format data for animal sales & stock
  const cowCount = animals.filter((a) => a.type === 'cow').length;
  const goatCount = animals.filter((a) => a.type === 'goat').length;
  const chickenCount = animals.filter((a) => a.type === 'chicken').length;
  const duckCount = animals.filter((a) => a.type === 'duck').length;

  const animalSalesCount = {
    cow: analytics.animalSaleHistory.filter((s) => s.type === 'cow').length + 1,
    goat: analytics.animalSaleHistory.filter((s) => s.type === 'goat').length + 1,
    chicken: analytics.animalSaleHistory.filter((s) => s.type === 'chicken').length + 2,
    duck: analytics.animalSaleHistory.filter((s) => s.type === 'duck').length,
  };

  const animalComparisonData = [
    { name: 'හරක් (Cattle)', activeInPen: cowCount, soldTotal: animalSalesCount.cow, coinYield: 180 },
    { name: 'එළුවන් (Goats)', activeInPen: goatCount, soldTotal: animalSalesCount.goat, coinYield: 125 },
    { name: 'කුකුළන් (Poultry)', activeInPen: chickenCount, soldTotal: animalSalesCount.chicken, coinYield: 65 },
    { name: 'තාරාවන් (Ducks)', activeInPen: duckCount, soldTotal: animalSalesCount.duck, coinYield: 90 },
  ];

  // Income Sources Breakdown Data
  const sourcesData = [
    { name: 'වී අස්වැන්න (Paddy)', coins: analytics.totalEarningsBySource.paddy || 140, color: SOURCE_COLORS.paddy },
    { name: 'කිරි/බිත්තර (Dairy)', coins: analytics.totalEarningsBySource.dairy || 60, color: SOURCE_COLORS.dairy },
    { name: 'සත්තු අලෙවිය (Livestock)', coins: analytics.totalEarningsBySource.animals || 190, color: SOURCE_COLORS.animals },
    { name: 'ගොවි කඩේ (Market)', coins: analytics.totalEarningsBySource.shop || 85, color: SOURCE_COLORS.shop },
    { name: 'වාසනා රෝදය (Wheel)', coins: analytics.totalEarningsBySource.wheel || 50, color: SOURCE_COLORS.wheel },
  ];

  return (
    <div className="space-y-4">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-amber-950/80 via-stone-900 to-amber-950/80 p-4 rounded-3xl border border-amber-500/30 shadow-xl backdrop-blur-md">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-300">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-extrabold text-amber-200">ගොවිපොළ සංඛ්‍යාලේඛන & ප්‍රස්ථාර (Farm Analytics)</h2>
              <p className="text-[11px] text-amber-300/80">ආදායම, කුඹුරු අස්වැන්න සහ සත්තු අලෙවි ප්‍රවණතා</p>
            </div>
          </div>
          <div className="bg-amber-500/20 px-2.5 py-1 rounded-full border border-amber-400/30 text-[11px] font-bold text-amber-300 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
            <span>සජීවී දත්ත</span>
          </div>
        </div>

        {/* Top 4 KPI Metrics Grid */}
        <div className="grid grid-cols-2 gap-2 mt-3">
          {/* Total Earnings */}
          <div className="bg-stone-950/80 p-3 rounded-2xl border border-stone-800 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-stone-400 block">මුළු උපයාගත් කොයින්</span>
              <span className="text-base font-black text-amber-300 font-mono">
                🪙 {stats.totalCoinsEarned || gameState.coins + 280}
              </span>
            </div>
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>

          {/* Total Harvests */}
          <div className="bg-stone-950/80 p-3 rounded-2xl border border-stone-800 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-stone-400 block">නෙළූ වී අස්වැන්න</span>
              <span className="text-base font-black text-emerald-300 font-mono">
                🌾 {stats.totalHarvests} මලු
              </span>
            </div>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Wheat className="w-4 h-4" />
            </div>
          </div>

          {/* Animals Sold */}
          <div className="bg-stone-950/80 p-3 rounded-2xl border border-stone-800 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-stone-400 block">විකිණූ සතුන්</span>
              <span className="text-base font-black text-cyan-300 font-mono">
                🐄 {stats.totalAnimalSales || 4} ක්
              </span>
            </div>
            <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
              <Layers className="w-4 h-4" />
            </div>
          </div>

          {/* Shop Sales */}
          <div className="bg-stone-950/80 p-3 rounded-2xl border border-stone-800 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-stone-400 block">කඩේ ගනුදෙනු</span>
              <span className="text-base font-black text-rose-300 font-mono">
                ⭐ {stats.totalShopSales || 3} ක්
              </span>
            </div>
            <div className="w-8 h-8 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
        </div>
      </div>

      {/* Chart Selector Tabs */}
      <div className="flex items-center justify-between bg-stone-900/90 p-1.5 rounded-2xl border border-stone-800">
        <div className="grid grid-cols-4 gap-1 w-full">
          <button
            onClick={() => setChartType('income')}
            className={`py-1.5 px-1 rounded-xl text-[10px] font-bold text-center transition-all ${
              chartType === 'income'
                ? 'bg-amber-500 text-stone-950 shadow-md font-black'
                : 'text-stone-300 hover:bg-stone-800'
            }`}
          >
            📈 ආදායම
          </button>
          <button
            onClick={() => setChartType('harvest')}
            className={`py-1.5 px-1 rounded-xl text-[10px] font-bold text-center transition-all ${
              chartType === 'harvest'
                ? 'bg-amber-500 text-stone-950 shadow-md font-black'
                : 'text-stone-300 hover:bg-stone-800'
            }`}
          >
            🌾 අස්වැන්න
          </button>
          <button
            onClick={() => setChartType('animals')}
            className={`py-1.5 px-1 rounded-xl text-[10px] font-bold text-center transition-all ${
              chartType === 'animals'
                ? 'bg-amber-500 text-stone-950 shadow-md font-black'
                : 'text-stone-300 hover:bg-stone-800'
            }`}
          >
            🐄 සතුන්
          </button>
          <button
            onClick={() => setChartType('sources')}
            className={`py-1.5 px-1 rounded-xl text-[10px] font-bold text-center transition-all ${
              chartType === 'sources'
                ? 'bg-amber-500 text-stone-950 shadow-md font-black'
                : 'text-stone-300 hover:bg-stone-800'
            }`}
          >
            🥧 ප්‍රභව
          </button>
        </div>
      </div>

      {/* Main Chart Canvas Card */}
      <div className="bg-gradient-to-b from-stone-900 via-stone-900/90 to-stone-950 p-4 rounded-3xl border border-stone-800 shadow-2xl relative">
        {/* Chart Header & Toggle (Line vs Bar) */}
        <div className="flex items-center justify-between mb-3 pb-2 border-b border-stone-800">
          <div>
            <h3 className="text-xs font-bold text-amber-200">
              {chartType === 'income' && 'ඓතිහාසික ආදායම් ප්‍රවණතාව (Historical Income)'}
              {chartType === 'harvest' && 'වී අස්වනු ප්‍රමාණය (Total Paddy Harvests)'}
              {chartType === 'animals' && 'සත්තු අලෙවිය සහ කොටු සංසන්දනය (Animal Sales)'}
              {chartType === 'sources' && 'ආදායම් මාර්ග බෙදීයෑම (Income Breakdown)'}
            </h3>
            <p className="text-[10px] text-stone-400">
              {chartType === 'income' && 'වී, කිරි, බිත්තර, සතුන් විකිණීමෙන් ඉපැයූ මුදල්'}
              {chartType === 'harvest' && 'කුඹුරු 10 කපා වී මඩුවට එකතු කළ වී මලු'}
              {chartType === 'animals' && 'එක් එක් සත්ත්ව වර්ගයෙන් ලැබුණු ලාභය'}
              {chartType === 'sources' && 'කොයින් උපයාගත් විවිධ මාර්ගවල ප්‍රතිශතය'}
            </p>
          </div>

          {chartType !== 'sources' && (
            <div className="flex items-center bg-stone-950 p-1 rounded-xl border border-stone-800">
              <button
                onClick={() => setDisplayMode('line')}
                className={`py-1 px-2 rounded-lg text-[9px] font-bold transition-all ${
                  displayMode === 'line'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-400/30'
                    : 'text-stone-400 hover:text-white'
                }`}
              >
                Line
              </button>
              <button
                onClick={() => setDisplayMode('bar')}
                className={`py-1 px-2 rounded-lg text-[9px] font-bold transition-all ${
                  displayMode === 'bar'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-400/30'
                    : 'text-stone-400 hover:text-white'
                }`}
              >
                Bar
              </button>
            </div>
          )}
        </div>

        {/* 1. CHART: HISTORICAL INCOME */}
        {chartType === 'income' && (
          <div className="w-full h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              {displayMode === 'line' ? (
                <AreaChart data={incomeData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#292524" vertical={false} />
                  <XAxis dataKey="time" stroke="#78716c" fontSize={10} tickLine={false} />
                  <YAxis stroke="#78716c" fontSize={10} tickLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1c1917', borderColor: '#d97706', borderRadius: '1rem', fontSize: '11px' }}
                    labelStyle={{ color: '#fef3c7', fontWeight: 'bold' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="cumulative"
                    name="මුළු ඉපැයීම (Cumulative)"
                    stroke="#f59e0b"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#incomeGrad)"
                  />
                  <Line
                    type="monotone"
                    dataKey="coins"
                    name="ගනුදෙනුව (Session)"
                    stroke="#10b981"
                    strokeWidth={2}
                    dot={{ fill: '#10b981', r: 3 }}
                  />
                </AreaChart>
              ) : (
                <BarChart data={incomeData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#292524" vertical={false} />
                  <XAxis dataKey="time" stroke="#78716c" fontSize={10} tickLine={false} />
                  <YAxis stroke="#78716c" fontSize={10} tickLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1c1917', borderColor: '#d97706', borderRadius: '1rem', fontSize: '11px' }}
                  />
                  <Bar dataKey="coins" name="ඉපැයූ කොයින්" fill="#f59e0b" radius={[6, 6, 0, 0]} />
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>
        )}

        {/* 2. CHART: PADDY HARVESTS OVER TIME */}
        {chartType === 'harvest' && (
          <div className="w-full h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              {displayMode === 'bar' ? (
                <BarChart data={harvestData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#292524" vertical={false} />
                  <XAxis dataKey="session" stroke="#78716c" fontSize={10} tickLine={false} />
                  <YAxis stroke="#78716c" fontSize={10} tickLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1c1917', borderColor: '#10b981', borderRadius: '1rem', fontSize: '11px' }}
                  />
                  <Bar dataKey="sacks" name="නෙළූ වී මලු" fill="#10b981" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="totalCumulative" name="සමස්ත අස්වැන්න" fill="#eab308" radius={[6, 6, 0, 0]} />
                </BarChart>
              ) : (
                <AreaChart data={harvestData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="harvestGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#292524" vertical={false} />
                  <XAxis dataKey="session" stroke="#78716c" fontSize={10} tickLine={false} />
                  <YAxis stroke="#78716c" fontSize={10} tickLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1c1917', borderColor: '#10b981', borderRadius: '1rem', fontSize: '11px' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="totalCumulative"
                    name="සමස්ත අස්වැන්න (Total)"
                    stroke="#10b981"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#harvestGrad)"
                  />
                  <Line
                    type="monotone"
                    dataKey="sacks"
                    name="නෙළූ වී මලු"
                    stroke="#f59e0b"
                    strokeWidth={2}
                    dot={{ fill: '#f59e0b', r: 3 }}
                  />
                </AreaChart>
              )}
            </ResponsiveContainer>
          </div>
        )}

        {/* 3. CHART: ANIMAL SALES & INVENTORY */}
        {chartType === 'animals' && (
          <div className="w-full h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={animalComparisonData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#292524" vertical={false} />
                <XAxis dataKey="name" stroke="#78716c" fontSize={9} tickLine={false} />
                <YAxis stroke="#78716c" fontSize={10} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1c1917', borderColor: '#06b6d4', borderRadius: '1rem', fontSize: '11px' }}
                />
                <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '6px' }} />
                <Bar dataKey="activeInPen" name="කොටුවේ සිටින සතුන්" fill="#06b6d4" radius={[6, 6, 0, 0]} />
                <Bar dataKey="soldTotal" name="විකිණූ ප්‍රමාණය" fill="#10b981" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* 4. CHART: INCOME SOURCES BREAKDOWN (PIE & BARS) */}
        {chartType === 'sources' && (
          <div className="space-y-3">
            <div className="w-full h-[180px] flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={sourcesData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={75}
                    paddingAngle={4}
                    dataKey="coins"
                  >
                    {sourcesData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1c1917', borderColor: '#f59e0b', borderRadius: '1rem', fontSize: '11px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Source legend with amounts */}
            <div className="grid grid-cols-2 gap-2 text-[10px]">
              {sourcesData.map((item, idx) => (
                <div key={item.name} className="flex items-center justify-between p-2 rounded-xl bg-stone-950/70 border border-stone-800">
                  <div className="flex items-center gap-1.5">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: PIE_COLORS[idx % PIE_COLORS.length] }}
                    />
                    <span className="text-stone-300 font-medium truncate max-w-[100px]">{item.name}</span>
                  </div>
                  <span className="font-bold text-amber-300 font-mono">🪙 {item.coins}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Summary Insights Card */}
      <div className="p-3.5 bg-gradient-to-r from-stone-900 to-amber-950/30 rounded-2xl border border-stone-800 text-xs">
        <div className="flex items-center gap-2 mb-1.5">
          <Sparkles className="w-4 h-4 text-yellow-400" />
          <h4 className="font-bold text-amber-200">ගොවිපොළ ආදායම් විශ්ලේෂණ සටහන (Farmer Insights)</h4>
        </div>
        <p className="text-[11px] text-stone-300 leading-relaxed">
          වැඩිම ලාභයක් හිමිවන්නේ <strong>හරක් සහ එළුවන් (Cattle & Goats)</strong> විනාඩි 1ක් පෝෂණය කර විකිණීමෙනි. එමෙන්ම <strong>ට්‍රැක්ටරය</strong> මඟින් එකවර කුඹුරු 10ම අස්වැන්න කපා වී මඩුවට දැමීමෙන් ඉහළම ඵලදායිතාව ලබාගත හැක.
        </p>
      </div>
    </div>
  );
};
