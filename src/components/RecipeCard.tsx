import React, { useState } from 'react';
import {
  Heart,
  Clock,
  Globe,
  UtensilsCrossed,
  Flame,
  CheckCircle2,
  ShoppingCart,
  Timer as TimerIcon,
  Lightbulb,
  Printer,
  Share2,
  Check,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { Recipe } from '../types';
import {
  isIngredientAvailable,
  getMissingIngredients,
  parseStepMinutes,
} from '../utils/arabic';

interface RecipeCardProps {
  recipe: Recipe;
  userIngredients: string[];
  pantryItems: string[];
  isFavorite: boolean;
  onToggleFavorite: (recipe: Recipe) => void;
  onAddMissingToShopping: (missingItems: string[]) => void;
  onStartTimer: (recipeName: string, stepNumber: number, minutes: number) => void;
  activeTimerStep?: number;
  remainingTimeFormatted?: string;
}

export const RecipeCard: React.FC<RecipeCardProps> = ({
  recipe,
  userIngredients,
  pantryItems,
  isFavorite,
  onToggleFavorite,
  onAddMissingToShopping,
  onStartTimer,
  activeTimerStep,
  remainingTimeFormatted,
}) => {
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(true);

  const missingList = getMissingIngredients(recipe.ingredients, userIngredients, pantryItems, true);
  const isAllAvailable = missingList.length === 0;

  const handleShare = async () => {
    const text = `🍳 وصفة: ${recipe.name}\n⏱ المدة: ${recipe.time}\n🌐 المطبخ: ${recipe.cuisine}\n\nالمكونات:\n${recipe.ingredients
      .map((i) => '• ' + i)
      .join('\n')}\n\nطريقة التحضير:\n${recipe.steps
      .map((s, i) => `${i + 1}. ${s}`)
      .join('\n')}\n\nتم إنشاؤها عبر تطبيق "هناكل إيه؟"`;

    if (navigator.clipboard) {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <article className="bg-white rounded-3xl border border-stone-200/80 shadow-md hover:shadow-lg transition-all overflow-hidden print-break-inside-avoid">
      {/* Header bar */}
      <div className="bg-gradient-to-l from-orange-50/90 via-amber-50/40 to-white p-5 border-b border-orange-100 flex items-start justify-between gap-4">
        <div className="space-y-2 flex-grow">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-xl font-black text-stone-900 tracking-tight">
              {recipe.name}
            </h3>
            {isAllAvailable ? (
              <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                كل المكونات متوفرة
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-red-50 text-red-700 border border-red-200">
                <ShoppingCart className="w-3.5 h-3.5 text-red-600" />
                ينقصك {missingList.length} مكون
              </span>
            )}
          </div>

          {/* Badges */}
          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-stone-600">
            {recipe.cuisine && (
              <span className="inline-flex items-center gap-1 bg-white px-2.5 py-1 rounded-xl border border-stone-200 shadow-2xs">
                <Globe className="w-3.5 h-3.5 text-orange-600" />
                {recipe.cuisine}
              </span>
            )}
            {recipe.meal && (
              <span className="inline-flex items-center gap-1 bg-white px-2.5 py-1 rounded-xl border border-stone-200 shadow-2xs">
                <UtensilsCrossed className="w-3.5 h-3.5 text-amber-600" />
                {recipe.meal}
              </span>
            )}
            {recipe.time && (
              <span className="inline-flex items-center gap-1 bg-white px-2.5 py-1 rounded-xl border border-stone-200 shadow-2xs">
                <Clock className="w-3.5 h-3.5 text-blue-600" />
                {recipe.time}
              </span>
            )}
            {recipe.calories && (
              <span className="inline-flex items-center gap-1 bg-white px-2.5 py-1 rounded-xl border border-stone-200 shadow-2xs">
                <Flame className="w-3.5 h-3.5 text-rose-500" />
                {recipe.calories}
              </span>
            )}
          </div>
        </div>

        {/* Favorite & Actions */}
        <div className="flex items-center gap-1.5 no-print shrink-0">
          <button
            onClick={() => onToggleFavorite(recipe)}
            className={`p-2.5 rounded-2xl transition-all ${
              isFavorite
                ? 'bg-rose-50 text-rose-600 hover:bg-rose-100'
                : 'bg-stone-100 text-stone-400 hover:text-rose-500 hover:bg-stone-200'
            }`}
            title={isFavorite ? 'إزالة من المفضلة' : 'حفظ في المفضلة'}
            aria-label={isFavorite ? 'إزالة من المفضلة' : 'حفظ في المفضلة'}
          >
            <Heart className={`w-5 h-5 ${isFavorite ? 'fill-rose-500 text-rose-500' : ''}`} />
          </button>
          <button
            onClick={handleShare}
            className="p-2.5 rounded-2xl bg-stone-100 text-stone-500 hover:text-stone-800 hover:bg-stone-200 transition-all"
            title="نسخ الوصفة"
            aria-label="نسخ الوصفة"
          >
            {copied ? <Check className="w-5 h-5 text-emerald-600" /> : <Share2 className="w-5 h-5" />}
          </button>
          <button
            onClick={handlePrint}
            className="p-2.5 rounded-2xl bg-stone-100 text-stone-500 hover:text-stone-800 hover:bg-stone-200 transition-all"
            title="طباعة الوصفة"
            aria-label="طباعة الوصفة"
          >
            <Printer className="w-5 h-5" />
          </button>
          <button
            onClick={() => setExpanded(!expanded)}
            className="p-2.5 rounded-2xl bg-stone-100 text-stone-500 hover:text-stone-800 hover:bg-stone-200 transition-all md:hidden"
            title={expanded ? 'طي التفاصيل' : 'عرض التفاصيل'}
          >
            {expanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Content */}
      {expanded && (
        <div className="p-5 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            {/* Ingredients column */}
            <div className="md:col-span-2 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-extrabold text-stone-900 text-sm flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-orange-600"></span>
                  المكونات المطلوبة ({recipe.ingredients.length})
                </h4>
              </div>

              <ul className="space-y-2 bg-stone-50/70 p-3.5 rounded-2xl border border-stone-200/70">
                {recipe.ingredients.map((ing, idx) => {
                  const available = isIngredientAvailable(ing, [
                    ...userIngredients,
                    ...pantryItems,
                  ]);

                  return (
                    <li
                      key={idx}
                      className={`text-xs sm:text-sm flex items-start gap-2 ${
                        available ? 'text-stone-700' : 'text-red-700 font-semibold'
                      }`}
                    >
                      <span className="shrink-0 mt-0.5">
                        {available ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <ShoppingCart className="w-4 h-4 text-red-500" />
                        )}
                      </span>
                      <span>{ing}</span>
                    </li>
                  );
                })}
              </ul>

              {missingList.length > 0 && (
                <button
                  onClick={() => onAddMissingToShopping(missingList)}
                  className="no-print w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold bg-orange-50 hover:bg-orange-100 text-orange-800 border border-orange-200/80 transition-all shadow-2xs"
                >
                  <ShoppingCart className="w-4 h-4" />
                  <span>أضف {missingList.length} نواقص إلى قائمة التسوق</span>
                </button>
              )}
            </div>

            {/* Preparation Steps */}
            <div className="md:col-span-3 space-y-3">
              <h4 className="font-extrabold text-stone-900 text-sm flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-600"></span>
                خطوات التحضير ({recipe.steps.length})
              </h4>

              <ol className="space-y-3">
                {recipe.steps.map((step, idx) => {
                  const stepNumber = idx + 1;
                  const minutes = parseStepMinutes(step);
                  const isTimerActive = activeTimerStep === stepNumber;

                  return (
                    <li
                      key={idx}
                      className="flex items-start gap-3 p-3 rounded-2xl bg-stone-50/40 hover:bg-stone-50 border border-stone-200/50 transition-colors"
                    >
                      <span className="w-6 h-6 rounded-full bg-orange-600 text-white text-xs font-black flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                        {stepNumber}
                      </span>
                      <div className="flex-grow space-y-1.5">
                        <p className="text-xs sm:text-sm leading-relaxed text-stone-800">
                          {step}
                        </p>

                        {/* Interactive cooking timer badge */}
                        {minutes > 0 && (
                          <div className="no-print pt-1">
                            <button
                              onClick={() => onStartTimer(recipe.name, stepNumber, minutes)}
                              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold transition-all shadow-2xs ${
                                isTimerActive
                                  ? 'bg-amber-500 text-white animate-pulse'
                                  : 'bg-amber-100/80 hover:bg-amber-200 text-amber-900 border border-amber-300/60'
                              }`}
                            >
                              <TimerIcon className="w-3.5 h-3.5" />
                              <span>
                                {isTimerActive && remainingTimeFormatted
                                  ? `⏳ ${remainingTimeFormatted}`
                                  : `بدء مؤقت: ${minutes} دقيقة`}
                              </span>
                            </button>
                          </div>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ol>
            </div>
          </div>

          {/* Chef Tip */}
          {recipe.tips && (
            <div className="flex items-start gap-3 p-4 rounded-2xl bg-amber-50/80 border border-amber-200/80 text-amber-900 text-xs sm:text-sm">
              <Lightbulb className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong className="font-extrabold block mb-0.5">نصيحة الشيف:</strong>
                <span>{recipe.tips}</span>
              </div>
            </div>
          )}
        </div>
      )}
    </article>
  );
};
