/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  GameSaveState,
  PaddyField,
  Animal,
  AnimalType,
  CustomerOrder,
  FeatureItem,
  IncomeRecord,
  HarvestRecord,
  AnimalSaleRecord,
  DailyMission,
  UserProfile,
} from './types/game';
import {
  loadSavedGameState,
  saveGameStateToStorage,
  INITIAL_GAME_STATE,
  PADDY_GROWTH_DURATION_MS,
  ANIMAL_GROWTH_DURATION_MS,
} from './services/gameState';
import { getActiveUser, logoutActiveUser } from './services/authService';
import { sounds } from './services/soundEffects';
import { HeaderBar } from './components/HeaderBar';
import { Navigation, ActiveTab } from './components/Navigation';
import { FortuneWheel } from './components/FortuneWheel';
import { PaddyFieldsView } from './components/PaddyFieldsView';
import { AnimalPensView } from './components/AnimalPensView';
import { ShopAndBarnView } from './components/ShopAndBarnView';
import { AssistantsView } from './components/AssistantsView';
import { FeaturesBoxView } from './components/FeaturesBoxView';
import { ThreeFarmWorld } from './components/ThreeFarmWorld';
import { StatisticsView } from './components/StatisticsView';
import { LiveNewsBox } from './components/LiveNewsBox';
import { DailyMissionsBox } from './components/DailyMissionsBox';
import { AuthModal } from './components/AuthModal';

export default function App() {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => getActiveUser());
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(() => !getActiveUser());
  const [gameState, setGameState] = useState<GameSaveState>(() => loadSavedGameState(getActiveUser()?.phoneNumber));
  const [activeTab, setActiveTab] = useState<ActiveTab>('three_world');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const gameStateRef = useRef<GameSaveState>(gameState);
  gameStateRef.current = gameState;
  const currentUserRef = useRef<UserProfile | null>(currentUser);
  currentUserRef.current = currentUser;

  // Auto-save on state change
  useEffect(() => {
    saveGameStateToStorage(gameState, currentUser?.phoneNumber);
  }, [gameState, currentUser]);


  // Periodic Auto-save & Assistant Automation Loop (every 5 seconds)
  useEffect(() => {
    const autoSaveInterval = setInterval(() => {
      setGameState((prev) => {
        let newCoins = prev.coins;
        const now = Date.now();

        // 1. Check if paddy fields finished growing
        let fieldsUpdated = false;
        const updatedFields = prev.fields.map((f) => {
          if (f.status === 'growing' && f.plantedAt && now - f.plantedAt >= f.growthDuration) {
            fieldsUpdated = true;
            return { ...f, status: 'ripe' as const };
          }
          return f;
        });

        // 2. Check if animals finished growing
        let animalsUpdated = false;
        const updatedAnimals = prev.animals.map((a) => {
          if (!a.producedReady && now - a.birthTime >= a.growthDuration) {
            animalsUpdated = true;
            return { ...a, producedReady: true };
          }
          return a;
        });

        // 3. Assistants Automation Perks:
        // Siripala: Auto harvests 1 ripe field if hired
        const siripala = prev.assistants.find((a) => a.id === 'assistant-1' && a.hired);
        let updatedBarn = { ...prev.barn };

        if (siripala) {
          const ripeIdx = updatedFields.findIndex((f) => f.status === 'ripe');
          if (ripeIdx !== -1) {
            updatedFields[ripeIdx] = {
              ...updatedFields[ripeIdx],
              status: 'empty',
              plantedAt: null,
            };
            updatedBarn.paddySacks += 1;
            fieldsUpdated = true;
          }
        }

        // Bandu: Auto collects animal produce
        const bandu = prev.assistants.find((a) => a.id === 'assistant-2' && a.hired);
        if (bandu) {
          updatedAnimals.forEach((anim) => {
            if (anim.producedReady) {
              if (anim.type === 'cow') updatedBarn.cowMilkBottles += 1;
              else if (anim.type === 'goat') updatedBarn.goatMilkBottles += 1;
              else if (anim.type === 'chicken' || anim.type === 'duck') updatedBarn.eggsCount += 1;
            }
          });
        }

        // Automatic unlock of features based on current coins
        const updatedFeatures = prev.features.map((feat) => {
          if (newCoins >= feat.unlockCoins && !feat.unlocked) {
            return { ...feat, unlocked: true };
          }
          return feat;
        });

        return {
          ...prev,
          coins: newCoins,
          fields: fieldsUpdated ? updatedFields : prev.fields,
          animals: animalsUpdated ? updatedAnimals : prev.animals,
          barn: updatedBarn,
          features: updatedFeatures,
          lastSavedTimestamp: now,
        };
      });
    }, 4000);

    return () => clearInterval(autoSaveInterval);
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Helper to record an income transaction in analytics
  const recordIncome = (
    amount: number,
    source: 'paddy_harvest' | 'dairy_produce' | 'animal_sale' | 'customer_shop' | 'wheel_spin' | 'drone_trade',
    sinhalaSource: string
  ) => {
    const now = Date.now();
    const timeLabel = new Date(now).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const lastCumulative = gameState.analytics.incomeHistory.length > 0
      ? gameState.analytics.incomeHistory[gameState.analytics.incomeHistory.length - 1].cumulative
      : gameState.stats.totalCoinsEarned || 0;

    const newRecord: IncomeRecord = {
      id: `inc-${now}`,
      timestamp: now,
      timeLabel,
      amount,
      cumulative: lastCumulative + amount,
      source,
      sinhalaSource,
    };

    setGameState((prev) => {
      const sourceKey =
        source === 'paddy_harvest' ? 'paddy' :
        source === 'dairy_produce' ? 'dairy' :
        source === 'animal_sale' ? 'animals' :
        source === 'customer_shop' ? 'shop' :
        source === 'wheel_spin' ? 'wheel' : 'drone';

      return {
        ...prev,
        stats: {
          ...prev.stats,
          totalCoinsEarned: (prev.stats.totalCoinsEarned || prev.coins) + amount,
        },
        analytics: {
          ...prev.analytics,
          incomeHistory: [...prev.analytics.incomeHistory.slice(-20), newRecord],
          totalEarningsBySource: {
            ...prev.analytics.totalEarningsBySource,
            [sourceKey]: (prev.analytics.totalEarningsBySource[sourceKey] || 0) + amount,
          },
        },
      };
    });
  };

  // Advance progress for Daily Missions
  const advanceMissionProgress = (
    taskType: DailyMission['taskType'],
    amount: number = 1
  ) => {
    setGameState((prev) => {
      let anyJustCompleted = false;
      const updatedMissions = prev.dailyMissions.missions.map((m) => {
        if (m.taskType === taskType && !m.completed) {
          const nextCount = Math.min(m.targetCount, m.currentCount + amount);
          const isNowCompleted = nextCount >= m.targetCount;
          if (isNowCompleted && !m.completed) {
            anyJustCompleted = true;
          }
          return {
            ...m,
            currentCount: nextCount,
            completed: isNowCompleted,
          };
        }
        return m;
      });

      if (anyJustCompleted) {
        sounds.playWin();
        showToast('🎯 දෛනික මෙහෙයුමක් සාර්ථකව සම්පූර්ණ විය! (Mission Completed!)');
      }

      return {
        ...prev,
        dailyMissions: {
          ...prev.dailyMissions,
          missions: updatedMissions,
        },
      };
    });
  };

  const handleClaimMissionReward = (missionId: string, rewardCoins: number) => {
    recordIncome(rewardCoins, 'customer_shop', 'දෛනික මෙහෙයුම් ත්‍යාගය');
    setGameState((prev) => ({
      ...prev,
      coins: prev.coins + rewardCoins,
      dailyMissions: {
        ...prev.dailyMissions,
        missions: prev.dailyMissions.missions.map((m) =>
          m.id === missionId ? { ...m, claimed: true } : m
        ),
      },
    }));
    showToast(`දෛනික මෙහෙයුම් ත්‍යාගය +${rewardCoins} කොයින් හිමිවිය! 🎯🪙`);
  };

  // Helper to record a harvest batch in analytics
  const recordHarvest = (sacksCount: number) => {
    const now = Date.now();
    const timeLabel = new Date(now).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newTotal = (gameState.stats.totalHarvests || 0) + sacksCount;

    const harvestRec: HarvestRecord = {
      timestamp: now,
      timeLabel,
      sacksCount,
      cumulativeHarvests: newTotal,
    };

    advanceMissionProgress('harvest_paddy', sacksCount);

    setGameState((prev) => ({
      ...prev,
      analytics: {
        ...prev.analytics,
        harvestHistory: [...prev.analytics.harvestHistory.slice(-20), harvestRec],
      },
    }));
  };

  // ---------------------------------------------------------------
  // PADDY FIELDS ACTIONS
  // ---------------------------------------------------------------
  const handlePlantField = (fieldId: number) => {
    if (gameState.barn.seedsCount <= 0) {
      showToast('බීජ අවසන් වී ඇත! කඩෙන් බීජ මිලදී ගන්න.');
      return;
    }
    sounds.playHarvest();
    setGameState((prev) => ({
      ...prev,
      barn: { ...prev.barn, seedsCount: prev.barn.seedsCount - 1 },
      fields: prev.fields.map((f) =>
        f.id === fieldId
          ? {
              ...f,
              status: 'growing',
              plantedAt: Date.now(),
              growthDuration: PADDY_GROWTH_DURATION_MS,
              watered: true,
            }
          : f
      ),
    }));
    showToast(`කුඹුර #${fieldId} සඳහා වී වැපිරුවා! (විනාඩි 1කින් පැසේ)`);
  };

  const handlePlantAllFields = () => {
    const emptyFields = gameState.fields.filter((f) => f.status === 'empty');
    const toPlant = Math.min(emptyFields.length, gameState.barn.seedsCount);
    if (toPlant <= 0) return;

    let plantedSoFar = 0;
    setGameState((prev) => ({
      ...prev,
      barn: { ...prev.barn, seedsCount: prev.barn.seedsCount - toPlant },
      fields: prev.fields.map((f) => {
        if (f.status === 'empty' && plantedSoFar < toPlant) {
          plantedSoFar++;
          return {
            ...f,
            status: 'growing',
            plantedAt: Date.now(),
            growthDuration: PADDY_GROWTH_DURATION_MS,
            watered: true,
          };
        }
        return f;
      }),
    }));
    showToast(`කුඹුරු ${toPlant} ක එකවර වී වැපිරුවා!`);
  };

  const handleWaterField = (fieldId: number) => {
    sounds.playWater();
    setGameState((prev) => ({
      ...prev,
      fields: prev.fields.map((f) => (f.id === fieldId ? { ...f, watered: true } : f)),
    }));
    showToast(`කුඹුර #${fieldId} සඳහා දියවර සැපයුවා! 💧`);
  };

  const handleWaterAllFields = () => {
    sounds.playWater();
    setGameState((prev) => ({
      ...prev,
      fields: prev.fields.map((f) => ({ ...f, watered: true })),
    }));
    showToast('කුඹුරු 10 ටම දියවර සැපයුවා! 💧');
  };

  const handleHarvestField = (fieldId: number) => {
    sounds.playHarvest();
    sounds.playCoin();
    recordHarvest(1);

    setGameState((prev) => ({
      ...prev,
      barn: { ...prev.barn, paddySacks: prev.barn.paddySacks + 1 },
      stats: { ...prev.stats, totalHarvests: prev.stats.totalHarvests + 1 },
      fields: prev.fields.map((f) =>
        f.id === fieldId ? { ...f, status: 'empty', plantedAt: null } : f
      ),
    }));
    showToast('අස්වැන්න කපා වී මඩුවට දැම්මා! (+1 වී මල්ල)');
  };

  const handleTractorHarvestAll = () => {
    const ripeFields = gameState.fields.filter((f) => {
      if (f.status === 'ripe') return true;
      if (f.status === 'growing' && f.plantedAt && Date.now() - f.plantedAt >= f.growthDuration) return true;
      return false;
    });

    if (ripeFields.length === 0) return;

    const sacksGained = ripeFields.length;
    sounds.playCoin();
    recordHarvest(sacksGained);

    setGameState((prev) => ({
      ...prev,
      barn: { ...prev.barn, paddySacks: prev.barn.paddySacks + sacksGained },
      stats: { ...prev.stats, totalHarvests: prev.stats.totalHarvests + sacksGained },
      fields: prev.fields.map((f) => {
        const isRipe =
          f.status === 'ripe' ||
          (f.status === 'growing' && f.plantedAt && Date.now() - f.plantedAt >= f.growthDuration);
        if (isRipe) {
          return { ...f, status: 'empty', plantedAt: null };
        }
        return f;
      }),
    }));
    showToast(`🚜 ට්‍රැක්ටරයෙන් කුඹුරු ${ripeFields.length} ම අස්වැන්න කපා වී මඩුවට ගෙනගියා! (+${sacksGained} වී මලු)`);
  };

  // ---------------------------------------------------------------
  // FORTUNE WHEEL REWARDS
  // ---------------------------------------------------------------
  const handleWheelReward = (type: 'coins' | 'seeds' | 'jackpot', amount: number) => {
    advanceMissionProgress('spin_wheel', 1);

    if (type === 'coins' || type === 'jackpot') {
      recordIncome(amount, 'wheel_spin', 'වාසනා රෝදය');
    }

    setGameState((prev) => {
      let addCoins = 0;
      let addSeeds = 0;
      if (type === 'coins' || type === 'jackpot') {
        addCoins = amount;
      } else if (type === 'seeds') {
        addSeeds = amount;
      }
      return {
        ...prev,
        coins: prev.coins + addCoins,
        barn: {
          ...prev.barn,
          seedsCount: prev.barn.seedsCount + addSeeds,
        },
        spinWheel: {
          ...prev.spinWheel,
          lastSpinTimestamp: Date.now(),
        },
        stats: {
          ...prev.stats,
          totalWheelSpins: prev.stats.totalWheelSpins + 1,
        },
      };
    });
    showToast(`වාසනා රෝදයෙන් ත්‍යාගය හිමිවිය! 🎉`);
  };

  // ---------------------------------------------------------------
  // ANIMAL ACTIONS
  // ---------------------------------------------------------------
  const handleBuyAnimal = (type: AnimalType) => {
    const costs = { cow: 60, goat: 40, chicken: 20, duck: 30 };
    const cost = costs[type];
    if (gameState.coins < cost) return;

    const newAnimal: Animal = {
      id: `${type}-${Date.now()}`,
      type,
      name:
        type === 'cow'
          ? `එළදෙන #${gameState.animals.filter((a) => a.type === 'cow').length + 1}`
          : type === 'goat'
          ? `එළුවා #${gameState.animals.filter((a) => a.type === 'goat').length + 1}`
          : type === 'chicken'
          ? `කිකිළි #${gameState.animals.filter((a) => a.type === 'chicken').length + 1}`
          : `තාරාවා #${gameState.animals.filter((a) => a.type === 'duck').length + 1}`,
      birthTime: Date.now(),
      growthDuration: ANIMAL_GROWTH_DURATION_MS,
      fed: true,
      producedReady: false,
      lastProductionTime: Date.now(),
    };

    setGameState((prev) => ({
      ...prev,
      coins: prev.coins - cost,
      animals: [...prev.animals, newAnimal],
      stats: { ...prev.stats, totalAnimalsRaised: prev.stats.totalAnimalsRaised + 1 },
    }));
    showToast(`නව පැටවෙකු කොටුවට එක්කරන ලදී! (විනාඩි 1කින් ලොකු වේ)`);
  };

  const handleFeedAnimal = (animalId: string) => {
    advanceMissionProgress('feed_animal', 1);

    setGameState((prev) => ({
      ...prev,
      animals: prev.animals.map((a) => (a.id === animalId ? { ...a, fed: true } : a)),
    }));
    showToast('සතාට ආදරයෙන් ආහාර ලබාදුන්නා! ❤️');
  };

  const handleCollectProduce = (animalId: string) => {
    const anim = gameState.animals.find((a) => a.id === animalId);
    if (!anim) return;

    if (anim.type === 'chicken' || anim.type === 'duck') {
      advanceMissionProgress('collect_eggs', 2);
    }

    setGameState((prev) => {
      const updatedBarn = { ...prev.barn };
      if (anim.type === 'cow') updatedBarn.cowMilkBottles += 1;
      else if (anim.type === 'goat') updatedBarn.goatMilkBottles += 1;
      else if (anim.type === 'chicken' || anim.type === 'duck') updatedBarn.eggsCount += 2;

      return {
        ...prev,
        barn: updatedBarn,
      };
    });
    showToast('නිෂ්පාදන එකතු කර මඩුවට දමන ලදී! 🥛🥚');
  };

  const handleSellAnimal = (animalId: string) => {
    const anim = gameState.animals.find((a) => a.id === animalId);
    if (!anim) return;

    const values = { cow: 180, goat: 125, chicken: 65, duck: 90 };
    const sinhalaNames = { cow: 'එළදෙන', goat: 'එළුවා', chicken: 'කිකිළි', duck: 'තාරාවා' };
    const earned = values[anim.type];

    recordIncome(earned, 'animal_sale', `සත්තු විකිණීම (${sinhalaNames[anim.type]})`);

    // Record in animalSaleHistory
    const now = Date.now();
    const timeLabel = new Date(now).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const animalRec: AnimalSaleRecord = {
      id: `anim-sale-${now}`,
      timestamp: now,
      timeLabel,
      type: anim.type,
      amount: earned,
      sinhalaName: sinhalaNames[anim.type],
    };

    setGameState((prev) => ({
      ...prev,
      coins: prev.coins + earned,
      animals: prev.animals.filter((a) => a.id !== animalId),
      stats: {
        ...prev.stats,
        totalAnimalSales: (prev.stats.totalAnimalSales || 0) + 1,
      },
      analytics: {
        ...prev.analytics,
        animalSaleHistory: [...prev.analytics.animalSaleHistory.slice(-20), animalRec],
      },
    }));
    showToast(`වැඩුණු සතා වෙළඳපොළට විකුණා +${earned} කොයින් ලැබුණා! 💰`);
  };

  // ---------------------------------------------------------------
  // BARN & SHOP ACTIONS
  // ---------------------------------------------------------------
  const handleSellPaddyDirect = (count: number) => {
    if (gameState.barn.paddySacks < count) return;
    const earned = count * 25;
    recordIncome(earned, 'paddy_harvest', 'වී මලු අලෙවිය');

    setGameState((prev) => ({
      ...prev,
      coins: prev.coins + earned,
      barn: { ...prev.barn, paddySacks: prev.barn.paddySacks - count },
    }));
    showToast(`වී මලු ${count} ක් විකුණා +${earned} කොයින් ලබාගත්තා! 🌾`);
  };

  const handleSellMilkDirect = (count: number) => {
    if (gameState.barn.cowMilkBottles < count) return;
    const earned = count * 40;
    recordIncome(earned, 'dairy_produce', 'එළකිරි අලෙවිය');

    setGameState((prev) => ({
      ...prev,
      coins: prev.coins + earned,
      barn: { ...prev.barn, cowMilkBottles: prev.barn.cowMilkBottles - count },
    }));
    showToast(`එළකිරි බෝතල් ${count} ක් විකුණා +${earned} කොයින් ලබාගත්තා! 🥛`);
  };

  const handleSellEggsDirect = (count: number) => {
    if (gameState.barn.eggsCount < count) return;
    const earned = count * 9;
    recordIncome(earned, 'dairy_produce', 'බිත්තර අලෙවිය');

    setGameState((prev) => ({
      ...prev,
      coins: prev.coins + earned,
      barn: { ...prev.barn, eggsCount: prev.barn.eggsCount - count },
    }));
    showToast(`බිත්තර ${count} ක් විකුණා +${earned} කොයින් ලබාගත්තා! 🥚`);
  };

  const handleBuySeeds = (amount: number, cost: number) => {
    if (gameState.coins < cost) return;
    setGameState((prev) => ({
      ...prev,
      coins: prev.coins - cost,
      barn: { ...prev.barn, seedsCount: prev.barn.seedsCount + amount },
    }));
    showToast(`වී බීජ ${amount} ක් මිලදී ගත්තා! 🌱`);
  };

  const handleFulfillCustomer = (order: CustomerOrder) => {
    recordIncome(order.offeredCoins, 'customer_shop', `කඩේ අලෙවිය (${order.customerName})`);
    advanceMissionProgress('sell_shop', 1);

    setGameState((prev) => {
      const updatedBarn = { ...prev.barn };
      if (order.requestedItem === 'paddy_sack') updatedBarn.paddySacks -= order.quantity;
      else if (order.requestedItem === 'cow_milk') updatedBarn.cowMilkBottles -= order.quantity;
      else if (order.requestedItem === 'eggs') updatedBarn.eggsCount -= order.quantity;
      else if (order.requestedItem === 'goat_milk') updatedBarn.goatMilkBottles -= order.quantity;

      return {
        ...prev,
        coins: prev.coins + order.offeredCoins,
        reputation: prev.reputation + order.reputationReward,
        barn: updatedBarn,
        stats: { ...prev.stats, totalShopSales: prev.stats.totalShopSales + 1 },
      };
    });
    showToast(`${order.customerName} ට භාණ්ඩ අලෙවි කළා! (+${order.offeredCoins} කොයින්) ⭐`);
  };

  // ---------------------------------------------------------------
  // ASSISTANTS ACTIONS
  // ---------------------------------------------------------------
  const handleHireAssistant = (assistantId: string, cost: number) => {
    if (gameState.coins < cost) return;
    setGameState((prev) => ({
      ...prev,
      coins: prev.coins - cost,
      assistants: prev.assistants.map((a) => (a.id === assistantId ? { ...a, hired: true } : a)),
    }));
    showToast('ගෝලයෙකු සාර්ථකව සේවයට බඳවා ගන්නා ලදී! 🧑‍🌾');
  };

  const handleUpgradeAssistant = (assistantId: string, cost: number) => {
    if (gameState.coins < cost) return;
    setGameState((prev) => ({
      ...prev,
      coins: prev.coins - cost,
      assistants: prev.assistants.map((a) =>
        a.id === assistantId ? { ...a, level: a.level + 1 } : a
      ),
    }));
    showToast('සේවක මට්ටම උසස් කරන ලදී! 🌟');
  };

  // ---------------------------------------------------------------
  // FEATURES ACTIONS
  // ---------------------------------------------------------------
  const handleTriggerRainBonus = () => {
    sounds.playWater();
    setGameState((prev) => ({
      ...prev,
      fields: prev.fields.map((f) => ({ ...f, watered: true })),
    }));
    showToast('ස්වභාවික වැස්ස නිසා සියලුම කුඹුරු 10 ටම නොමිලේ ජලය සම්පාදනය විය! 🌧️');
  };

  const handleActivateDrone = () => {
    recordIncome(120, 'drone_trade', 'ඩ්‍රෝන ප්‍රවාහනය');
    setGameState((prev) => ({
      ...prev,
      coins: prev.coins + 120,
    }));
  };

  const handleReadNewsReward = (rewardAmount: number) => {
    recordIncome(rewardAmount, 'customer_shop', 'පුවත් කියවීමේ ත්‍යාගය');
    advanceMissionProgress('read_news', 1);

    setGameState((prev) => ({
      ...prev,
      coins: prev.coins + rewardAmount,
    }));
    showToast(`සජීවී පුවත් කියවූ ඔබට +${rewardAmount} කොයින් හිමිවිය! 📰🪙`);
  };

  const handleBonusCoins = (amount: number, reason: string) => {
    recordIncome(amount, 'wheel_spin', reason);
    setGameState((prev) => ({
      ...prev,
      coins: prev.coins + amount,
    }));
    showToast(`+${amount} කොයින් හිමිවිය! (${reason}) ✨`);
  };

  const handleFulfillCustomerDeal = (
    item: 'paddy' | 'milk' | 'eggs' | 'seeds',
    qty: number,
    coinsEarned: number
  ) => {
    recordIncome(coinsEarned, 'customer_shop', `කඩේ අලෙවිය (${item})`);
    advanceMissionProgress('sell_shop', 1);

    setGameState((prev) => {
      const updatedBarn = { ...prev.barn };
      if (item === 'paddy') updatedBarn.paddySacks = Math.max(0, updatedBarn.paddySacks - qty);
      else if (item === 'milk') updatedBarn.cowMilkBottles = Math.max(0, updatedBarn.cowMilkBottles - qty);
      else if (item === 'eggs') updatedBarn.eggsCount = Math.max(0, updatedBarn.eggsCount - qty);
      else if (item === 'seeds') updatedBarn.seedsCount = Math.max(0, updatedBarn.seedsCount - qty);

      return {
        ...prev,
        coins: prev.coins + coinsEarned,
        barn: updatedBarn,
        stats: { ...prev.stats, totalShopSales: prev.stats.totalShopSales + 1 },
      };
    });
    sounds.playWin();
    showToast(`පාරිභෝගිකයාට අලෙවි කර +${coinsEarned} කොයින් ලැබුණා! 🪙✨`);
  };

  const handleLoginSuccess = (user: UserProfile) => {
    setCurrentUser(user);
    setIsAuthModalOpen(false);
    const loaded = loadSavedGameState(user.phoneNumber);
    setGameState(loaded);
    showToast(`සාදරයෙන් පිළිගනිමු, ${user.username}! 🌾`);
  };

  const handleLogout = () => {
    if (currentUser) {
      saveGameStateToStorage(gameState, currentUser.phoneNumber);
    }
    logoutActiveUser();
    setCurrentUser(null);
    setIsAuthModalOpen(true);
    showToast('ඔබ ගිණුමෙන් සාර්ථකව ඉවත් විය.');
  };

  const handleManualSave = () => {
    saveGameStateToStorage(gameState, currentUser?.phoneNumber);
    sounds.playCoin();
    showToast('ක්‍රීඩා තොරතුරු ඔබගේ දුරකථනයේ සුරැකිණි! (Offline Saved)');
  };

  const handleResetGame = () => {
    if (currentUser) {
      localStorage.removeItem(`GOVI_GAMANA_SAVE_${currentUser.phoneNumber}`);
    }
    localStorage.removeItem('GOVI_GAMANA_SAVE_V1');
    setGameState(INITIAL_GAME_STATE);
    showToast('ක්‍රීඩාව නැවත මුල සිට ආරම්භ විය.');
  };

  const unlockedFeaturesCount = gameState.features.filter((f) => gameState.coins >= f.unlockCoins).length;

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col items-center justify-start selection:bg-amber-500 selection:text-stone-950 font-sans">
      {/* Mobile Portrait Frame Wrapper (Max width 440px for ideal phone view) */}
      <div className="w-full max-w-md min-h-screen flex flex-col bg-stone-950 pb-20 relative shadow-2xl border-x border-stone-900">
        {/* Top Header Status Bar */}
        <HeaderBar
          coins={gameState.coins}
          paddySacks={gameState.barn.paddySacks}
          seedsCount={gameState.barn.seedsCount}
          currentUser={currentUser}
          onReset={handleResetGame}
          onManualSave={handleManualSave}
          onLogout={handleLogout}
        />


        {/* Global Toast Notification */}
        {toastMessage && (
          <div className="fixed top-14 left-1/2 -translate-x-1/2 z-50 bg-stone-900/95 border border-amber-400 text-amber-200 text-xs font-bold py-2 px-4 rounded-full shadow-2xl animate-fade-in flex items-center gap-2 max-w-[90vw] text-center">
            <span>✨</span>
            <span className="truncate">{toastMessage}</span>
          </div>
        )}

        {/* Tab Content Views */}
        <main className="flex-1 p-3 space-y-4">
          {/* TAB 1: DASHBOARD & 10 PADDY FIELDS + FORTUNE WHEEL + LIVE NEWS BOX */}
          {activeTab === 'dashboard' && (
            <div className="space-y-4">
              {/* Circular Fortune Spin Wheel with GO button */}
              <FortuneWheel
                coins={gameState.coins}
                freeSpins={gameState.spinWheel.spinsRemaining}
                onReward={handleWheelReward}
              />

              {/* 10 Serious Paddy Fields */}
              <PaddyFieldsView
                fields={gameState.fields}
                seedsCount={gameState.barn.seedsCount}
                coins={gameState.coins}
                onPlant={handlePlantField}
                onPlantAll={handlePlantAllFields}
                onWater={handleWaterField}
                onWaterAll={handleWaterAllFields}
                onHarvest={handleHarvestField}
                onTractorHarvestAll={handleTractorHarvestAll}
              />

              {/* Daily Missions System */}
              <DailyMissionsBox
                missions={gameState.dailyMissions.missions}
                onClaimReward={handleClaimMissionReward}
              />

              {/* Real-time Live Hiru News Box */}
              <LiveNewsBox onReadReward={handleReadNewsReward} />
            </div>
          )}

          {/* TAB 2: ANIMAL PENS (හරක්, එළු, කුකුළු, තාරා) */}
          {activeTab === 'animals' && (
            <AnimalPensView
              animals={gameState.animals}
              coins={gameState.coins}
              onBuyAnimal={handleBuyAnimal}
              onFeedAnimal={handleFeedAnimal}
              onCollectProduce={handleCollectProduce}
              onSellAnimal={handleSellAnimal}
            />
          )}

          {/* TAB 3: PADDY BARN & MARKET SHOP */}
          {activeTab === 'shop' && (
            <ShopAndBarnView
              coins={gameState.coins}
              barn={gameState.barn}
              onSellPaddyDirect={handleSellPaddyDirect}
              onSellMilkDirect={handleSellMilkDirect}
              onSellEggsDirect={handleSellEggsDirect}
              onBuySeeds={handleBuySeeds}
              onFulfillCustomer={handleFulfillCustomer}
            />
          )}

          {/* TAB 1: 3D LIVING FARM WORLD (සම්පූර්ණ 3D ගොවිපොළ ලෝකය) */}
          {activeTab === 'three_world' && (
            <ThreeFarmWorld
              fields={gameState.fields}
              animals={gameState.animals}
              barnStock={gameState.barn}
              coins={gameState.coins}
              onSellPaddyDirect={handleSellPaddyDirect}
              onSellMilkDirect={handleSellMilkDirect}
              onSellEggsDirect={handleSellEggsDirect}
              onBuySeeds={handleBuySeeds}
              onNavigateToShop={() => setActiveTab('shop')}
              onTractorHarvestAll={handleTractorHarvestAll}
              onWaterAll={handleWaterAllFields}
              onBonusCoins={handleBonusCoins}
              onFulfillCustomerDeal={handleFulfillCustomerDeal}
              onOpenSpinWheel={() => setActiveTab('dashboard')}
            />
          )}

          {/* TAB: DEDICATED LARGE LIVE NEWS BOX (විශාල සජීවී පුවත් පෙට්ටිය) */}
          {activeTab === 'news' && (
            <div className="space-y-4">
              <LiveNewsBox isFullPageMode={true} onReadReward={handleReadNewsReward} />
            </div>
          )}

          {/* TAB: STATISTICS & CHARTS (සංඛ්‍යාලේඛන සහ ප්‍රස්ථාර) */}
          {activeTab === 'analytics' && (
            <StatisticsView gameState={gameState} />
          )}

          {/* TAB: DEDICATED FEATURES BOX & ASSISTANTS (ෆීචර්ස් සහ ගෝලයෝ) */}
          {activeTab === 'features' && (
            <div className="space-y-4">
              <FeaturesBoxView
                features={gameState.features}
                coins={gameState.coins}
                onTriggerRainBonus={handleTriggerRainBonus}
                onActivateDrone={handleActivateDrone}
              />
              <AssistantsView
                assistants={gameState.assistants}
                coins={gameState.coins}
                onHireAssistant={handleHireAssistant}
                onUpgradeAssistant={handleUpgradeAssistant}
              />
            </div>
          )}
        </main>

        {/* Bottom Portrait Navigation Bar */}
        <Navigation
          activeTab={activeTab}
          onTabChange={setActiveTab}
          unlockedFeaturesCount={unlockedFeaturesCount}
        />
      </div>
    </div>
  );
}
