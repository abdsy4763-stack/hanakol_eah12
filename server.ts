import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '2mb' }));

interface RecipeRequest {
  ingredients: string[];
  mealType?: string;
  cuisine?: string;
  diet?: string;
  pantry?: string[];
}

interface Recipe {
  id: string;
  name: string;
  cuisine: string;
  meal: string;
  time: string;
  difficulty?: string;
  calories?: string;
  ingredients: string[];
  steps: string[];
  tips?: string;
}

const CLEAN_REGEX = /[\u0000-\u001f<>`{}[\]]/g;
const cleanStr = (v: unknown, max = 80): string =>
  String(v ?? '').replace(CLEAN_REGEX, ' ').replace(/\s+/g, ' ').trim().slice(0, max);

const normalizeArabic = (s: string): string =>
  String(s ?? '')
    .toLowerCase()
    .replace(/[ً-ْـ]/g, '')
    .replace(/[أإآ]/g, 'ا')
    .replace(/ة/g, 'ه')
    .replace(/ى/g, 'ي')
    .replace(/\s+/g, ' ')
    .trim();

const hashId = (s: string) => {
  let h = 5381;
  for (let i = 0; i < s.length; i++) {
    h = ((h << 5) + h + s.charCodeAt(i)) | 0;
  }
  return 'r_' + (h >>> 0).toString(36);
};

// Fallback curated authentic recipes in case of network issue or missing Gemini API key
const CURATED_RECIPES: Recipe[] = [
  {
    id: 'r_shakshuka',
    name: 'شكشوكة بالبيض والطماطم والبهارات',
    cuisine: 'سوري / شامي',
    meal: 'فطور',
    time: '20 دقيقة',
    difficulty: 'سهل',
    calories: '280 سعرة',
    ingredients: [
      '4 حبات بيض طازج',
      '3 حبات طماطم مفرومة ناعماً',
      '1 حبة بصل متوسطة مفرومة',
      '2 فص ثوم مهروس',
      '2 ملعقة كبيرة زيت زيتون',
      '1 قرن فلفل أخضر حار (اختياري)',
      'نصف ملعقة صغيرة كمون مطحون',
      'ملح وفلفل أسود حسب الرغبة',
      'ملعقة كبيرة بقدونس مفروم للتزيين'
    ],
    steps: [
      'سخّن زيت الزيتون في مقلاة واسعة على نار متوسطة لمدة دقيقة واحدة.',
      'أضف البصل المفروم وقلّب لمدة 3 دقائق حتى يصبح طرياً وشفافاً.',
      'أضف الثوم المهروس والفلفل وقلّب لمدة دقيقة واحدة حتى تفوح الرائحة.',
      'أضف الطماطم المفرومة والكمون والملح والفلفل، واترك الصلصة تتسبك على نار هادئة لمدة 8 دقائق.',
      'اصنع 4 فجوات في الصلصة واكسر في كل فجوة حبة بيض.',
      'غطّ المقلاة واترك البيض ينضج على نار هادئة لمدة 5 دقائق حتى يتماسك البياض ويبقى الصفار طرياً.',
      'زيّن بالبقدونس الطازج وقدّمها ساخنة مع الخبز الطازج.'
    ],
    tips: 'للحصول على نكهة غنية، أضف رشة صغيرة من جبنة الفيتا أو البابريكا المدخنة فوق البيض.'
  },
  {
    id: 'r_batata_harra',
    name: 'بطاطا حرة بالكزبرة والثوم وزيت الزيتون',
    cuisine: 'سوري / لبناني',
    meal: 'عشاء',
    time: '25 دقيقة',
    difficulty: 'سهل',
    calories: '310 سعرة',
    ingredients: [
      '3 حبات بطاطا متوسطة مقطعة مكعبات',
      '4 فصوص ثوم مهروس',
      'نصف باقة كزبرة خضراء مفرومة ناعماً',
      '3 ملاعق كبيرة زيت زيتون',
      'عصير نصف ليمونة حامضة',
      '1 ملعقة صغيرة بابريكا أو شطة حارة',
      'ملح وفلفل أسود حسب الرغبة'
    ],
    steps: [
      'اقلِ مكعبات البطاطا في الزيت الساخن أو اخبزها في القلاية الهوائية لمدة 15 دقيقة حتى تصبح ذهبية ومقرمشة.',
      'في مقلاة أخرى، ضع زيت الزيتون والثوم المهروس على نار هادئة وقلّب لمدة دقيقة واحدة فقط.',
      'أضف الكزبرة الخضراء المفرومة والبابريكا والملح وقلّب لمدة 30 ثانية.',
      'أضف مكعبات البطاطا المقرمشة إلى المقلاة وقلّبها برفق لمدة دقيقتين حتى تتشرب النكهة تماماً.',
      'ارفع المقلاة عن النار واسكب عصير الليمون الطازج وقدّمها فوراً مقرمشة.'
    ],
    tips: 'يمكن تحميص البطاطا بالفرن مع رشة زيت زيتون لتقليل السعرات الحرارية والحفاظ على القرمشة.'
  },
  {
    id: 'r_kabsa_quick',
    name: 'كبسة أرز بالدجاج والبهارات الخليجية',
    cuisine: 'خليجي',
    meal: 'غداء',
    time: '40 دقيقة',
    difficulty: 'متوسط',
    calories: '550 سعرة',
    ingredients: [
      '2 كوب أرز بسمتي طويل الحبة مغسول ومنقوع',
      '500 غرام صدور أو أفخاذ دجاج مقطعة',
      '1 بصلة كبيرة مفرومة ناعماً',
      '2 حبة طماطم معصورة',
      '2 ملعقة كبيرة معجون طماطم',
      '3 فصوص ثوم مهروس وملعقة زنجبيل مبشور',
      '1 حبة لومي (ليمون أسود مجفف)',
      'عود قرفة و3 حبات هيل وقرنفل',
      'ملعقة كبيرة بهارات كبسة مشكلة',
      'ملح وزيت نباتي ومكسرات للتزيين'
    ],
    steps: [
      'سخّن الزيت في قدر عميق وأضف البصل المفروم وحرّك لمدة 5 دقائق حتى يكتسب لوناً ذهبياً.',
      'أضف الثوم والزنجبيل والبهارات الصحيحة (القرفة والهيل والقرنفل واللومي) وقلّب لمدة دقيقتين.',
      'أضف قطع الدجاج وبهارات الكبسة وقلّبها حتى يتغير لون الدجاج لمدة 7 دقائق.',
      'أضف عصير الطماطم ومعجون الطماطم والملح مع كوبين من الماء الساخن، وغطّ القدر لمدة 15 دقيقة حتى ينضج الدجاج.',
      'أضف الأرز المصفى واضبط مستوى المرق فوق الأرز بسنتيمتر واحد، واتركه يغلي بقوة لمدة 3 دقائق.',
      'اخفض النار إلى أقل درجة ممكنة وغطّ القدر بإحكام واتركه يتهدى لمدة 18 دقيقة.',
      'اسكب الكبسة في طبق التقديم وزيّنها باللوز المحمص والكزبرة.'
    ],
    tips: 'للحصول على أرز نثري وحبة طويلة، انقع الأرز بماء دافئ وملعقة خل لمدة 20 دقيقة قبل الطهي.'
  },
  {
    id: 'r_om_ali',
    name: 'أم علي سريعة بالرقائق والمكسرات والحليب',
    cuisine: 'مصري',
    meal: 'تحلاية',
    time: '20 دقيقة',
    difficulty: 'سهل',
    calories: '380 سعرة',
    ingredients: [
      'عجينة بف باستري مخبوزة أو رقائق الكرواسان الجاهزة',
      '3 أكواب حليب كامل الدسم ساخن',
      'نصف كوب سكر (أو حسب الرغبة)',
      'علبة قشطة طازجة',
      'نصف ملعقة صغيرة فانيليا ومستكة مطحونة',
      'نصف كوب مكسرات مشكلة (لوز، جوز، فستق حلبي)',
      '2 ملعقة كبيرة زبيب وجوز هند مبشور'
    ],
    steps: [
      'فتت رقائق العجينة المخبوزة في طاجن فرن فخاري أو بايركس.',
      'وزّع المكسرات والزبيب وجوز الهند المبشور بين طبقات الرقائق بالتساوي.',
      'سخّن الحليب مع السكر والفانيليا في قدر حتى يذوب السكر تماماً ويصبح الحليب ساخناً جداً.',
      'اسكب الحليب الساخن فوق رقائق العجينة حتى تتشرب جيداً.',
      'وزّع القشطة على الوجه بملعقة ورش القليل من السكر البودرة ليتحمر الوجه.',
      'أدخل الطاجن تحت شواية الفرن لمدة 7 دقائق حتى يكتسب الوجه لوناً ذهبياً غنياً وفقاعات مشهية.',
      'أخرج الطاجن وزيّنه بالفستق الحلبي المجروش وقدّمه دافئاً.'
    ],
    tips: 'يمكنك استخدام التوست المحمص أو الرقاق المصري كبديل رائع لعجينة البف باستري.'
  }
];

function selectFallbackRecipes(ingredients: string[], mealType: string, cuisine: string): Recipe[] {
  const normUserIngs = ingredients.map(normalizeArabic);
  const matched = CURATED_RECIPES.filter((r) => {
    if (mealType && r.meal !== mealType && mealType !== 'غداء') {
      return false;
    }
    return true;
  });

  if (matched.length >= 3) {
    return matched.slice(0, 3);
  }

  // Combine matched with remaining curated
  const set = new Set(matched.map((r) => r.id));
  const result = [...matched];
  for (const r of CURATED_RECIPES) {
    if (!set.has(r.id)) {
      result.push(r);
      if (result.length >= 3) break;
    }
  }
  return result;
}

// Handler for recipes generation
async function handleRecipes(req: Request, res: Response) {
  try {
    const body = req.body as RecipeRequest;
    if (!body || !Array.isArray(body.ingredients)) {
      return res.status(400).json({ error: 'قائمة المكونات مطلوبة بصيغة صحيحة.' });
    }

    const rawIngredients = [...new Set(body.ingredients.map((x) => cleanStr(x, 40)).filter(Boolean))].slice(0, 40);
    if (!rawIngredients.length) {
      return res.status(400).json({ error: 'يرجى إدخال مكوّن واحد على الأقل للبحث.' });
    }

    const mealType = cleanStr(body.mealType, 20) || 'غداء';
    const cuisine = cleanStr(body.cuisine, 30) || 'أي مطبخ';
    const diet = cleanStr(body.diet, 30) || 'عام';
    const pantry = Array.isArray(body.pantry)
      ? [...new Set(body.pantry.map((x) => cleanStr(x, 40)).filter(Boolean))].slice(0, 30)
      : [];

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      console.warn('GEMINI_API_KEY is not set. Returning curated authentic recipes.');
      const fallback = selectFallbackRecipes(rawIngredients, mealType, cuisine);
      return res.status(200).json(fallback);
    }

    const dietInstruction =
      diet && diet !== 'عام'
        ? `يجب الالتزام الصارم بهذا النظام الغذائي: (${diet}).`
        : 'نظام غذائي عام.';

    const pantryNote = pantry.length
      ? `مواد مخزن المنزل الأساسية المتوفرة دائماً: ${JSON.stringify(pantry)}.`
      : '';

    const prompt = `أنت شيف طهي عربي ومستشار تغذية محترف ومبتكر.
المطلوب اقتراح 3 وصفات طبخ شهية ومميزة جداً تناسب المعطيات التالية:

- المكونات المتاحة لدى المستخدم: ${JSON.stringify(rawIngredients)}.
${pantryNote}
- نوع الوجبة المطلوبة: ${mealType}.
- المطبخ المفضل: ${cuisine}.
- النظام الغذائي: ${diet}.

شروط هامة:
1. ${dietInstruction}
2. الاعتماد قدر الإمكان وبشكل أساسي على المكونات المتوفرة المذكورة، مع إمكانية إضافة مكملات بسيطة شائعة في كل منزل.
3. جميع الأطباق حلال 100%، خالية من لحم الخنزير أو الكحول.
4. كتابة كل شيء باللغة العربية الفصيحة الواضحة والجميلة.
5. في خطوات التحضير ("steps")، احرص على ذكر مدة التحضير بالدقائق أينما وجد توقيت (مثال: "يُقلّب لمدة 5 دقائق"، "يُترك على نار هادئة لمدة 20 دقيقة") لكي يستطيع نظام المؤقت الذكي في التطبيق رصد المدة للمستخدم.

أعد الرد على شكل مصفوفة JSON تحتوي بدقة على 3 كائنات وصفات بهذا المخطط:
[
  {
    "name": "اسم الوصفة الواضح والشهي",
    "cuisine": "المطبخ (مثال: سوري، مصري، خليجي، إيطالي)",
    "meal": "${mealType}",
    "time": "المدة التقريبية (مثال: 30 دقيقة)",
    "difficulty": "سهل | متوسط | متقدم",
    "calories": "السعرات التقريبية (مثال: 420 سعرة)",
    "ingredients": [
      "المكون مع مقداره (مثال: 2 حبة بطاطا مقطعة مكعبات)"
    ],
    "steps": [
      "خطوة واضحة ودقيقة مع ذكر الدقائق إن وجدت"
    ],
    "tips": "نصيحة شيف ذكية لنجاح الطبق"
  }
]`;

    // Try fast responsive models in order: gemini-3.1-flash-lite, then gemini-3.8-flash
    const CANDIDATE_MODELS = ['gemini-3.1-flash-lite', 'gemini-3.8-flash'];
    let generatedRecipesText: string | null = null;

    for (const model of CANDIDATE_MODELS) {
      const ctrl = new AbortController();
      const timeoutId = setTimeout(() => ctrl.abort(), 7500);

      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
              generationConfig: {
                responseMimeType: 'application/json',
                temperature: 0.7,
                thinkingConfig: { thinkingBudget: 0 },
              },
            }),
            signal: ctrl.signal,
          }
        );

        clearTimeout(timeoutId);

        if (!response.ok) {
          console.warn(`Model ${model} returned status ${response.status}`);
          continue;
        }

        const data: any = await response.json();
        const text = data?.candidates?.[0]?.content?.parts?.map((p: any) => p.text || '').join('') || '';
        if (text.trim()) {
          generatedRecipesText = text.trim();
          break;
        }
      } catch (err: any) {
        clearTimeout(timeoutId);
        console.warn(`Model ${model} call failed or timed out:`, err?.message || err);
        // Continue to next candidate or fallback
      }
    }

    if (!generatedRecipesText) {
      console.warn('Gemini models unavailable or timed out. Serving curated authentic recipes.');
      return res.status(200).json(selectFallbackRecipes(rawIngredients, mealType, cuisine));
    }

    const cleanJson = generatedRecipesText.replace(/^```json\s*/i, '').replace(/\s*```$/i, '').trim();
    let parsed: unknown;
    try {
      parsed = JSON.parse(cleanJson);
    } catch (parseErr) {
      console.error('Failed to parse Gemini output:', parseErr, generatedRecipesText);
      return res.status(200).json(selectFallbackRecipes(rawIngredients, mealType, cuisine));
    }

    if (!Array.isArray(parsed) || !parsed.length) {
      return res.status(200).json(selectFallbackRecipes(rawIngredients, mealType, cuisine));
    }

    const normalizedRecipes: Recipe[] = parsed.slice(0, 3).map((r: any) => {
      const name = cleanStr(r?.name, 90) || 'وصفة شهية';
      const rMeal = cleanStr(r?.meal, 30) || mealType;
      const rCuisine = cleanStr(r?.cuisine, 40) || cuisine;
      const rTime = cleanStr(r?.time, 40) || '30 دقيقة';
      const rDifficulty = cleanStr(r?.difficulty, 20) || 'متوسط';
      const rCalories = cleanStr(r?.calories, 30) || '';
      const rTips = cleanStr(r?.tips, 200) || '';

      const rIngredients = (Array.isArray(r?.ingredients) ? r.ingredients : [])
        .map((x: unknown) => cleanStr(x, 100))
        .filter(Boolean)
        .slice(0, 30);

      const rSteps = (Array.isArray(r?.steps) ? r.steps : [])
        .map((x: unknown) => cleanStr(x, 400))
        .filter(Boolean)
        .slice(0, 20);

      const id = hashId(normalizeArabic(name) + '|' + normalizeArabic(rIngredients.slice(0, 3).join('')));

      return {
        id,
        name,
        cuisine: rCuisine,
        meal: rMeal,
        time: rTime,
        difficulty: rDifficulty,
        calories: rCalories,
        ingredients: rIngredients.length ? rIngredients : ['مكونات حسب الرغبة'],
        steps: rSteps.length ? rSteps : ['طريقة التحضير حسب الإرشادات'],
        tips: rTips,
      };
    });

    return res.status(200).json(normalizedRecipes);
  } catch (error: any) {
    console.error('Error generating recipes with Gemini:', error);
    // Graceful fallback so the user always has a functional app experience
    const fallback = selectFallbackRecipes(
      Array.isArray(req.body?.ingredients) ? req.body.ingredients : ['خضار', 'توابل'],
      req.body?.mealType || 'غداء',
      req.body?.cuisine || 'عام'
    );
    return res.status(200).json(fallback);
  }
}

app.post('/api/recipes', handleRecipes);
app.post('/.netlify/functions/recipes', handleRecipes);

// Dev server or static files
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on port ${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
