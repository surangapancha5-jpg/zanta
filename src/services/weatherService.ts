export interface LiveWeatherReport {
  locationName: string;
  sinhalaLocation: string;
  temperature: number;
  humidity: number;
  windSpeed: number;
  weatherCode: number;
  condition: string;
  sinhalaCondition: string;
  isRaining: boolean;
  rainBonusActive: boolean;
  farmAdvice: string;
  sinhalaFarmAdvice: string;
  timestamp: number;
}

export const SRI_LANKA_REGIONS = [
  { name: 'Anuradhapura (අනුරාධපුර)', lat: 8.3114, lon: 80.4037 },
  { name: 'Polonnaruwa (පොළොන්නරුව)', lat: 7.9403, lon: 81.0188 },
  { name: 'Kurunegala (කුරුණෑගල)', lat: 7.4863, lon: 80.3623 },
  { name: 'Colombo (කොළඹ)', lat: 6.9271, lon: 79.8612 },
  { name: 'Kandy (මහනුවර)', lat: 7.2906, lon: 80.6337 },
  { name: 'Galle (ගාල්ල)', lat: 6.0535, lon: 80.2210 },
  { name: 'Hambantota (හම්බන්තොට)', lat: 6.1429, lon: 81.1212 },
  { name: 'Jaffna (යාපනය)', lat: 9.6615, lon: 80.0255 },
];

function interpretWmoCode(code: number): { condition: string; sinhala: string; isRaining: boolean } {
  if (code === 0) return { condition: 'Clear Sky', sinhala: 'පැහැදිලි අහස', isRaining: false };
  if (code >= 1 && code <= 3) return { condition: 'Mainly Clear / Partly Cloudy', sinhala: 'තරමක් වළාකුළු සහිත', isRaining: false };
  if (code >= 45 && code <= 48) return { condition: 'Misty / Foggy', sinhala: 'මීදුම් සහිත', isRaining: false };
  if (code >= 51 && code <= 55) return { condition: 'Light Drizzle', sinhala: 'සිහින් පොද වැස්ස', isRaining: true };
  if (code >= 61 && code <= 65) return { condition: 'Rain Showers', sinhala: 'වැසි සහිත කාලගුණය', isRaining: true };
  if (code >= 80 && code <= 82) return { condition: 'Heavy Rain Showers', sinhala: 'තද වැසි', isRaining: true };
  if (code >= 95) return { condition: 'Thunderstorm', sinhala: 'ගිගුරුම් සහිත වැසි', isRaining: true };
  return { condition: 'Fair Weather', sinhala: 'සාමාන්‍ය කාලගුණය', isRaining: false };
}

export async function fetchLiveWeather(lat: number = 8.3114, lon: number = 80.4037, locationName = 'Anuradhapura', sinhalaName = 'අනුරාධපුර'): Promise<LiveWeatherReport> {
  try {
    const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m`);
    if (!res.ok) throw new Error('Weather API network error');
    const data = await res.json();
    const cur = data.current;
    const wmo = interpretWmoCode(cur.weather_code || 0);

    return {
      locationName,
      sinhalaLocation: sinhalaName,
      temperature: Math.round(cur.temperature_2m || 29),
      humidity: Math.round(cur.relative_humidity_2m || 75),
      windSpeed: Math.round(cur.wind_speed_10m || 8),
      weatherCode: cur.weather_code || 0,
      condition: wmo.condition,
      sinhalaCondition: wmo.sinhala,
      isRaining: wmo.isRaining,
      rainBonusActive: wmo.isRaining,
      farmAdvice: wmo.isRaining
        ? 'Rainfall active! Free natural irrigation bonus activated across all 10 paddy fields.'
        : 'Sunny & warm. Keep paddy fields moist and animals hydrated.',
      sinhalaFarmAdvice: wmo.isRaining
        ? 'ස්වභාවික වර්ෂාව ලැබෙමින් පවතී! කුඹුරු 10 ටම නොමිලේ ජලය සැපයෙන බෝනස් හිමිවේ.'
        : 'හොඳ හිරු එළිය පවතී. වී පැල සඳහා නියමිත පරිදි ජලය සපයා සතුන් රැකබලා ගන්න.',
      timestamp: Date.now(),
    };
  } catch {
    // Fallback reliable data for offline / fallback state
    return {
      locationName,
      sinhalaLocation: sinhalaName,
      temperature: 30,
      humidity: 78,
      windSpeed: 10,
      weatherCode: 2,
      condition: 'Tropical Sunshine',
      sinhalaCondition: 'හොඳ හිරු එළිය සහිතයි',
      isRaining: false,
      rainBonusActive: false,
      farmAdvice: 'Optimal conditions for high yield paddy crop maturity and livestock feeding.',
      sinhalaFarmAdvice: 'වී අස්වැන්න ඉක්මනින් මේරීමට සහ සතුන්ගේ සෞඛ්‍යයට ඉතා හිතකර කාලගුණයකි.',
      timestamp: Date.now(),
    };
  }
}
