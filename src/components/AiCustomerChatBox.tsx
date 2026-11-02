import React, { useState, useEffect, useRef } from 'react';
import {
  ChatMessage,
  VillageCustomerDialogue,
  VILLAGE_CUSTOMERS,
  aiChatService,
} from '../services/aiChatService';
import { sounds } from '../services/soundEffects';
import {
  Bot,
  Send,
  X,
  Sparkles,
  ShoppingBag,
  CheckCircle,
  MessageSquare,
  Wheat,
  Milk,
  Egg,
  Sprout,
  Coins,
  RefreshCw,
} from 'lucide-react';

interface AiCustomerChatBoxProps {
  isOpen: boolean;
  onClose: () => void;
  activeCustomerIndex?: number;
  barnStock: {
    paddySacks: number;
    cowMilkBottles?: number;
    eggsCount?: number;
    seedsCount?: number;
  };
  coins: number;
  onFulfillDeal?: (item: 'paddy' | 'milk' | 'eggs' | 'seeds', qty: number, coinsEarned: number) => void;
}

export const AiCustomerChatBox: React.FC<AiCustomerChatBoxProps> = ({
  isOpen,
  onClose,
  activeCustomerIndex = 0,
  barnStock,
  coins,
  onFulfillDeal,
}) => {
  const [currentCustomerIdx, setCurrentCustomerIdx] = useState<number>(activeCustomerIndex);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const currentCustomer: VillageCustomerDialogue =
    VILLAGE_CUSTOMERS[currentCustomerIdx % VILLAGE_CUSTOMERS.length];

  // Initialize customer dialogue when opened or changed
  useEffect(() => {
    setCurrentCustomerIdx(activeCustomerIndex);
  }, [activeCustomerIndex]);

  useEffect(() => {
    if (!isOpen) return;

    // Reset or greet from customer
    const initialGreeting: ChatMessage = {
      id: `msg_init_${Date.now()}`,
      sender: 'customer',
      senderName: currentCustomer.name,
      text: currentCustomer.speech,
      timestamp: Date.now(),
    };
    setMessages([initialGreeting]);
  }, [currentCustomerIdx, isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  if (!isOpen) return null;

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputValue;
    if (!text.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: `msg_user_${Date.now()}`,
      sender: 'player',
      senderName: 'ඔබ (You)',
      text: text.trim(),
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');
    setIsLoading(true);
    sounds.playCoin();

    try {
      const response = await aiChatService.sendQuery(
        text,
        `${currentCustomer.name}, who wants to buy ${currentCustomer.wantQuantity} of ${currentCustomer.wantItem}`
      );

      const aiMsg: ChatMessage = {
        id: `msg_ai_${Date.now()}`,
        sender: 'customer',
        senderName: currentCustomer.name,
        text: response,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, aiMsg]);
      sounds.playCoin();
    } catch {
      const fallbackMsg: ChatMessage = {
        id: `msg_ai_${Date.now()}`,
        sender: 'customer',
        senderName: currentCustomer.name,
        text: 'බොහොම ස්තූතියි! ඔබේ ගොවිපොළේ නිෂ්පාදන හරිම නැවුම්!',
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNextCustomer = () => {
    sounds.playCoin();
    setCurrentCustomerIdx((prev) => (prev + 1) % VILLAGE_CUSTOMERS.length);
  };

  // Check if player has the requested items in barn
  const hasItem = () => {
    if (currentCustomer.wantItem === 'paddy') return (barnStock.paddySacks || 0) >= currentCustomer.wantQuantity;
    if (currentCustomer.wantItem === 'milk') return (barnStock.cowMilkBottles || 0) >= currentCustomer.wantQuantity;
    if (currentCustomer.wantItem === 'eggs') return (barnStock.eggsCount || 0) >= currentCustomer.wantQuantity;
    if (currentCustomer.wantItem === 'seeds') return (barnStock.seedsCount || 0) >= currentCustomer.wantQuantity;
    return false;
  };

  const handleFulfillTrade = () => {
    if (!hasItem()) return;
    sounds.playWin();
    if (onFulfillDeal) {
      onFulfillDeal(currentCustomer.wantItem, currentCustomer.wantQuantity, currentCustomer.offeredCoins);
    }

    const tradeMsg: ChatMessage = {
      id: `msg_trade_${Date.now()}`,
      sender: 'customer',
      senderName: currentCustomer.name,
      text: `බොහොම පිං මුදලාලි! මම රු. ${currentCustomer.offeredCoins}ක කොයින් ගෙව්වා. භාණ්ඩ ලැබුණා! 🤝✨`,
      timestamp: Date.now(),
    };
    setMessages((prev) => [...prev, tradeMsg]);
  };

  const quickQuestions = [
    'අද මිල කීයද?',
    'වී අස්වැන්න සරුයිද?',
    'නැවුම් එළකිරි ගන්නවද?',
    'ගොවිතැනට හොඳ උපදෙසක් දෙන්න',
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 animate-fade-in">
      <div className="bg-gradient-to-b from-stone-900 via-stone-950 to-stone-900 border border-amber-500/50 rounded-3xl w-full max-w-md h-[92vh] max-h-[640px] flex flex-col shadow-[0_0_40px_rgba(245,158,11,0.35)] overflow-hidden">
        {/* Top Header */}
        <div className="p-3.5 bg-stone-900/90 border-b border-stone-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-400/60 flex items-center justify-center text-2xl shadow-inner">
              {currentCustomer.avatar}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-xs font-black text-amber-200">{currentCustomer.name}</h3>
                <span className="text-[9px] bg-emerald-500/20 text-emerald-300 font-bold px-1.5 py-0.2 rounded-full border border-emerald-500/40">
                  Online
                </span>
              </div>
              <p className="text-[10px] text-stone-400">කඩේ ඉදිරිපිට පාරිභෝගිකයා (AI Nova Chat)</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={handleNextCustomer}
              className="p-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-amber-300 text-[10px] font-bold flex items-center gap-1 transition-all"
              title="මීළඟ පාරිභෝගිකයා"
            >
              <RefreshCw className="w-3 h-3" />
              <span>ඊළඟ කෙනා</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-white transition-all cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Customer Thought Message Banner */}
        <div className="bg-gradient-to-r from-amber-950/80 via-stone-900 to-amber-950/80 p-2.5 border-b border-amber-500/30 flex items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 overflow-hidden">
            <span className="text-base animate-bounce">💭</span>
            <div className="truncate">
              <span className="text-[10px] text-amber-400 font-bold block">පාරිභෝගිකයාගේ සිතුවිල්ල (Customer Thought):</span>
              <span className="text-xs font-black text-stone-100 truncate">{currentCustomer.thoughtBubble}</span>
            </div>
          </div>

          {/* Quick Trade Button */}
          <button
            onClick={handleFulfillTrade}
            disabled={!hasItem()}
            className={`py-1.5 px-3 rounded-xl text-[10px] font-black whitespace-nowrap flex items-center gap-1 transition-all ${
              hasItem()
                ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-stone-950 shadow-md cursor-pointer hover:brightness-110 active:scale-95'
                : 'bg-stone-800 text-stone-500 cursor-not-allowed'
            }`}
          >
            <Coins className="w-3 h-3" />
            <span>විකුණන්න (+{currentCustomer.offeredCoins})</span>
          </button>
        </div>

        {/* Chat Messages Body */}
        <div className="flex-1 p-3 overflow-y-auto space-y-2.5 bg-stone-950/70">
          {messages.map((msg) => {
            const isPlayer = msg.sender === 'player';
            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isPlayer ? 'items-end' : 'items-start'} animate-fade-in`}
              >
                <span className="text-[9px] font-bold text-stone-500 mb-0.5 px-1">
                  {msg.senderName}
                </span>
                <div
                  className={`max-w-[85%] rounded-2xl p-2.5 text-xs shadow-md ${
                    isPlayer
                      ? 'bg-gradient-to-r from-amber-600 to-amber-500 text-stone-950 font-bold rounded-tr-none'
                      : 'bg-stone-900 border border-stone-800 text-stone-200 rounded-tl-none font-medium'
                  }`}
                >
                  <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                </div>
              </div>
            );
          })}

          {isLoading && (
            <div className="flex items-center gap-2 text-stone-400 text-xs py-1">
              <Bot className="w-4 h-4 text-amber-400 animate-spin" />
              <span className="text-[11px] font-medium animate-pulse">
                {currentCustomer.name} පිළිතුර සිතමින් පවතී (Nova AI)...
              </span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Chips */}
        <div className="p-2 bg-stone-900/90 border-t border-stone-800 flex items-center gap-1.5 overflow-x-auto text-[10px]">
          {quickQuestions.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(q)}
              className="py-1 px-2.5 rounded-full bg-stone-800 hover:bg-stone-700 text-amber-200 font-bold whitespace-nowrap transition-all border border-stone-700/60 cursor-pointer"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-3 bg-stone-900 border-t border-stone-800 flex items-center gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="පාරිභෝගිකයා සමග කතාබස් කරන්න..."
            className="flex-1 bg-stone-950 border border-stone-700 rounded-2xl px-3.5 py-2 text-xs text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-400 transition-all"
          />
          <button
            onClick={() => handleSendMessage()}
            disabled={!inputValue.trim() || isLoading}
            className={`p-2.5 rounded-2xl font-black text-stone-950 transition-all ${
              inputValue.trim() && !isLoading
                ? 'bg-gradient-to-r from-amber-500 to-yellow-400 shadow-md hover:brightness-110 active:scale-95 cursor-pointer'
                : 'bg-stone-800 text-stone-600 cursor-not-allowed'
            }`}
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
