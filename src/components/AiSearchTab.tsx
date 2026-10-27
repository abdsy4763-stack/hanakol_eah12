import React, { useState, KeyboardEvent } from 'react';
import {
  Sparkles,
  Plus,
  X,
  Trash2,
  PackageCheck,
  Utensils,
  Globe2,
  Salad,
  Loader2,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { Recipe, MealType } from '../types';
import { RecipeCard } from './RecipeCard';
import {
  POPULAR_INGREDIENTS,
  CUISINE_OPTIONS,
  DIET_OPTIONS,
  MEAL_TYPES,
  normalizeArabic,
} from '../utils/arabic';

interface AiSearchTabProps {
  ingredients: string[];
  onAddIngredient: (item: string) => boolean;
  onRemoveIngredient: (index: number) => void;
  onClearIngredients: () => void;
  includePantry: boolean;
  onToggleIncludePantry: (val: boolean) => void;
  mealType: MealType;
  onChangeMealType: (m: MealType) => void;
  cuisine: string;
  onChangeCuisine: (c: string) => void;
  diet: string;
  onChangeDiet: (d: string) => void;
  pantryItems: string[];
  results: Recipe[];
  isLoading: boolean;
  error: string | null;
  onSearch: () => void;
  favorites: Recipe[];
  onToggleFavorite: (recipe: Recipe) => void;
  onAddMissingToShopping: (items: string[]) => void;
  onStartTimer: (recipeName: string, stepNumber: number, minutes: number) => void;
  activeTimersMap: Record<string, number>;
  remainingTimersMap: Record<string, string>;
}

export const AiSearchTab: React.FC<AiSearchTabProps> = ({
  ingredients,
  onAddIngredient,
  onRemoveIngredient,
  onClearIngredients,
  includePantry,
  onToggleIncludePantry,
  mealType,
  onChangeMealType,
  cuisine,
  onChangeCuisine,
  diet,
  onChangeDiet,
  pantryItems,
  results,
  isLoading,
  error,
  onSearch,
  favorites,
  onToggleFavorite,
  onAddMissingToShopping,
  onStartTimer,
  activeTimersMap,
  remainingTimersMap,
}) => {
  const [inputValue, setInputValue] = useState('');

  const handleAdd = () => {
    const val = inputValue.trim();
    if (!val) return;
    onAddIngredient(val);
    setInputValue('');
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.nativeEvent.isComposing) {
      e.preventDefault();
      handleAdd();
    }
  };

  const handleSuggestionClick = (item: string) => {
    onAddIngredient(item);
  };

  return (
    <div className="space-y-6">
      {/* Control Panel Card */}
      <section className="bg-white rounded-3xl p-6 sm:p-7 border border-orange-100 shadow-md">
        <div className="flex items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-orange-100 text-orange-600">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-stone-900">
                إيه المكونات المتوفرة عندك في المطبخ؟
              </h2>
              <p className="text-xs text-stone-500">
                أدخل المكونات وسيقترح عليك الذكاء الاصطناعي 3 وصفات مناسبة فوراً
              </p>
            </div>
          </div>

          {ingredients.length > 0 && (
            <button
              onClick={onClearIngredients}
              className="text-xs font-bold text-red-600 hover:text-red-700 hover:bg-red-50 px-3 py-1.5 rounded-xl border border-red-200 transition-all flex items-center gap-1 shrink-0"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>مسح الكل</span>
            </button>
          )}
        </div>

        {/* Input box */}
        <div className="flex gap-2 mb-3">
          <div className="relative flex-grow">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              maxLength={50}
              placeholder="اكتب مكوناً واضغط إضافة (مثل: بطاطا، دجاج، بيض، معكرونة...)"
              className="w-full bg-stone-50/80 hover:bg-stone-50 focus:bg-white border border-stone-300 rounded-2xl px-4 py-3.5 text-sm font-semibold text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all shadow-inner"
            />
          </div>
          <button
            onClick={handleAdd}
            disabled={!inputValue.trim()}
            className="bg-orange-600 hover:bg-orange-700 disabled:opacity-40 disabled:hover:bg-orange-600 text-white px-5 sm:px-6 py-3.5 rounded-2xl font-bold text-sm transition-all shadow-md shadow-orange-600/20 flex items-center gap-1.5 shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة</span>
          </button>
        </div>

        {/* Quick suggestions */}
        <div className="mb-4">
          <div className="text-xs font-bold text-stone-500 mb-2 flex items-center gap-1">
            <span>مقترحات سريعة للإضافة بنقرة واحدة:</span>
          </div>
          <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
            {POPULAR_INGREDIENTS.map((item) => {
              const alreadyAdded = ingredients.some(
                (ing) => normalizeArabic(ing) === normalizeArabic(item)
              );
              return (
                <button
                  key={item}
                  onClick={() => handleSuggestionClick(item)}
                  disabled={alreadyAdded}
                  className={`text-xs px-2.5 py-1 rounded-xl font-semibold transition-all ${
                    alreadyAdded
                      ? 'bg-stone-100 text-stone-400 line-through cursor-default'
                      : 'bg-stone-100 hover:bg-orange-100 text-stone-700 hover:text-orange-800 border border-stone-200/60'
                  }`}
                >
                  + {item}
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected ingredients chips */}
        <div className="min-h-[60px] p-3.5 bg-stone-50/90 rounded-2xl border border-dashed border-stone-300/80 mb-5 flex flex-wrap items-center gap-2">
          {ingredients.length > 0 ? (
            ingredients.map((item, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1.5 bg-orange-100 text-orange-900 border border-orange-200/90 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold shadow-2xs animate-in fade-in zoom-in duration-150"
              >
                <span>{item}</span>
                <button
                  onClick={() => onRemoveIngredient(idx)}
                  className="hover:bg-orange-200 rounded-lg p-0.5 transition-colors"
                  aria-label={`حذف ${item}`}
                >
                  <X className="w-3.5 h-3.5 text-orange-800" />
                </button>
              </span>
            ))
          ) : (
            <span className="text-xs sm:text-sm text-stone-400 font-medium mx-auto py-2 text-center">
              لم تقم بإضافة أي مكون بعد. أضف مكوناتك أعلاه لبدء ابتكار أشهى الوجبات!
            </span>
          )}
        </div>

        {/* Pantry inclusion switch */}
        <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/70 mb-5">
          <input
            type="checkbox"
            id="include-pantry-cb"
            checked={includePantry}
            onChange={(e) => onToggleIncludePantry(e.target.checked)}
            className="w-5 h-5 rounded-lg accent-orange-600 cursor-pointer"
          />
          <label
            htmlFor="include-pantry-cb"
            className="text-xs sm:text-sm font-bold text-stone-800 cursor-pointer flex items-center gap-2"
          >
            <PackageCheck className="w-4 h-4 text-orange-600" />
            <span>
              تضمين مواد مخزن المنزل الدائمة تلقائياً في البحث (الملح، الزيت، البهارات،
              الأرز...) [{pantryItems.length} مواد]
            </span>
          </label>
        </div>

        {/* Filters grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          {/* Meal Type */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-2 flex items-center gap-1.5">
              <Utensils className="w-3.5 h-3.5 text-orange-600" />
              <span>نوع الوجبة:</span>
            </label>
            <div className="grid grid-cols-4 gap-1">
              {MEAL_TYPES.map((m) => (
                <button
                  key={m}
                  onClick={() => onChangeMealType(m)}
                  className={`py-2 px-1 rounded-xl text-xs font-black transition-all border ${
                    mealType === m
                      ? 'bg-orange-600 text-white border-orange-600 shadow-sm'
                      : 'bg-stone-50 hover:bg-stone-100 text-stone-700 border-stone-200'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          {/* Cuisine */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-2 flex items-center gap-1.5">
              <Globe2 className="w-3.5 h-3.5 text-orange-600" />
              <span>المطبخ / البلد:</span>
            </label>
            <select
              value={cuisine}
              onChange={(e) => onChangeCuisine(e.target.value)}
              className="w-full bg-white border border-stone-300 rounded-xl px-3 py-2 text-xs sm:text-sm font-semibold text-stone-800 focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              {CUISINE_OPTIONS.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          {/* Diet */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-2 flex items-center gap-1.5">
              <Salad className="w-3.5 h-3.5 text-orange-600" />
              <span>النظام الغذائي:</span>
            </label>
            <select
              value={diet}
              onChange={(e) => onChangeDiet(e.target.value)}
              className="w-full bg-white border border-stone-300 rounded-xl px-3 py-2 text-xs sm:text-sm font-semibold text-stone-800 focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              {DIET_OPTIONS.map((d) => (
                <option key={d.value} value={d.value}>
                  {d.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Generate Button */}
        <button
          onClick={onSearch}
          disabled={isLoading || ingredients.length === 0}
          className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-orange-600 via-amber-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white font-black text-sm sm:text-base shadow-lg shadow-orange-600/30 hover:shadow-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>الذكاء الاصطناعي يبحث ويبتكر أشهى الوصفات...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              <span>ابتكر وصفات شهية الآن ({ingredients.length} مكونات محددة)</span>
            </>
          )}
        </button>
      </section>

      {/* Error state */}
      {error && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 flex items-center justify-between gap-3 text-sm font-bold">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            onClick={onSearch}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white border border-red-200 text-red-700 text-xs font-extrabold hover:bg-red-100 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>إعادة المحاولة</span>
          </button>
        </div>
      )}

      {/* Loading Skeletons */}
      {isLoading && (
        <div className="space-y-4">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="bg-white rounded-3xl p-6 border border-stone-200/70 shadow-sm animate-pulse space-y-4"
            >
              <div className="flex justify-between items-center">
                <div className="h-6 bg-stone-200 rounded-xl w-1/3"></div>
                <div className="h-8 w-8 bg-stone-200 rounded-full"></div>
              </div>
              <div className="flex gap-2">
                <div className="h-5 bg-stone-100 rounded-lg w-20"></div>
                <div className="h-5 bg-stone-100 rounded-lg w-24"></div>
                <div className="h-5 bg-stone-100 rounded-lg w-16"></div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div className="h-28 bg-stone-50 rounded-2xl"></div>
                <div className="h-28 bg-stone-50 rounded-2xl"></div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Recipe Results */}
      {results.length > 0 && !isLoading && (
        <div id="recipes-results-section" className="space-y-6 pt-2">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-lg font-black text-stone-900 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-orange-600"></span>
              الوصفات المقترحة لك ({results.length})
            </h3>
            <span className="text-xs font-semibold text-stone-500">
              اضغط على ❤️ لحفظ أي وصفة في مفضلتك
            </span>
          </div>

          <div className="space-y-6">
            {results.map((recipe) => {
              const isFav = favorites.some((f) => f.id === recipe.id);
              const activeTimerStep = activeTimersMap[recipe.name];
              const remainingFormatted = remainingTimersMap[recipe.name];

              return (
                <RecipeCard
                  key={recipe.id}
                  recipe={recipe}
                  userIngredients={ingredients}
                  pantryItems={pantryItems}
                  isFavorite={isFav}
                  onToggleFavorite={onToggleFavorite}
                  onAddMissingToShopping={onAddMissingToShopping}
                  onStartTimer={onStartTimer}
                  activeTimerStep={activeTimerStep}
                  remainingTimeFormatted={remainingFormatted}
                />
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
