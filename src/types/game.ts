export interface PaddyField {
  id: number;
  status: 'empty' | 'growing' | 'ripe';
  plantedAt: number | null; // timestamp in ms
  growthDuration: number; // 60 seconds (in ms = 60000)
  watered: boolean;
  fertilized: boolean;
}

export type AnimalType = 'cow' | 'goat' | 'chicken' | 'duck';

export interface Animal {
  id: string;
  type: AnimalType;
  name: string;
  birthTime: number; // timestamp in ms
  growthDuration: number; // 60 seconds (in ms = 60000)
  fed: boolean;
  producedReady: boolean;
  lastProductionTime: number;
}

export interface CustomerOrder {
  id: string;
  customerName: string;
  avatarSeed: number;
  requestedItem: 'paddy_sack' | 'cow_milk' | 'eggs' | 'goat_milk';
  quantity: number;
  offeredCoins: number;
  reputationReward: number;
  createdAt: number;
}

export interface Assistant {
  id: string;
  name: string;
  sinhalaName: string;
  role: string;
  cost: number;
  hired: boolean;
  level: number;
  description: string;
  perkDescription: string;
}

export interface FeatureItem {
  id: string;
  title: string;
  sinhalaTitle: string;
  unlockCoins: number;
  unlocked: boolean;
  category: 'utility' | 'weather' | 'automation' | 'entertainment';
  description: string;
  sinhalaDescription: string;
  icon: string;
}

export interface IncomeRecord {
  id: string;
  timestamp: number;
  timeLabel: string;
  amount: number;
  cumulative: number;
  source: 'paddy_harvest' | 'dairy_produce' | 'animal_sale' | 'customer_shop' | 'wheel_spin' | 'drone_trade';
  sinhalaSource: string;
}

export interface HarvestRecord {
  timestamp: number;
  timeLabel: string;
  sacksCount: number;
  cumulativeHarvests: number;
}

export interface AnimalSaleRecord {
  id: string;
  timestamp: number;
  timeLabel: string;
  type: AnimalType;
  amount: number;
  sinhalaName: string;
}

export interface DailyMission {
  id: string;
  title: string;
  sinhalaTitle: string;
  description: string;
  sinhalaDescription: string;
  icon: string;
  targetCount: number;
  currentCount: number;
  rewardCoins: number;
  completed: boolean;
  claimed: boolean;
  taskType: 'harvest_paddy' | 'collect_eggs' | 'spin_wheel' | 'sell_shop' | 'feed_animal' | 'read_news' | 'water_fields';
}

export interface UserProfile {
  phoneNumber: string;
  username: string;
  registeredAt: number;
  lastLoginAt: number;
}

export interface GameSaveState {
  version: number;
  coins: number;
  reputation: number;
  lastSavedTimestamp: number;
  // Barn stock
  barn: {
    paddySacks: number;
    cowMilkBottles: number;
    eggsCount: number;
    goatMilkBottles: number;
    fertilizerBags: number;
    seedsCount: number;
  };
  fields: PaddyField[];
  animals: Animal[];
  assistants: Assistant[];
  features: FeatureItem[];
  spinWheel: {
    lastSpinTimestamp: number;
    spinsRemaining: number;
  };
  stats: {
    totalHarvests: number;
    totalAnimalsRaised: number;
    totalShopSales: number;
    totalWheelSpins: number;
    totalAnimalSales: number;
    totalCoinsEarned: number;
  };
  analytics: {
    incomeHistory: IncomeRecord[];
    harvestHistory: HarvestRecord[];
    animalSaleHistory: AnimalSaleRecord[];
    totalEarningsBySource: {
      paddy: number;
      dairy: number;
      animals: number;
      shop: number;
      wheel: number;
      drone: number;
    };
  };
  dailyMissions: {
    lastResetDate: string;
    missions: DailyMission[];
  };
}

