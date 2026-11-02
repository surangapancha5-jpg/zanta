import React, { useState, useEffect } from 'react';
import { CustomerOrder } from '../types/game';
import { sounds } from '../services/soundEffects';
import { Store, Warehouse, ShoppingBag, CheckCircle, Sprout, ArrowRight, TrendingUp, Bot } from 'lucide-react';
import { AiCustomerChatBox } from './AiCustomerChatBox';

interface ShopAndBarnViewProps {
  coins: number;
  barn: {
    paddySacks: number;
    cowMilkBottles: number;
    eggsCount: number;
    goatMilkBottles: number;
    fertilizerBags: number;
    seedsCount: number;
  };
  onSellPaddyDirect: (count: number) => void;
  onSellMilkDirect: (count: number) => void;
  onSellEggsDirect: (count: number) => void;
  onBuySeeds: (amount: number, cost: number) => void;
  onFulfillCustomer: (order: CustomerOrder) => void;
}

const SRI_LANKAN_NAMES = [
  'ගුණපාල මාමා (Gunapala)',
  'සුමනා නැන්දා (Sumana)',
  'නිරෝෂ් මහතා (Nirosh)',
  'සුනෙත්‍රා මෙනවිය (Sunethra)',
  'විජිත ගොවි මහතා (Wijitha)',
  'අනුලා අක්කා (Anula)',
  'ප්‍රියන්ත අයියා (Priyantha)',
];

export const ShopAndBarnView: React.FC<ShopAndBarnViewProps> = ({
  coins,
  barn,
  onSellPaddyDirect,
  onSellMilkDirect,
  onSellEggsDirect,
  onBuySeeds,
  onFulfillCustomer,
}) => {
  const [customerOrders, setCustomerOrders] = useState<CustomerOrder[]>([
    {
      id: 'ord-1',
      customerName: 'සුමනා නැන්දා (Sumana)',
      avatarSeed: 1,
      requestedItem: 'paddy_sack',
      quantity: 2,
      offeredCoins: 60,
      reputationReward: 5,
      createdAt: Date.now(),
    },
    {
      id: 'ord-2',
      customerName: 'ගුණපාල මාමා (Gunapala)',
      avatarSeed: 2,
      requestedItem: 'cow_milk',
      quantity: 1,
      offeredCoins: 45,
      reputationReward: 4,
      createdAt: Date.now(),
    },
  ]);
  const [isAiChatOpen, setIsAiChatOpen] = useState<boolean>(false);

  // Periodic new customer arrival
  useEffect(() => {
    const interval = setInterval(() => {
      setCustomerOrders((prev) => {
        if (prev.length >= 4) return prev;
        const randomName = SRI_LANKAN_NAMES[Math.floor(Math.random() * SRI_LANKAN_NAMES.length)];
        const items: Array<'paddy_sack' | 'cow_milk' | 'eggs' | 'goat_milk'> = [
          'paddy_sack',
          'cow_milk',
          'eggs',
          'goat_milk',
        ];
        const chosenItem = items[Math.floor(Math.random() * items.length)];
        const qty = chosenItem === 'eggs' ? 4 : chosenItem === 'paddy_sack' ? 2 : 1;
        const coinRates = {
          paddy_sack: 32,
          cow_milk: 48,
          eggs: 10,
          goat_milk: 55,
        };
        const coinsOffered = qty * coinRates[chosenItem] + 15; // sweet customer tip!

        const newOrder: CustomerOrder = {
          id: `ord-${Date.now()}`,
          customerName: randomName,
          avatarSeed: Math.floor(Math.random() * 5),
          requestedItem: chosenItem,
          quantity: qty,
          offeredCoins: coinsOffered,
          reputationReward: 5,
          createdAt: Date.now(),
        };
        return [...prev, newOrder];
      });
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  const getItemLabel = (item: string) => {
    switch (item) {
      case 'paddy_sack':
        return { name: 'වී මලු (Paddy Sacks)', icon: '🌾', stock: barn.paddySacks };
      case 'cow_milk':
        return { name: 'නැවුම් එළකිරි (Cow Milk)', icon: '🥛', stock: barn.cowMilkBottles };
      case 'eggs':
        return { name: 'ගමේ බිත්තර (Farm Eggs)', icon: '🥚', stock: barn.eggsCount };
      case 'goat_milk':
        return { name: 'එළු කිරි (Goat Milk)', icon: '🍼', stock: barn.goatMilkBottles };
      default:
        return { name: 'නිෂ්පාදන', icon: '📦', stock: 0 };
    }
  };

  const handleOrderFulfill = (order: CustomerOrder) => {
    const info = getItemLabel(order.requestedItem);
    if (info.stock >= order.quantity) {
      sounds.playCoin();
      onFulfillCustomer(order);
      setCustomerOrders((prev) => prev.filter((o) => o.id !== order.id));
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Banner: Paddy Barn (වී මඩුව) Storage */}
      <div className="bg-gradient-to-r from-stone-900 via-yellow-950/40 to-stone-900 p-4 rounded-3xl border border-yellow-600/30 shadow-xl backdrop-blur-md">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-2xl">
              <Warehouse className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h2 className="text-sm font-extrabold text-amber-200">මහා වී මඩුව (Royal Paddy Barn)</h2>
              <p className="text-[11px] text-amber-300/80">කපාගත් වී තොග සහ ගොවිපොළ නිපැයුම් ගබඩාව</p>
            </div>
          </div>
          <div className="bg-amber-500/20 px-3 py-1 rounded-full border border-amber-400/30 text-xs font-black text-amber-300 flex items-center gap-1">
            <span>🌾 {barn.paddySacks} මලු</span>
          </div>
        </div>

        {/* Barn Inventory Grid */}
        <div className="grid grid-cols-3 gap-2 mb-3">
          {/* Paddy Sacks */}
          <div className="bg-stone-950/70 p-2.5 rounded-2xl border border-stone-800 text-center">
            <span className="text-xl">🌾</span>
            <div className="text-xs font-extrabold text-amber-300 mt-0.5">{barn.paddySacks} මලු</div>
            <span className="text-[10px] text-stone-400 block mb-1">වී අස්වැන්න</span>
            <button
              onClick={() => {
                if (barn.paddySacks > 0) {
                  sounds.playCoin();
                  onSellPaddyDirect(1);
                }
              }}
              disabled={barn.paddySacks <= 0}
              className={`w-full py-1 rounded-lg text-[10px] font-bold transition-all ${
                barn.paddySacks > 0
                  ? 'bg-amber-600 hover:bg-amber-500 text-white cursor-pointer active:scale-95'
                  : 'bg-stone-800 text-stone-600 cursor-not-allowed'
              }`}
            >
              විකුණන්න (+25)
            </button>
          </div>

          {/* Cow Milk */}
          <div className="bg-stone-950/70 p-2.5 rounded-2xl border border-stone-800 text-center">
            <span className="text-xl">🥛</span>
            <div className="text-xs font-extrabold text-cyan-300 mt-0.5">{barn.cowMilkBottles} බෝතල්</div>
            <span className="text-[10px] text-stone-400 block mb-1">නැවුම් එළකිරි</span>
            <button
              onClick={() => {
                if (barn.cowMilkBottles > 0) {
                  sounds.playCoin();
                  onSellMilkDirect(1);
                }
              }}
              disabled={barn.cowMilkBottles <= 0}
              className={`w-full py-1 rounded-lg text-[10px] font-bold transition-all ${
                barn.cowMilkBottles > 0
                  ? 'bg-cyan-600 hover:bg-cyan-500 text-white cursor-pointer active:scale-95'
                  : 'bg-stone-800 text-stone-600 cursor-not-allowed'
              }`}
            >
              විකුණන්න (+40)
            </button>
          </div>

          {/* Farm Eggs */}
          <div className="bg-stone-950/70 p-2.5 rounded-2xl border border-stone-800 text-center">
            <span className="text-xl">🥚</span>
            <div className="text-xs font-extrabold text-yellow-300 mt-0.5">{barn.eggsCount} බිත්තර</div>
            <span className="text-[10px] text-stone-400 block mb-1">ගමේ බිත්තර</span>
            <button
              onClick={() => {
                if (barn.eggsCount >= 2) {
                  sounds.playCoin();
                  onSellEggsDirect(2);
                }
              }}
              disabled={barn.eggsCount < 2}
              className={`w-full py-1 rounded-lg text-[10px] font-bold transition-all ${
                barn.eggsCount >= 2
                  ? 'bg-yellow-600 hover:bg-yellow-500 text-stone-950 font-bold cursor-pointer active:scale-95'
                  : 'bg-stone-800 text-stone-600 cursor-not-allowed'
              }`}
            >
              2ක් විකුණන්න (+18)
            </button>
          </div>
        </div>

        {/* Buy Seeds Action */}
        <div className="bg-gradient-to-r from-emerald-950/60 to-stone-900 p-3 rounded-2xl border border-emerald-500/30 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sprout className="w-5 h-5 text-emerald-400" />
            <div>
              <p className="text-xs font-bold text-emerald-200">වී බීජ තොග ගන්න (Paddy Seeds)</p>
              <p className="text-[10px] text-emerald-400/80">කුඹුරු 10 වැපිරීමට බීජ 10 ක් අවශ්‍ය වේ</p>
            </div>
          </div>
          <button
            onClick={() => {
              if (coins >= 20) {
                sounds.playHarvest();
                onBuySeeds(10, 20);
              }
            }}
            disabled={coins < 20}
            className={`py-1.5 px-3 rounded-xl text-xs font-bold transition-all ${
              coins >= 20
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer active:scale-95 shadow-md'
                : 'bg-stone-800 text-stone-500 cursor-not-allowed'
            }`}
          >
            බීජ 10ක් (20 කොයින්)
          </button>
        </div>
      </div>

      {/* Customer Market Shop */}
      <div className="bg-gradient-to-b from-stone-900 to-stone-950 p-4 rounded-3xl border border-stone-800 shadow-xl">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-orange-500/20 border border-orange-400 flex items-center justify-center text-orange-300">
              <Store className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-stone-200">ගොවිපොළ කඩය (Village Customers)</h3>
              <p className="text-[11px] text-stone-400">ගැණුම්කරුවන් පැමිණ වැඩි මුදලක් ගෙවා බඩු ගෙන යයි</p>
            </div>
          </div>
          <span className="text-[11px] bg-orange-500/20 text-orange-300 px-2.5 py-0.5 rounded-full border border-orange-500/30 font-bold">
            පැමිණ සිටින්නන්: {customerOrders.length}
          </span>
        </div>

        {/* Nova AI Customer Chat Launcher Banner */}
        <div className="mb-3.5 p-3 rounded-2xl bg-gradient-to-r from-emerald-950/80 via-stone-900 to-emerald-950/80 border border-emerald-500/40 flex items-center justify-between gap-2 shadow-md">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-400 flex items-center justify-center text-lg">
              🤖
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h4 className="text-xs font-black text-emerald-200">
                  AI පාරිභෝගික කතාබස් (Nova AI)
                </h4>
                <span className="text-[8px] bg-emerald-500 text-stone-950 font-black px-1.5 py-0.2 rounded-full">
                  LIVE
                </span>
              </div>
              <p className="text-[10px] text-stone-400">
                පාරිභෝගිකයින්ගේ අදහස් අසා භාණ්ඩ අලෙවි කරන්න
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              sounds.playCoin();
              setIsAiChatOpen(true);
            }}
            className="py-1.5 px-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-stone-950 font-black text-xs shadow-md flex items-center gap-1 cursor-pointer hover:brightness-110 active:scale-95 shrink-0"
          >
            <Bot className="w-3.5 h-3.5" />
            <span>කතාබස්</span>
          </button>
        </div>

        {customerOrders.length === 0 ? (
          <div className="py-8 text-center text-stone-500 text-xs">
            <ShoppingBag className="w-8 h-8 mx-auto mb-2 opacity-40 text-stone-400" />
            <span>නව ගැණුම්කරුවන් පැමිණෙමින් පවතී...</span>
          </div>
        ) : (
          <div className="space-y-2.5">
            {customerOrders.map((ord) => {
              const info = getItemLabel(ord.requestedItem);
              const canFulfill = info.stock >= ord.quantity;

              return (
                <div
                  key={ord.id}
                  className="p-3 bg-stone-950/80 rounded-2xl border border-stone-800 flex items-center justify-between hover:border-amber-500/30 transition-all"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-amber-600 to-yellow-400 text-stone-950 font-black flex items-center justify-center text-xs shadow-md">
                      {ord.customerName.charAt(0)}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-stone-200">{ord.customerName}</h4>
                      <p className="text-[11px] text-amber-300 flex items-center gap-1">
                        <span>ඉල්ලුම:</span>
                        <span>{info.icon}</span>
                        <span className="font-semibold">{ord.quantity}x {info.name}</span>
                      </p>
                      <p className="text-[10px] text-stone-500">
                        ඔබ සතුව: {info.stock} {info.stock < ord.quantity ? '(ප්‍රමාණවත් නැත)' : '(සූදානම්)'}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-xs font-black text-yellow-300 mb-1 flex items-center justify-end gap-1">
                      <TrendingUp className="w-3 h-3 text-emerald-400" />
                      +{ord.offeredCoins} කොයින්
                    </div>
                    <button
                      onClick={() => handleOrderFulfill(ord)}
                      disabled={!canFulfill}
                      className={`py-1.5 px-3 rounded-xl text-xs font-bold flex items-center gap-1 transition-all ${
                        canFulfill
                          ? 'bg-gradient-to-r from-emerald-600 to-green-600 hover:brightness-110 text-white cursor-pointer active:scale-95 shadow-md'
                          : 'bg-stone-800 text-stone-600 cursor-not-allowed'
                      }`}
                    >
                      <CheckCircle className="w-3 h-3" />
                      <span>විකුණන්න</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Nova AI Customer Chat Modal */}
      <AiCustomerChatBox
        isOpen={isAiChatOpen}
        onClose={() => setIsAiChatOpen(false)}
        barnStock={barn}
        coins={coins}
        onFulfillDeal={(item, qty, earned) => {
          onSellPaddyDirect(0); // trigger updates or direct fulfill
        }}
      />
    </div>
  );
};
