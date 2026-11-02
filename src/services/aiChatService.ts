/**
 * AI Nova Chat Service
 * Integrates with https://supunofc.site/api/ai/ai/nova
 * Provides real-time AI customer dialogue, bargaining, and agricultural advice
 */

export interface ChatMessage {
  id: string;
  sender: 'player' | 'customer' | 'nova';
  senderName: string;
  text: string;
  timestamp: number;
}

export interface VillageCustomerDialogue {
  customerId: string;
  name: string;
  avatar: string;
  thoughtBubble: string;
  wantItem: 'paddy' | 'milk' | 'eggs' | 'seeds';
  wantQuantity: number;
  offeredCoins: number;
  speech: string;
}

const NOVA_API_KEY = 'supun_f3be1dda5f1fbd062eacdeca72c0a9c1';

// Sri Lankan Village Customers who visit the farm shop
export const VILLAGE_CUSTOMERS: VillageCustomerDialogue[] = [
  {
    customerId: 'cust_1',
    name: 'ගුණපාල මාමා (Gunapala Mama)',
    avatar: '👨‍🌾',
    thoughtBubble: '🌾 මට හොඳ වී මල්ලක් මිලදී ගන්න ඕන!',
    wantItem: 'paddy',
    wantQuantity: 1,
    offeredCoins: 30,
    speech: 'ආයුබෝවන් මුදලාලි! මට කන්නෙට වපුරන්න හොඳ වී මල්ලක් ඕන.',
  },
  {
    customerId: 'cust_2',
    name: 'සුමනා නැන්දා (Sumana Nanda)',
    avatar: '👵',
    thoughtBubble: '🥛 දරුවන්ට උදේට බොන්න නැවුම් එළකිරි බෝතලයක්!',
    wantItem: 'milk',
    wantQuantity: 1,
    offeredCoins: 45,
    speech: 'සුබ උදෑසනක්! අද නැවුම් උණුසුම් එළකිරි බෝතලයක් තියෙනවද?',
  },
  {
    customerId: 'cust_3',
    name: 'පියදාස මුදලාලි (Piyadasa Mudalali)',
    avatar: '👨‍💼',
    thoughtBubble: '🥚 ගමේ බිත්තර තියෙනවද විකුණන්න?',
    wantItem: 'eggs',
    wantQuantity: 2,
    offeredCoins: 22,
    speech: 'හලෝ මල්ලි, කඩේට දාන්න ගමේ නැවුම් බිත්තර 2ක් දෙන්නකො.',
  },
  {
    customerId: 'cust_4',
    name: 'ලීලාවතී අක්කා (Leelawathi Akka)',
    avatar: '👩‍🌾',
    thoughtBubble: '🌱 මට අලුත් වී බීජ පැකට් එකක් ඕන!',
    wantItem: 'seeds',
    wantQuantity: 10,
    offeredCoins: 25,
    speech: 'ගොවිපොළ නම් පට්ට සරුයි වගේ! මට වී බීජ ටිකක් ගන්න පුලුවන්ද?',
  },
];

class AiChatService {
  /**
   * Send a query to the Nova AI API
   * Uses local proxy first (/api/nova), then direct endpoint as fallback
   */
  public async sendQuery(query: string, customerContext?: string): Promise<string> {
    const trimmed = query.trim();
    if (!trimmed) return 'කරුණාකර යමක් විමසන්න.';

    const systemPromptPrefix = customerContext
      ? `You are roleplaying as ${customerContext} visiting a traditional Sri Lankan paddy farm shop in the Govi Gamana game. Answer politely in Sinhala (or English if queried in English): `
      : 'You are Nova AI, a friendly agricultural assistant for Sri Lankan farmers. Answer briefly and helpfully in Sinhala: ';

    const fullPrompt = `${systemPromptPrefix}${trimmed}`;

    // 1. Try local Vite proxy
    try {
      const proxyUrl = `/api/nova?q=${encodeURIComponent(fullPrompt)}&apikey=${NOVA_API_KEY}`;
      const res = await fetch(proxyUrl, {
        headers: { Accept: 'application/json' },
      });
      if (res.ok) {
        const data = await res.json();
        if (data && data.results && typeof data.results.text === 'string') {
          return data.results.text.trim();
        }
      }
    } catch {
      // Continue to direct call
    }

    // 2. Try direct API endpoint
    try {
      const directUrl = `https://supunofc.site/api/ai/ai/nova?q=${encodeURIComponent(fullPrompt)}&apikey=${NOVA_API_KEY}`;
      const res = await fetch(directUrl, {
        headers: { Accept: 'application/json' },
      });
      if (res.ok) {
        const data = await res.json();
        if (data && data.results && typeof data.results.text === 'string') {
          return data.results.text.trim();
        }
      }
    } catch {
      // Continue to offline fallback
    }

    // 3. Realistic smart fallback responses if network fails
    const lower = trimmed.toLowerCase();
    if (lower.includes('මිල') || lower.includes('ගාන') || lower.includes('price') || lower.includes('cost')) {
      return 'වී මල්ලක් කොයින් 25-30ක් වෙනවා, නැවුම් එළකිරි බෝතලයක් කොයින් 40-45ක්, බිත්තර 2ක් කොයින් 18-22ක් වෙනවා!';
    }
    if (lower.includes('කුඹුරු') || lower.includes('වී') || lower.includes('paddy')) {
      return 'කුඹුරු 10ම පැලවෙන්න විනාඩි 1ක් යනවා. පැසුණු පසු ට්‍රැක්ටරය දාලා හෝ අතින් කපලා වී මඩුවට එකතු කරන්න පුළුවන්!';
    }
    if (lower.includes('එළකිරි') || lower.includes('කිරි') || lower.includes('milk')) {
      return 'එළදෙනුන්ට වෙලාවට කෑම දීලා බලාගත්තම හොඳට නැවුම් කිරි ලැබෙනවා. කඩේ පාරිභෝගිකයින්ට විකුණලා හොඳ ආදායමක් ගන්න පුළුවන්!';
    }
    if (lower.includes('හායි') || lower.includes('හෙලෝ') || lower.includes('hi') || lower.includes('hello')) {
      return 'ආයුබෝවන්! මම ගොවිපොළේ Nova AI සහායකයා. ගොවිතැන, සතුන් හෝ කඩේ වෙළඳාම ගැන ඕනෑම දෙයක් අහන්න!';
    }

    return 'ඔබේ අදහස ඉතා වටිනවා! ගොවිපොළේ වැඩ කටයුතු සරුසාරව කරගෙන යන්න මම උදව් කරන්නම්.';
  }
}

export const aiChatService = new AiChatService();
