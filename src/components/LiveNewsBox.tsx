import React, { useState, useEffect } from 'react';
import { NewsArticle, fetchHiruLiveNews } from '../services/newsService';
import { sounds } from '../services/soundEffects';
import {
  Newspaper,
  RefreshCw,
  ExternalLink,
  Clock,
  Eye,
  Search,
  Sparkles,
  Flame,
  ChevronRight,
  X,
  Share2,
} from 'lucide-react';

interface LiveNewsBoxProps {
  onReadReward?: (coins: number) => void;
  isFullPageMode?: boolean;
}

export const LiveNewsBox: React.FC<LiveNewsBoxProps> = ({ onReadReward, isFullPageMode = false }) => {
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeArticle, setActiveArticle] = useState<NewsArticle | null>(null);
  const [hasClaimedBonus, setHasClaimedBonus] = useState<boolean>(false);
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);

  useEffect(() => {
    loadNews();
  }, []);

  const loadNews = async () => {
    setIsLoading(true);
    try {
      const articles = await fetchHiruLiveNews(48);
      setNews(articles);
    } catch {
      // handled inside service
    } finally {
      setIsLoading(false);
    }
  };

  // Filter news articles based on search & category
  const filteredNews = news.filter((item) => {
    const matchesSearch =
      searchQuery.trim() === '' ||
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      selectedCategory === 'all' ||
      (item.category && item.category.toLowerCase() === selectedCategory.toLowerCase());

    return matchesSearch && matchesCategory;
  });

  const categories = ['all', ...Array.from(new Set(news.map((n) => n.category || 'General')))];

  const handleOpenArticle = (article: NewsArticle) => {
    setActiveArticle(article);
    sounds.playCoin();

    // Daily reader bonus reward (once per session)
    if (!hasClaimedBonus && onReadReward) {
      setHasClaimedBonus(true);
      onReadReward(10);
    }
  };

  const latestHeadline = news.length > 0 ? news[0].title : 'සජීවී පුවත් ලබාගනිමින් පවතී...';

  return (
    <div className="bg-gradient-to-b from-stone-900 via-stone-900/95 to-stone-950 p-4 rounded-3xl border border-red-500/40 shadow-2xl space-y-3 relative overflow-hidden backdrop-blur-md">
      {/* Header Bar */}
      <div className="flex items-center justify-between pb-2 border-b border-stone-800">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-red-600/20 border border-red-500/50 flex items-center justify-center text-red-400 shadow-md">
            <Newspaper className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-black text-stone-100 tracking-wide">
                සජීවී පුවත් පෙට්ටිය (Live News Box)
              </h2>
              <span className="bg-red-600 text-white text-[9px] font-black px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm animate-pulse">
                <span className="w-1.5 h-1.5 rounded-full bg-white" />
                LIVE HIRU
              </span>
            </div>
            <p className="text-[11px] text-stone-400">
              ශ්‍රී ලංකාවේ සහ ලොව පුරා සත්‍ය සහ නවතම ප්‍රවෘත්ති
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={loadNews}
            disabled={isLoading}
            className="p-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white transition-all cursor-pointer border border-stone-700"
            title="නවතම පුවත් යාවත්කාලීන කරන්න"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-red-400' : ''}`} />
          </button>
          <button
            onClick={() => setIsCollapsed((prev) => !prev)}
            className="px-2 py-1 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 text-[10px] font-bold border border-stone-700 transition-all cursor-pointer"
          >
            {isCollapsed ? 'පෙන්වන්න ▾' : 'හකුළන්න ▴'}
          </button>
        </div>
      </div>

      {/* Breaking News Ticker Line */}
      <div className="bg-red-950/40 border border-red-500/30 rounded-2xl p-2 flex items-center gap-2 overflow-hidden">
        <div className="flex items-center gap-1 text-red-400 font-black text-[10px] shrink-0 bg-red-600/30 px-2 py-0.5 rounded-lg border border-red-500/40">
          <Flame className="w-3 h-3 text-red-400 animate-bounce" />
          <span>උණුසුම්:</span>
        </div>
        <p className="text-[11px] text-stone-200 font-semibold truncate animate-marquee">
          {latestHeadline}
        </p>
      </div>

      {!isCollapsed && (
        <>
          {/* Search & Category Filter Controls */}
          <div className="space-y-2">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="පුවත් සොයන්න (Search news headlines)..."
                className="w-full bg-stone-950/80 border border-stone-800 rounded-xl py-1.5 pl-8 pr-3 text-xs text-stone-200 placeholder-stone-500 focus:outline-none focus:border-red-500/50"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-500 hover:text-stone-300 text-xs"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[10px] scrollbar-none">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`py-1 px-2.5 rounded-xl whitespace-nowrap transition-all font-bold ${
                    selectedCategory === cat
                      ? 'bg-red-600 text-white shadow-md'
                      : 'bg-stone-950 text-stone-400 hover:bg-stone-800 hover:text-stone-200 border border-stone-800'
                  }`}
                >
                  {cat === 'all' ? 'සියල්ල (All)' : cat}
                </button>
              ))}
            </div>
          </div>

          {/* Reader Coin Bonus Notice */}
          {!hasClaimedBonus && (
            <div className="p-2 rounded-xl bg-gradient-to-r from-amber-500/20 to-yellow-500/10 border border-amber-400/30 flex items-center justify-between text-[11px] text-amber-200">
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
                <span>පුවතක් කියවා +10 නොමිලේ කොයින් ලබාගන්න!</span>
              </div>
              <span className="font-bold text-yellow-300 bg-amber-500/20 px-2 py-0.5 rounded-full">
                +10 Coins
              </span>
            </div>
          )}

          {/* News Articles List */}
          {isLoading ? (
            <div className="py-12 text-center text-stone-400 text-xs flex flex-col items-center justify-center gap-2">
              <RefreshCw className="w-6 h-6 animate-spin text-red-500" />
              <span>සජීවී පුවත් දත්ත පද්ධතිය හා සම්බන්ධ වෙමින්...</span>
            </div>
          ) : filteredNews.length === 0 ? (
            <div className="py-8 text-center text-stone-500 text-xs">
              පුවත් කිසිවක් හමු නොවීය. කරුණාකර නැවත උත්සාහ කරන්න.
            </div>
          ) : (
            <div
              className={`space-y-2.5 ${
                isFullPageMode ? 'max-h-[calc(100vh-260px)] min-h-[400px]' : 'max-h-[360px]'
              } overflow-y-auto pr-1`}
            >
              {filteredNews.map((article) => (
                <div
                  key={article.id}
                  onClick={() => handleOpenArticle(article)}
                  className="p-2.5 bg-stone-950/70 hover:bg-stone-800/60 rounded-2xl border border-stone-800 hover:border-red-500/40 transition-all flex gap-3 cursor-pointer group shadow-sm"
                >
                  {/* Article Thumbnail */}
                  <div className="w-20 h-18 rounded-xl overflow-hidden bg-stone-900 shrink-0 border border-stone-800 relative">
                    <img
                      src={article.image}
                      alt={article.title}
                      loading="lazy"
                      onError={(e) => {
                        // Fallback image if cross-origin image fails
                        (e.target as HTMLImageElement).src =
                          'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=300&q=80';
                      }}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {article.category && (
                      <span className="absolute bottom-0.5 left-0.5 bg-black/80 text-red-400 text-[8px] font-bold px-1.5 py-0.2 rounded">
                        {article.category}
                      </span>
                    )}
                  </div>

                  {/* Article Details */}
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <h3 className="text-xs font-bold text-stone-100 group-hover:text-red-300 line-clamp-2 leading-snug transition-colors">
                        {article.title}
                      </h3>
                      <p className="text-[10px] text-stone-400 line-clamp-1 mt-1">
                        {article.description}
                      </p>
                    </div>

                    <div className="flex items-center justify-between mt-1 text-[9px] text-stone-500">
                      <div className="flex items-center gap-1 font-mono">
                        <Clock className="w-2.5 h-2.5 text-stone-400" />
                        <span>{article.date || 'අද'}</span>
                      </div>
                      <span className="text-red-400 font-bold flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
                        <span>කියවන්න</span>
                        <ChevronRight className="w-2.5 h-2.5" />
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* FULL ARTICLE MODAL */}
      {activeArticle && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 animate-fade-in">
          <div className="bg-stone-900 border border-red-500/40 rounded-3xl max-w-md w-full max-h-[85vh] flex flex-col overflow-hidden shadow-2xl">
            {/* Modal Header */}
            <div className="p-3.5 border-b border-stone-800 flex items-center justify-between bg-stone-950">
              <div className="flex items-center gap-2">
                <span className="bg-red-600 text-white text-[9px] font-black px-2 py-0.5 rounded-full">
                  {activeArticle.category || 'පුවත්'}
                </span>
                <span className="text-[10px] text-stone-400 font-mono">{activeArticle.date}</span>
              </div>
              <button
                onClick={() => setActiveArticle(null)}
                className="w-7 h-7 rounded-full bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Content Scrollable Area */}
            <div className="p-4 overflow-y-auto space-y-3 flex-1 text-stone-200">
              {/* Main Headline */}
              <h2 className="text-sm font-extrabold text-stone-100 leading-snug">
                {activeArticle.title}
              </h2>

              {/* High-res Image */}
              {activeArticle.image && (
                <div className="w-full h-48 rounded-2xl overflow-hidden bg-stone-950 border border-stone-800 shadow-md">
                  <img
                    src={activeArticle.image}
                    alt={activeArticle.title}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=600&q=80';
                    }}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {/* Full Description text */}
              <div className="text-xs text-stone-300 leading-relaxed space-y-2 whitespace-pre-line">
                <p>{activeArticle.description}</p>
              </div>

              {/* Original Article Link */}
              {activeArticle.url && (
                <div className="pt-2 border-t border-stone-800">
                  <a
                    href={activeArticle.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2 px-3 bg-stone-800 hover:bg-stone-700 text-red-300 hover:text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <span>මූලාශ්‍ර පුවත කියවන්න (Hiru News)</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-3 border-t border-stone-800 bg-stone-950 flex justify-between items-center text-[10px] text-stone-400">
              <span>Hiru News සජීවී සේවාව</span>
              <button
                onClick={() => setActiveArticle(null)}
                className="py-1.5 px-4 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold"
              >
                වසන්න
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
