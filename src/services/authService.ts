import { UserProfile } from '../types/game';

const ACTIVE_USER_KEY = 'GOVI_GAMANA_ACTIVE_USER';
const REGISTERED_USERS_KEY = 'GOVI_GAMANA_USERS_REGISTRY';
const PENDING_OTP_KEY = 'GOVI_GAMANA_PENDING_OTP';

export interface PendingOtpData {
  phone: string;
  username: string;
  otp: string;
  expiresAt: number;
}

export function normalizePhone(raw: string): string {
  if (!raw) return '';
  // Keep digits and leading + if present
  let cleaned = raw.trim().replace(/[^\d+]/g, '');
  if (cleaned.startsWith('+94')) {
    cleaned = '0' + cleaned.slice(3);
  }
  return cleaned;
}

export function getActiveUser(): UserProfile | null {
  try {
    const raw = localStorage.getItem(ACTIVE_USER_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as UserProfile;
  } catch (err) {
    console.error('Failed to get active user', err);
    return null;
  }
}

export function setActiveUser(user: UserProfile): void {
  try {
    localStorage.setItem(ACTIVE_USER_KEY, JSON.stringify(user));
    // Also save in user registry
    const registry = getRegisteredUsers();
    registry[user.phoneNumber] = user;
    localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(registry));
  } catch (err) {
    console.error('Failed to set active user', err);
  }
}

export function logoutActiveUser(): void {
  try {
    localStorage.removeItem(ACTIVE_USER_KEY);
    sessionStorage.removeItem(PENDING_OTP_KEY);
  } catch (err) {
    console.error('Failed to logout active user', err);
  }
}

export function getRegisteredUsers(): Record<string, UserProfile> {
  try {
    const raw = localStorage.getItem(REGISTERED_USERS_KEY);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to load registered users registry', err);
    return {};
  }
}

export function findRegisteredUser(rawPhone: string): UserProfile | null {
  const phone = normalizePhone(rawPhone);
  if (!phone) return null;
  const registry = getRegisteredUsers();
  return registry[phone] || null;
}

export function generateAndSendOtp(rawPhone: string, username: string): { success: boolean; otp?: string; expiresAt?: number; message?: string } {
  const phone = normalizePhone(rawPhone);
  if (!phone || phone.length < 9) {
    return {
      success: false,
      message: 'කරුණාකර වලංගු දුරකථන අංකයක් ඇතුළත් කරන්න (උදා: 0712345678)',
    };
  }

  const trimmedUsername = username.trim();
  if (!trimmedUsername) {
    return {
      success: false,
      message: 'කරුණාකර ඔබගේ නම හෝ පරිශීලක නාමය ඇතුළත් කරන්න',
    };
  }

  // Generate 6 digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = Date.now() + 3 * 60 * 1000; // 3 minutes

  const pending: PendingOtpData = {
    phone,
    username: trimmedUsername,
    otp,
    expiresAt,
  };

  try {
    sessionStorage.setItem(PENDING_OTP_KEY, JSON.stringify(pending));
  } catch (e) {
    console.error('Session storage failed', e);
  }

  return {
    success: true,
    otp,
    expiresAt,
  };
}

export function verifyOtp(
  rawPhone: string,
  enteredOtp: string,
  providedUsername?: string
): { success: boolean; user?: UserProfile; message?: string } {
  const phone = normalizePhone(rawPhone);
  const cleanOtp = enteredOtp.trim();

  let pending: PendingOtpData | null = null;
  try {
    const raw = sessionStorage.getItem(PENDING_OTP_KEY);
    if (raw) pending = JSON.parse(raw);
  } catch (e) {
    console.error('Failed to read pending OTP', e);
  }

  if (!pending) {
    return {
      success: false,
      message: 'OTP කේතය කල් ඉකුත් වී ඇත හෝ හමු නොවිණි. කරුණාකර නැවත OTP එකක් ලබාගන්න.',
    };
  }

  if (pending.phone !== phone) {
    return {
      success: false,
      message: 'දුරකථන අංකය නොගැලපේ. කරුණාකර නැවත උත්සාහ කරන්න.',
    };
  }

  if (Date.now() > pending.expiresAt) {
    return {
      success: false,
      message: 'OTP කේතය කල් ඉකුත්වී ඇත. කරුණාකර නව OTP කේතයක් ඉල්ලුම් කරන්න.',
    };
  }

  if (pending.otp !== cleanOtp) {
    return {
      success: false,
      message: 'ඇතුළත් කළ OTP කේතය වැරදියි. කරුණාකර නිවැරදි ඉලක්කම් 6 ඇතුළත් කරන්න.',
    };
  }

  // OTP verified! Create or update user profile
  const existing = findRegisteredUser(phone);
  const finalUsername = (providedUsername && providedUsername.trim()) || pending.username || existing?.username || 'ගොවි මිතුරා';

  const user: UserProfile = {
    phoneNumber: phone,
    username: finalUsername,
    registeredAt: existing ? existing.registeredAt : Date.now(),
    lastLoginAt: Date.now(),
  };

  setActiveUser(user);
  sessionStorage.removeItem(PENDING_OTP_KEY);

  return {
    success: true,
    user,
  };
}
