// =============================================================================
// قاموس إشارات شاور (145 إشارة وحرف مسجلة في مجلد data)
// =============================================================================
export const DICTIONARY = [
  // الحروف والمقاطع الهجائية
  'ء', 'أ', 'ؤ', 'ئ', 'ا', 'ال', 'ب', 'ت', 'ث', 'ج', 'ح', 'خ', 'د', 'ذ', 'ر', 'ز', 'س', 'ش', 'ص', 'ض', 'ط', 'ظ', 'ع', 'غ', 'ف', 'ق', 'ك', 'ل', 'لا', 'م', 'ن', 'ه', 'و', 'ى', 'ي',

  // الكلمات والعبارات الشائعة
  'آسف', 'آمن', 'أدنى', 'أراك', 'أربعاء', 'أزاله من عقله', 'أساسي', 'أسبوع', 'أسبوعياً', 'أسد', 'أسطورة', 'أسفل', 'أسوأ', 'أشخاص', 'أصلي', 'أعلى', 'أفضل', 'أقل', 'أكثر من', 'أمس', 'أمل', 'أمير', 'أنا', 'إذلال', 'إسباني', 'إشارة الاتجاه', 'إشارة', 'إعياء', 'إفطار', 'إلى اللقاء', 'إلى', 'إما', 'ارتفاع', 'ازدراء', 'ازرق', 'استثنائي', 'استذكار', 'استرخاء', 'استقامة', 'اسلوب', 'اشقر', 'اصطناع الكلام', 'اطمئنان', 'افتراضياً', 'اقصر', 'اقصى', 'اكثر', 'الآن', 'الأسبوع الفائت', 'الأسبوع القادم', 'الإرادة الذاتية', 'الإلحاد', 'الإنجليزية', 'الاهتمام', 'البخيل', 'البداية', 'البيانات التقريبيه', 'التحكم الذاتي', 'التراث الشعبي', 'التقويم', 'الجحيم', 'الجميع', 'الجنة', 'الحد الأدنى للسن', 'الحلقة المفرغة', 'الحياة الأبدية', 'الخروج من الوضع', 'الخط العربي', 'الرد', 'الساعة 1 صباحاً', 'الساعة 1 مسائاً', 'الساعة التاسعة', 'الساعة الثامنة', 'الساعة الثانية عشر', 'الساعة الثانية', 'الساعة الحادية عشر', 'الساعة الخامسة', 'الساعة الرابعة', 'الساعة السادسة', 'السنة القادمة', 'السنة الماضية', 'السنتيمتر المربع', 'الشكل البيضاوي', 'الصفات الشخصية', 'الصم', 'الطابق الأرضي', 'الطاقة السليمة', 'الطمع', 'العاشر', 'العربية', 'الغموض', 'الغيرة', 'الكرة الأرضية', 'الكسل', 'الليلة', 'اليوم', 'امرأة', 'تلفاز', 'ثانوي', 'ثلاثاء', 'جميل', 'حب', 'حسنا', 'حسناً', 'خائف', 'خجل', 'خجول', 'خميس', 'دائرة', 'دقيقة'
];

/**
 * دالة بسيطة ومباشرة لتحويل أي نص عربي إلى تسلسل مقاطع لغة الإشارة
 */
export function textToSignSequence(rawText) {
  if (!rawText || !rawText.trim()) return [];

  // 1. تنظيف النص من التشكيل والتطويل والرموز غير العربية
  const clean = rawText
    .replace(/[\u064B-\u065F\u0670\u0640]/g, '')
    .replace(/[^\u0600-\u06FF\d\s]/g, ' ')
    .trim();

  const words = clean.split(/\s+/).filter(Boolean);
  const sequence = [];
  const dictSet = new Set(DICTIONARY);

  // العبارات المركبة مرتبة بالأطول أولاً لمطابقتها أولاً
  const phrases = DICTIONARY
    .filter(item => item.includes(' '))
    .sort((a, b) => b.length - a.length);

  let i = 0;
  while (i < words.length) {
    let matched = false;

    // أ) مطابقة العبارات المركبة (مثل "إلى اللقاء"، "الساعة التاسعة")
    for (const phrase of phrases) {
      const phraseWords = phrase.split(' ');
      const candidate = words.slice(i, i + phraseWords.length).join(' ');
      if (candidate === phrase) {
        sequence.push({
          token: phrase,
          type: 'word',
          video: `/data/${encodeURIComponent(phrase)}.mp4`
        });
        i += phraseWords.length;
        matched = true;
        break;
      }
    }
    if (matched) continue;

    const word = words[i];

    // ب) مطابقة الكلمة المفردة المباشرة
    if (dictSet.has(word)) {
      sequence.push({
        token: word,
        type: 'word',
        video: `/data/${encodeURIComponent(word)}.mp4`
      });
      i++;
      continue;
    }

    // ج) مطابقة مع حذف أو إضافة "ال"
    const withoutAl = word.startsWith('ال') ? word.slice(2) : null;
    const withAl = !word.startsWith('ال') ? 'ال' + word : null;

    if (withoutAl && dictSet.has(withoutAl)) {
      sequence.push({
        token: withoutAl,
        type: 'word',
        video: `/data/${encodeURIComponent(withoutAl)}.mp4`
      });
      i++;
      continue;
    }
    if (withAl && dictSet.has(withAl)) {
      sequence.push({
        token: withAl,
        type: 'word',
        video: `/data/${encodeURIComponent(withAl)}.mp4`
      });
      i++;
      continue;
    }

    // د) في حال لم توجد الكلمة: تفكيكها إلى حروف هجائية (Spelling)
    const chars = Array.from(word);
    let c = 0;
    while (c < chars.length) {
      // مقطع "لا"
      if (chars[c] === 'ل' && ['ا', 'أ', 'إ', 'آ'].includes(chars[c + 1]) && dictSet.has('لا')) {
        sequence.push({
          token: 'لا',
          type: 'letter',
          video: `/data/${encodeURIComponent('لا')}.mp4`
        });
        c += 2;
        continue;
      }

      const char = chars[c];
      const normChar = { 'أ': 'ا', 'إ': 'ا', 'آ': 'ا', 'ة': 'ه', 'ى': 'ي' }[char] || char;

      if (dictSet.has(char)) {
        sequence.push({
          token: char,
          type: 'letter',
          video: `/data/${encodeURIComponent(char)}.mp4`
        });
      } else if (dictSet.has(normChar)) {
        sequence.push({
          token: normChar,
          type: 'letter',
          video: `/data/${encodeURIComponent(normChar)}.mp4`
        });
      }
      c++;
    }

    i++;
  }

  return sequence;
}
