/**
 * Utility functions for Arabic text normalization, ingredient matching,
 * timer duration extraction, and audio alerts.
 */

export const DAYS_OF_WEEK = [
  'السبت',
  'الأحد',
  'الاثنين',
  'الثلاثاء',
  'الأربعاء',
  'الخميس',
  'الجمعة',
] as const;

export const MEAL_TYPES = ['فطور', 'غداء', 'عشاء', 'تحلاية'] as const;

export const DEFAULT_PANTRY: string[] = [
  'ملح',
  'فلفل أسود',
  'زيت زيتون',
  'زيت نباتي',
  'سكر',
  'أرز',
  'طحين',
  'بهارات مشكلة',
  'ماء',
  'بصل',
  'ثوم',
  'معجون طماطم',
];

export const POPULAR_INGREDIENTS = [
  'بطاطا',
  'دجاج',
  'طماطم',
  'بصل',
  'بيض',
  'لحمة مفرومة',
  'ثوم',
  'أرز',
  'تونة',
  'جبنة موزاريلا',
  'معكرونة',
  'حليب',
  'خيار',
  'ليمون',
  'فلفل رومي',
  'كزبرة',
  'بقدونس',
  'حمص',
  'عدس',
  'باذنجان',
];

export const CUISINE_OPTIONS = [
  { value: 'أي مطبخ', label: 'جميع المطابخ 🌍' },
  { value: 'سوري', label: 'سوري / شامي 🇸🇾' },
  { value: 'مصري', label: 'مصري 🇪🇬' },
  { value: 'خليجي', label: 'خليجي 🇸🇦' },
  { value: 'تركي', label: 'تركي 🇹🇷' },
  { value: 'مغربي', label: 'مغربي / شمال إفريقيا 🇲🇦' },
  { value: 'إيطالي', label: 'إيطالي 🇮🇹' },
  { value: 'إسباني', label: 'إسباني / متوسطي 🇪🇸' },
  { value: 'هندي', label: 'هندي 🇮🇳' },
];

export const DIET_OPTIONS = [
  { value: 'عام', label: 'عام (بدون قيود) 🍽️' },
  { value: 'نظام الكيتو', label: 'نظام الكيتو (Keto) 🥑' },
  { value: 'نظام الطيبات', label: 'نظام الطيبات 🌿' },
  { value: 'نظام نباتي', label: 'نظام نباتي (Vegetarian) 🥗' },
  { value: 'عالي البروتين', label: 'عالي البروتين (High Protein) 💪' },
  { value: 'صحي خفيف', label: 'صحي خفيف (Light & Healthy) 🏃' },
  { value: 'خالي من الغلوتين', label: 'خالي من الغلوتين (Gluten-Free) 🌾' },
];

/**
 * Normalizes Arabic text for flexible matching:
 * - Removes diacritics / tashkeel
 * - Converts [أ, إ, آ, ٱ] to 'ا'
 * - Converts 'ة' to 'ه'
 * - Converts 'ى' to 'ي'
 * - Removes tatweel 'ـ'
 */
export function normalizeArabic(text: string): string {
  if (!text) return '';
  return String(text)
    .toLowerCase()
    .replace(/[ً-ْـ]/g, '')
    .replace(/[أإآٱ]/g, 'ا')
    .replace(/ة/g, 'ه')
    .replace(/ى/g, 'ي')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Converts Eastern Arabic digits (٠-٩) to Western (0-9).
 */
export function toWesternDigits(text: string): string {
  const eastern = '٠١٢٣٤٥٦٧٨٩';
  return String(text).replace(/[٠-٩]/g, (char) => String(eastern.indexOf(char)));
}

/**
 * Checks if a recipe ingredient string matches any of the user's available items.
 */
export function isIngredientAvailable(
  recipeIng: string,
  availableList: string[]
): boolean {
  const normIng = normalizeArabic(recipeIng);
  if (!normIng) return false;

  return availableList.some((item) => {
    const normItem = normalizeArabic(item);
    if (!normItem || normItem.length < 2) return false;
    // Word boundary or substring containment
    return normIng.includes(normItem) || (normItem.length >= 3 && normItem.includes(normIng));
  });
}

/**
 * Finds missing ingredients in a recipe given the available ingredients and pantry items.
 */
export function getMissingIngredients(
  recipeIngredients: string[],
  userIngredients: string[],
  pantryItems: string[],
  includePantry = true
): string[] {
  const available = [...userIngredients, ...(includePantry ? pantryItems : [])];
  return recipeIngredients.filter((ing) => !isIngredientAvailable(ing, available));
}

/**
 * Extracts minutes from Arabic recipe step text.
 * Handles "نصف ساعة" (30), "ساعة" (60), "ساعتين" (120), "دقيقتين" (2), "10 دقائق" (10), etc.
 */
export function parseStepMinutes(stepText: string): number {
  if (!stepText) return 0;
  const s = toWesternDigits(stepText);

  if (/نصف\s*ساع/i.test(s)) return 30;
  if (/ثلث\s*ساع/i.test(s)) return 20;
  if (/ربع\s*ساع/i.test(s)) return 15;
  if (/دقيقتين|دقيقتان/i.test(s)) return 2;
  if (/ساعتين|ساعتان/i.test(s)) return 120;
  if (/(^|\s)ساعة(\s|$)/i.test(s) && !/نصف|ربع|ثلث/.test(s)) return 60;

  // Patterns like "10 دقائق", "15 دقيقة", "5-7 دقائق", "1.5 ساعة"
  const match = s.match(/(\d+(?:[.,]\d+)?)\s*(?:-|إلى|الى|–)?\s*(?:\d+\s*)?(دقيق|دقائق|ساع)/i);
  if (!match) return 0;

  const num = parseFloat(match[1].replace(',', '.'));
  if (isNaN(num) || num <= 0) return 0;

  const isHours = match[2].startsWith('ساع');
  const totalMins = isHours ? Math.round(num * 60) : Math.round(num);

  return totalMins > 0 && totalMins <= 720 ? totalMins : 0;
}

/**
 * Plays a pleasant sound notification when cooking timer ends.
 */
export function playTimerChime(): void {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();

    // Sequence of 2 friendly chimes
    const playTone = (freq: number, delay: number, duration: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + delay);

      gain.gain.setValueAtTime(0, ctx.currentTime + delay);
      gain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + delay + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime + delay);
      osc.stop(ctx.currentTime + delay + duration);
    };

    playTone(587.33, 0, 0.4); // D5
    playTone(880.0, 0.25, 0.6); // A5

    setTimeout(() => {
      ctx.close().catch(() => {});
    }, 1200);
  } catch (err) {
    console.warn('Audio alert not supported or blocked by browser:', err);
  }

  // Trigger haptic vibration if available on mobile devices
  try {
    if (navigator.vibrate) {
      navigator.vibrate([300, 150, 300]);
    }
  } catch {
    // ignore
  }
}

/**
 * Safe LocalStorage wrapper
 */
export const storage = {
  get<T>(key: string, defaultValue: T): T {
    try {
      const item = localStorage.getItem('hanakel_' + key);
      return item ? JSON.parse(item) : defaultValue;
    } catch {
      return defaultValue;
    }
  },
  set<T>(key: string, value: T): void {
    try {
      localStorage.setItem('hanakel_' + key, JSON.stringify(value));
    } catch (e) {
      console.warn('LocalStorage save failed:', e);
    }
  },
};
