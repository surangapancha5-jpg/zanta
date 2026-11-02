export interface NewsArticle {
  id: string | number;
  title: string;
  description: string;
  image: string;
  date: string;
  category: string;
  views?: number;
  url?: string;
}

const API_KEY = 'chama_api_7b9669a740e0cde09142ee6169e8b575';
const DIRECT_URL = `https://api.chamindu.site/api/v1/media/hirunews?limit=48&api_key=${API_KEY}`;
const PROXY_URL = `/api/hirunews?limit=48&api_key=${API_KEY}`;
const CORS_FALLBACK_URL = `https://api.allorigins.win/raw?url=${encodeURIComponent(DIRECT_URL)}`;

const CACHE_STORAGE_KEY = 'GOVI_GAMANA_HIRU_NEWS_CACHE';

export async function fetchHiruLiveNews(limit: number = 48): Promise<NewsArticle[]> {
  // Try Proxy URL first
  try {
    const res = await fetch(PROXY_URL, { cache: 'no-store' });
    if (res.ok) {
      const json = await res.json();
      if (json && Array.isArray(json.data) && json.data.length > 0) {
        saveNewsCache(json.data);
        return json.data;
      }
    }
  } catch {
    // continue to direct
  }

  // Try Direct URL
  try {
    const res = await fetch(DIRECT_URL, { cache: 'no-store' });
    if (res.ok) {
      const json = await res.json();
      if (json && Array.isArray(json.data) && json.data.length > 0) {
        saveNewsCache(json.data);
        return json.data;
      }
    }
  } catch {
    // continue to CORS fallback
  }

  // Try CORS bridge fallback
  try {
    const res = await fetch(CORS_FALLBACK_URL);
    if (res.ok) {
      const json = await res.json();
      if (json && Array.isArray(json.data) && json.data.length > 0) {
        saveNewsCache(json.data);
        return json.data;
      }
    }
  } catch {
    // continue to cache
  }

  // Fallback to cached articles from localStorage
  const cached = loadNewsCache();
  if (cached && cached.length > 0) {
    return cached;
  }

  return [];
}

function saveNewsCache(articles: NewsArticle[]) {
  try {
    localStorage.setItem(
      CACHE_STORAGE_KEY,
      JSON.stringify({ timestamp: Date.now(), articles: articles.slice(0, 48) })
    );
  } catch {
    // ignore
  }
}

function loadNewsCache(): NewsArticle[] | null {
  try {
    const raw = localStorage.getItem(CACHE_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed.articles) ? parsed.articles : null;
  } catch {
    return null;
  }
}
