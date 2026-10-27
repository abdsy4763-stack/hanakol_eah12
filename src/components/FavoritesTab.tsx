import React, { useState } from 'react';
import { Heart, Search, Sparkles, ChefHat } from 'lucide-react';
import { Recipe, TabType } from '../types';
import { RecipeCard } from './RecipeCard';
import { normalizeArabic } from '../utils/arabic';

interface FavoritesTabProps {
  favorites: Recipe[];
  onToggleFavorite: (recipe: Recipe) => void;
  userIngredients: string[];
  pantryItems: string[];
  onAddMissingToShopping: (items: string[]) => void;
  onStartTimer: (recipeName: string, stepNumber: number, minutes: number) => void;
  activeTimersMap: Record<string, number>;
  remainingTimersMap: Record<string, string>;
  onSwitchTab: (tab: TabType) => void;
}

export const FavoritesTab: React.FC<FavoritesTabProps> = ({
  favorites,
  onToggleFavorite,
  userIngredients,
  pantryItems,
  onAddMissingToShopping,
  onStartTimer,
  activeTimersMap,
  remainingTimersMap,
  onSwitchTab,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredFavorites = favorites.filter((r) => {
    if (!searchTerm.trim()) return true;
    const q = normalizeArabic(searchTerm);
    return (
      normalizeArabic(r.name).includes(q) ||
      normalizeArabic(r.cuisine).includes(q) ||
      normalizeArabic(r.meal).includes(q) ||
      r.ingredients.some((ing) => normalizeArabic(ing).includes(q))
    );
  });

  return (
    <div className="space-y-6">
      {/* Header card */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-orange-100 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-rose-50 text-rose-600 border border-rose-100">
              <Heart className="w-6 h-6 fill-rose-500" />
            </div>
            <div>
              <h2 className="text-xl font-black text-stone-900">وصفاتي المفضلة</h2>
              <p className="text-xs text-stone-500">
                الوصفات التي قمت بحفظها للرجوع إليها في أي وقت ({favorites.length} وصفة)
              </p>
            </div>
          </div>

          {/* Search filter within favorites */}
          {favorites.length > 0 && (
            <div className="relative w-full sm:w-72">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="ابحث بالاسم، المطبخ، أو المكون..."
                className="w-full bg-stone-50 border border-stone-200 rounded-xl pr-9 pl-4 py-2 text-xs font-semibold text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
              <Search className="w-4 h-4 text-stone-400 absolute right-3 top-2.5" />
            </div>
          )}
        </div>

        {favorites.length === 0 ? (
          <div className="p-10 text-center rounded-2xl border border-dashed border-stone-200 bg-stone-50/50 space-y-4">
            <div className="w-16 h-16 rounded-3xl bg-rose-50 text-rose-400 flex items-center justify-center mx-auto">
              <ChefHat className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-stone-800">
                لا توجد أي وصفة في مفضلتك بعد
              </h3>
              <p className="text-xs text-stone-500 max-w-md mx-auto">
                عند البحث في تبويب "بحث الذكاء الاصطناعي"، اضغط على علامة القلب (❤️) في أي وصفة
                لحفظها هنا واستخدامها في خطة الأسبوع.
              </p>
            </div>
            <button
              onClick={() => onSwitchTab('ai')}
              className="inline-flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white font-black text-xs px-5 py-2.5 rounded-xl shadow-md shadow-orange-600/20 transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>اكتشف وصفات جديدة الآن</span>
            </button>
          </div>
        ) : filteredFavorites.length === 0 ? (
          <div className="p-8 text-center text-xs text-stone-500">
            لم يتم العثور على أي وصفة تطابق "{searchTerm}".
          </div>
        ) : (
          <div className="space-y-6 pt-2">
            {filteredFavorites.map((recipe) => {
              const activeTimerStep = activeTimersMap[recipe.name];
              const remainingFormatted = remainingTimersMap[recipe.name];

              return (
                <RecipeCard
                  key={recipe.id}
                  recipe={recipe}
                  userIngredients={userIngredients}
                  pantryItems={pantryItems}
                  isFavorite={true}
                  onToggleFavorite={onToggleFavorite}
                  onAddMissingToShopping={onAddMissingToShopping}
                  onStartTimer={onStartTimer}
                  activeTimerStep={activeTimerStep}
                  remainingTimeFormatted={remainingFormatted}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
