import React from 'react';

export type ActiveTab =
  | 'three_world'
  | 'dashboard'
  | 'animals'
  | 'shop'
  | 'news'
  | 'analytics'
  | 'features';

interface NavigationProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  unlockedFeaturesCount: number;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  onTabChange,
  unlockedFeaturesCount,
}) => {
  const tabs = [
    { id: 'three_world' as ActiveTab, label: '3D ලෝකය', subLabel: '3D Farm', icon: '🌐' },
    { id: 'dashboard' as ActiveTab, label: 'කුඹුරු', subLabel: 'Fields', icon: '🌾' },
    { id: 'shop' as ActiveTab, label: 'කඩය & AI', subLabel: 'Shop & AI', icon: '🏪' },
    { id: 'news' as ActiveTab, label: 'පුවත්', subLabel: 'Live News', icon: '📰' },
    { id: 'animals' as ActiveTab, label: 'සත්තු', subLabel: 'Animals', icon: '🐄' },
    { id: 'analytics' as ActiveTab, label: 'ප්‍රස්ථාර', subLabel: 'Stats', icon: '📊' },
    { id: 'features' as ActiveTab, label: 'ෆීචර්ස්', subLabel: 'Features', icon: '🎁', badge: unlockedFeaturesCount },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto z-40 bg-stone-950/95 backdrop-blur-lg border-t border-amber-500/20 px-1 py-1 shadow-[0_-5px_25px_rgba(0,0,0,0.85)]">
      <div className="grid grid-cols-7 gap-0.5">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`py-1.5 px-0.5 rounded-xl flex flex-col items-center justify-center relative transition-all duration-150 cursor-pointer ${
                isActive
                  ? 'bg-gradient-to-b from-amber-500/30 to-amber-600/10 text-amber-300 font-black border border-amber-400/40 shadow-sm scale-102'
                  : 'text-stone-400 hover:text-stone-200 hover:bg-stone-900/60 font-medium'
              }`}
            >
              <span className="text-base leading-none mb-0.5">{tab.icon}</span>
              <span className="text-[9px] leading-tight text-center truncate max-w-full font-bold">
                {tab.label}
              </span>

              {tab.badge !== undefined && tab.badge > 0 && (
                <span className="absolute -top-1 -right-0.5 bg-gradient-to-r from-amber-500 to-red-500 text-stone-950 text-[7px] font-black w-3.5 h-3.5 rounded-full flex items-center justify-center shadow-md">
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
