import { GameSaveState, PaddyField, Animal, Assistant, FeatureItem, DailyMission } from '../types/game';

const STORAGE_KEY = 'GOVI_GAMANA_SAVE_V1';

export const PADDY_GROWTH_DURATION_MS = 60000; // 1 minute (60 seconds)
export const ANIMAL_GROWTH_DURATION_MS = 60000; // 1 minute (60 seconds)

export const INITIAL_FIELDS: PaddyField[] = Array.from({ length: 10 }, (_, i) => ({
  id: i + 1,
  // Make field 1 and 2 ready or growing so first-time player can immediately play!
  status: i === 0 ? 'ripe' : i === 1 ? 'growing' : 'empty',
  plantedAt: i === 1 ? Date.now() - 30000 : i === 0 ? Date.now() - 60000 : null,
  growthDuration: PADDY_GROWTH_DURATION_MS,
  watered: i <= 1,
  fertilized: false,
}));

export const INITIAL_ANIMALS: Animal[] = [
  {
    id: 'cow-1',
    type: 'cow',
    name: 'කිරි අම්මා (Ganga)',
    birthTime: Date.now() - 35000,
    growthDuration: ANIMAL_GROWTH_DURATION_MS,
    fed: true,
    producedReady: false,
    lastProductionTime: Date.now(),
  },
  {
    id: 'goat-1',
    type: 'goat',
    name: 'රාජු (Raju)',
    birthTime: Date.now() - 40000,
    growthDuration: ANIMAL_GROWTH_DURATION_MS,
    fed: true,
    producedReady: false,
    lastProductionTime: Date.now(),
  },
  {
    id: 'chicken-1',
    type: 'chicken',
    name: 'කිකිළි (Chirpy)',
    birthTime: Date.now() - 50000,
    growthDuration: ANIMAL_GROWTH_DURATION_MS,
    fed: true,
    producedReady: false,
    lastProductionTime: Date.now(),
  },
];

export const INITIAL_ASSISTANTS: Assistant[] = [
  {
    id: 'assistant-1',
    name: 'Siripala',
    sinhalaName: 'සිරිපාල',
    role: 'වී අස්වනු සහකරු (Paddy Field Harvester)',
    cost: 100,
    hired: false,
    level: 1,
    description: 'Automatically plants seeds and harvests ripe paddy fields.',
    perkDescription: 'කුඹුරු පැසුණු සැනින් අස්වනු නෙළා නැවත වපුරයි',
  },
  {
    id: 'assistant-2',
    name: 'Bandu',
    sinhalaName: 'බන්දු',
    role: 'සත්තු පාලක සහකරු (Livestock Caretaker)',
    cost: 180,
    hired: false,
    level: 1,
    description: 'Feeds animals on time and collects fresh milk and eggs.',
    perkDescription: 'සතුන්ට නියමිත වේලාවට කෑම දී කිරි සහ බිත්තර එකතු කරයි',
  },
  {
    id: 'assistant-3',
    name: 'Manoj',
    sinhalaName: 'මනෝජ්',
    role: 'ගොවි කඩේ මුදලාලි (Market Cashier)',
    cost: 250,
    hired: false,
    level: 1,
    description: 'Auto fulfills customer orders with a 15% tip bonus.',
    perkDescription: 'ගැණුම්කරුවන්ගේ ඇණවුම් ඉක්මනින් සපුරා අමතර 15% කොයින් උපයයි',
  },
  {
    id: 'assistant-4',
    name: 'Kamala',
    sinhalaName: 'කමලා',
    role: 'ට්‍රැක්ටර් ප්‍රවාහක (Tractor Transport Specialist)',
    cost: 400,
    hired: false,
    level: 1,
    description: 'Drives the tractor to transport bulk paddy directly to the barn.',
    perkDescription: 'ට්‍රැක්ටරයෙන් විශාල වී තොග කෙලින්ම වී මඩුවට බෑම සිදු කරයි',
  },
];

export const INITIAL_FEATURES: FeatureItem[] = [
  {
    id: 'live_weather',
    title: 'Live Weather Station',
    sinhalaTitle: 'සජීවී කාලගුණ අනාවැකිය',
    unlockCoins: 150,
    unlocked: false,
    category: 'weather',
    description: 'Check real-time Sri Lankan weather. Rain gives 100% free irrigation to all 10 paddy fields!',
    sinhalaDescription: 'කොයින් 150 න් අන්ලොක් වන සජීවී කාලගුණය. වැස්ස ඇතිවිට කුඹුරු 10 ටම නොමිලේ ජලය හිමිවේ!',
    icon: 'CloudRain',
  },
  {
    id: 'solar_irrigation',
    title: 'Solar Powered Irrigation',
    sinhalaTitle: 'සූර්ය බල වාරිමාර්ග පද්ධතිය',
    unlockCoins: 300,
    unlocked: false,
    category: 'automation',
    description: 'High-tech solar pump keeps all 10 paddy fields perpetually watered.',
    sinhalaDescription: 'කුඹුරු 10 සඳහාම ස්වයංක්‍රීයව දියවර සපයන සූර්ය බලැති පොම්පය.',
    icon: 'Sun',
  },
  {
    id: 'turbo_tractor',
    title: 'Turbo Harvester Tractor',
    sinhalaTitle: 'සුපිරි වේගවත් ට්‍රැක්ටරය',
    unlockCoins: 500,
    unlocked: false,
    category: 'utility',
    description: 'Heavy duty harvester cuts all 10 fields in one single tap and gives 2x paddy sacks.',
    sinhalaDescription: 'එකවර කුඹුරු 10ම අස්වැන්න කපා වී මඩුවට පුරවන අධිවේගී ට්‍රැක්ටරය.',
    icon: 'Tractor',
  },
  {
    id: 'livestock_incubator',
    title: 'Bio Incubator & Breeding',
    sinhalaTitle: 'ජෛව අභිජනනාගාරය',
    unlockCoins: 800,
    unlocked: false,
    category: 'automation',
    description: 'Animals mature 50% faster and yield high-grade dairy and eggs.',
    sinhalaDescription: 'සතුන් වැඩීමේ කාලය අඩකින් අඩු කර වටිනාකම දෙගුණ කරයි.',
    icon: 'HeartHandshake',
  },
  {
    id: 'drone_delivery',
    title: 'Village Drone Cargo',
    sinhalaTitle: 'ග්‍රාමීය ඩ්‍රෝන ප්‍රවාහනය',
    unlockCoins: 1200,
    unlocked: false,
    category: 'automation',
    description: 'Automatic drone delivers farm goods to town for 1.5x coin prices.',
    sinhalaDescription: 'නගරයේ වෙළඳපොළට ඩ්‍රෝන මඟින් භාණ්ඩ යවා 1.5 ගුණයක කොයින් ලබා ගනී.',
    icon: 'Plane',
  },
  {
    id: 'tourism_center',
    title: 'Agro Eco-Tourism Center',
    sinhalaTitle: 'කෘෂි සංචාරක කලාපය',
    unlockCoins: 2000,
    unlocked: false,
    category: 'utility',
    description: 'Tourists visit your farm and pay continuous passive entry tickets.',
    sinhalaDescription: 'විදේශික සහ දේශීය සංචාරකයින් පැමිණ නිරන්තර ප්‍රවේශ පත්‍ර ගාස්තු ගෙවයි.',
    icon: 'Camera',
  },
  {
    id: 'govi_fm_radio',
    title: 'Govi FM Radio Station',
    sinhalaTitle: 'ගොවි එෆ්.එම් ගුවන්විදුලිය',
    unlockCoins: 3500,
    unlocked: false,
    category: 'entertainment',
    description: 'Broadcast soothing rural Sinhala village melodies & uplifting farm motivation.',
    sinhalaDescription: 'ගොවිබිමට සැනසීම ගෙනෙන ගීත සහ ප්‍රවෘත්ති විකාශනය.',
    icon: 'Radio',
  },
];

export const INITIAL_ANALYTICS = {
  incomeHistory: [
    { id: 'inc-0', timestamp: Date.now() - 300000, timeLabel: '5m ago', amount: 30, cumulative: 30, source: 'paddy_harvest' as const, sinhalaSource: 'වී අස්වැන්න' },
    { id: 'inc-1', timestamp: Date.now() - 240000, timeLabel: '4m ago', amount: 25, cumulative: 55, source: 'customer_shop' as const, sinhalaSource: 'ගොවි කඩේ' },
    { id: 'inc-2', timestamp: Date.now() - 180000, timeLabel: '3m ago', amount: 50, cumulative: 105, source: 'wheel_spin' as const, sinhalaSource: 'වාසනා රෝදය' },
    { id: 'inc-3', timestamp: Date.now() - 120000, timeLabel: '2m ago', amount: 40, cumulative: 145, source: 'dairy_produce' as const, sinhalaSource: 'එළකිරි' },
    { id: 'inc-4', timestamp: Date.now() - 60000, timeLabel: '1m ago', amount: 75, cumulative: 220, source: 'paddy_harvest' as const, sinhalaSource: 'ට්‍රැක්ටර් අස්වැන්න' },
  ],
  harvestHistory: [
    { timestamp: Date.now() - 300000, timeLabel: '5m ago', sacksCount: 1, cumulativeHarvests: 1 },
    { timestamp: Date.now() - 200000, timeLabel: '3m ago', sacksCount: 2, cumulativeHarvests: 3 },
    { timestamp: Date.now() - 120000, timeLabel: '2m ago', sacksCount: 3, cumulativeHarvests: 6 },
    { timestamp: Date.now() - 60000, timeLabel: '1m ago', sacksCount: 4, cumulativeHarvests: 10 },
  ],
  animalSaleHistory: [
    { id: 'sale-1', timestamp: Date.now() - 250000, timeLabel: '4m ago', type: 'chicken' as const, amount: 65, sinhalaName: 'කිකිළි' },
    { id: 'sale-2', timestamp: Date.now() - 100000, timeLabel: '1m ago', type: 'goat' as const, amount: 125, sinhalaName: 'එළුවා' },
  ],
  totalEarningsBySource: {
    paddy: 105,
    dairy: 40,
    animals: 190,
    shop: 65,
    wheel: 50,
    drone: 0,
  },
};

export const DEFAULT_DAILY_MISSIONS: DailyMission[] = [
  {
    id: 'mission-harvest-5',
    title: 'Harvest 5 Paddies',
    sinhalaTitle: 'වී අස්වනු 5ක් නෙළන්න',
    description: 'Harvest 5 ripe fields with sickle or tractor harvester.',
    sinhalaDescription: 'කුඹුරු 5 කින් පැසුණු වී අස්වැන්න කපා වී මඩුවට දමන්න.',
    icon: '🌾',
    targetCount: 5,
    currentCount: 0,
    rewardCoins: 50,
    completed: false,
    claimed: false,
    taskType: 'harvest_paddy',
  },
  {
    id: 'mission-eggs-3',
    title: 'Collect 3 Farm Eggs',
    sinhalaTitle: 'ගමේ බිත්තර 3ක් එකතු කරන්න',
    description: 'Feed chickens and collect organic farm eggs.',
    sinhalaDescription: 'කුකුළු කොටුවෙන් නැවුම් බිත්තර 3ක් එකතු කරගන්න.',
    icon: '🥚',
    targetCount: 3,
    currentCount: 0,
    rewardCoins: 40,
    completed: false,
    claimed: false,
    taskType: 'collect_eggs',
  },
  {
    id: 'mission-spin-1',
    title: 'Spin Fortune Wheel',
    sinhalaTitle: 'වාසනා රෝදය කැරකෙන්න හරින්න',
    description: 'Spin the Lucky Wheel once on the Dashboard.',
    sinhalaDescription: 'ඩෑෂ්බෝඩ් එකේ ඇති වාසනා රෝදයේ GO බටන් එක ඔබන්න.',
    icon: '🎡',
    targetCount: 1,
    currentCount: 0,
    rewardCoins: 35,
    completed: false,
    claimed: false,
    taskType: 'spin_wheel',
  },
  {
    id: 'mission-sell-2',
    title: 'Fulfill 2 Customer Orders',
    sinhalaTitle: 'පාරිභෝගික ඇණවුම් 2ක් සපුරන්න',
    description: 'Sell farm goods to visiting village customers at the shop.',
    sinhalaDescription: 'ගොවිපොළ කඩයට පැමිණෙන ගැණුම්කරුවන්ට බඩු විකුණන්න.',
    icon: '🏪',
    targetCount: 2,
    currentCount: 0,
    rewardCoins: 60,
    completed: false,
    claimed: false,
    taskType: 'sell_shop',
  },
  {
    id: 'mission-feed-2',
    title: 'Feed Livestock Twice',
    sinhalaTitle: 'සතුන්ට කෑම 2 වරක් ලබාදෙන්න',
    description: 'Feed cattle, goats, or poultry in the animal pens.',
    sinhalaDescription: 'සත්තු කොටුවල සතුන්ට ආදරයෙන් කෑම ලබාදෙන්න.',
    icon: '❤️',
    targetCount: 2,
    currentCount: 0,
    rewardCoins: 30,
    completed: false,
    claimed: false,
    taskType: 'feed_animal',
  },
  {
    id: 'mission-news-1',
    title: 'Read 1 Live News Story',
    sinhalaTitle: 'සජීවී පුවතක් කියවන්න',
    description: 'Read the latest real-time news story in the Live News Box.',
    sinhalaDescription: 'සජීවී පුවත් පෙට්ටියෙන් සත්‍ය ප්‍රවෘත්තියක් විවෘත කර කියවන්න.',
    icon: '📰',
    targetCount: 1,
    currentCount: 0,
    rewardCoins: 25,
    completed: false,
    claimed: false,
    taskType: 'read_news',
  },
];

export const INITIAL_GAME_STATE: GameSaveState = {
  version: 1,
  coins: 60, // friendly starting wallet to allow immediate sowing or spinning!
  reputation: 10,
  lastSavedTimestamp: Date.now(),
  barn: {
    paddySacks: 3,
    cowMilkBottles: 1,
    eggsCount: 4,
    goatMilkBottles: 0,
    fertilizerBags: 2,
    seedsCount: 15,
  },
  fields: INITIAL_FIELDS,
  animals: INITIAL_ANIMALS,
  assistants: INITIAL_ASSISTANTS,
  features: INITIAL_FEATURES,
  spinWheel: {
    lastSpinTimestamp: 0,
    spinsRemaining: 3,
  },
  stats: {
    totalHarvests: 10,
    totalAnimalsRaised: 4,
    totalShopSales: 3,
    totalWheelSpins: 1,
    totalAnimalSales: 2,
    totalCoinsEarned: 450,
  },
  analytics: INITIAL_ANALYTICS,
  dailyMissions: {
    lastResetDate: new Date().toISOString().split('T')[0],
    missions: DEFAULT_DAILY_MISSIONS,
  },
};

/**
 * Loads game state from localStorage, accurately applying elapsed offline time
 * so plants & animals grow in real time even when phone is turned off!
 */
export function loadSavedGameState(userPhone?: string): GameSaveState {
  try {
    const key = userPhone ? `GOVI_GAMANA_SAVE_${userPhone}` : STORAGE_KEY;
    let raw = localStorage.getItem(key);
    // If user phone specified but no saved state exists yet, check if legacy save exists for first user
    if (!raw && userPhone) {
      const legacyRaw = localStorage.getItem(STORAGE_KEY);
      if (legacyRaw) {
        raw = legacyRaw;
      }
    }

    if (!raw) return INITIAL_GAME_STATE;
    const parsed: GameSaveState = JSON.parse(raw);

    const now = Date.now();
    const elapsed = Math.max(0, now - (parsed.lastSavedTimestamp || now));

    // Fast-forward fields
    const updatedFields = parsed.fields.map((f) => {
      if (f.status === 'growing' && f.plantedAt) {
        const timeGrowing = now - f.plantedAt;
        if (timeGrowing >= f.growthDuration) {
          return { ...f, status: 'ripe' as const };
        }
      }
      return f;
    });

    // Ensure analytics and stats are backward-compatible
    const stats = {
      totalHarvests: parsed.stats?.totalHarvests ?? 10,
      totalAnimalsRaised: parsed.stats?.totalAnimalsRaised ?? 4,
      totalShopSales: parsed.stats?.totalShopSales ?? 3,
      totalWheelSpins: parsed.stats?.totalWheelSpins ?? 1,
      totalAnimalSales: parsed.stats?.totalAnimalSales ?? 2,
      totalCoinsEarned: parsed.stats?.totalCoinsEarned ?? parsed.coins ?? 250,
    };

    const analytics = parsed.analytics ?? INITIAL_ANALYTICS;

    // Check Daily Missions date reset
    const todayStr = new Date().toISOString().split('T')[0];
    let dailyMissions = parsed.dailyMissions;
    if (!dailyMissions || dailyMissions.lastResetDate !== todayStr) {
      dailyMissions = {
        lastResetDate: todayStr,
        missions: DEFAULT_DAILY_MISSIONS.map((m) => ({ ...m, currentCount: 0, completed: false, claimed: false })),
      };
    } else {
      // Ensure all default missions exist in case of version changes
      const existingIds = new Set(dailyMissions.missions.map((m) => m.id));
      const mergedMissions = [...dailyMissions.missions];
      DEFAULT_DAILY_MISSIONS.forEach((dm) => {
        if (!existingIds.has(dm.id)) {
          mergedMissions.push(dm);
        }
      });
      dailyMissions.missions = mergedMissions;
    }

    // Fast-forward animals
    const updatedAnimals = parsed.animals.map((a) => {
      const age = now - a.birthTime;
      const isMature = age >= a.growthDuration;
      return {
        ...a,
        producedReady: isMature ? true : a.producedReady,
      };
    });

    // Check if features should be automatically unlocked based on coins
    const updatedFeatures = parsed.features.map((feat) => {
      if (parsed.coins >= feat.unlockCoins) {
        return { ...feat, unlocked: true };
      }
      return feat;
    });

    return {
      ...parsed,
      stats,
      analytics,
      dailyMissions,
      fields: updatedFields,
      animals: updatedAnimals,
      features: updatedFeatures,
      lastSavedTimestamp: now,
    };
  } catch (e) {
    console.error('Failed to load save state, returning initial state', e);
    return INITIAL_GAME_STATE;
  }
}

export function saveGameStateToStorage(state: GameSaveState, userPhone?: string): void {
  try {
    const toSave: GameSaveState = {
      ...state,
      lastSavedTimestamp: Date.now(),
    };
    const serialized = JSON.stringify(toSave);
    localStorage.setItem(STORAGE_KEY, serialized);
    if (userPhone) {
      localStorage.setItem(`GOVI_GAMANA_SAVE_${userPhone}`, serialized);
    }
  } catch (e) {
    console.error('Failed to persist game state', e);
  }
}

