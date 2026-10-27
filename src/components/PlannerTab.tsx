import React from 'react';
import {
  CalendarDays,
  ShoppingCart,
  Printer,
  Trash2,
  Utensils,
  PlusCircle,
  ExternalLink,
} from 'lucide-react';
import { Recipe, WeeklyPlan, TabType } from '../types';
import { DAYS_OF_WEEK, MEAL_TYPES } from '../utils/arabic';

interface PlannerTabProps {
  plan: WeeklyPlan;
  favorites: Recipe[];
  onUpdateMealPlan: (day: string, meal: string, recipeId: string) => void;
  onClearPlan: () => void;
  onPlanToShopping: () => void;
  onSwitchTab: (tab: TabType) => void;
}

export const PlannerTab: React.FC<PlannerTabProps> = ({
  plan,
  favorites,
  onUpdateMealPlan,
  onClearPlan,
  onPlanToShopping,
  onSwitchTab,
}) => {
  const hasFavorites = favorites.length > 0;

  // Count planned meals
  let plannedCount = 0;
  Object.values(plan).forEach((dayMeals) => {
    Object.values(dayMeals || {}).forEach((recId) => {
      if (recId) plannedCount++;
    });
  });

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-orange-100 shadow-md space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-50 text-amber-600 border border-amber-100">
              <CalendarDays className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-stone-900">جدول وجبات الأسبوع</h2>
              <p className="text-xs text-stone-500">
                خطط لوجبات عائلتك لكل أيام الأسبوع بكل راحة من وصفاتك المفضلة ({plannedCount} وجبات محددة)
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 no-print">
            <button
              onClick={onPlanToShopping}
              disabled={plannedCount === 0}
              className="text-xs font-bold bg-orange-600 hover:bg-orange-700 disabled:opacity-40 text-white px-3.5 py-2.5 rounded-xl transition-all shadow-md shadow-orange-600/20 flex items-center gap-1.5"
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              <span>أضف نواقص الخطة للتسوق</span>
            </button>
            <button
              onClick={() => window.print()}
              className="text-xs font-bold text-stone-700 bg-stone-100 hover:bg-stone-200 px-3.5 py-2.5 rounded-xl transition-all flex items-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>طباعة الجدول</span>
            </button>
            <button
              onClick={onClearPlan}
              disabled={plannedCount === 0}
              className="text-xs font-bold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 disabled:opacity-40 px-3.5 py-2.5 rounded-xl transition-all flex items-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>مسح الخطة</span>
            </button>
          </div>
        </div>

        {/* Notice if no favorites */}
        {!hasFavorites && (
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs sm:text-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Utensils className="w-5 h-5 text-amber-600 shrink-0" />
              <span>
                لا توجد وصفات محفوظة في المفضلة بعد. لإضافة وجبات إلى جدول الأسبوع، ابحث عن
                وصفات واضغط على علامة القلب (❤️).
              </span>
            </div>
            <button
              onClick={() => onSwitchTab('ai')}
              className="bg-amber-600 hover:bg-amber-700 text-white px-3.5 py-1.5 rounded-xl text-xs font-black transition-all shadow-xs shrink-0 flex items-center gap-1"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>ابحث عن وصفات الآن</span>
            </button>
          </div>
        )}

        {/* Days Grid */}
        <div className="space-y-4">
          {DAYS_OF_WEEK.map((day) => {
            const dayPlan = plan[day] || {};

            return (
              <div
                key={day}
                className="p-4 sm:p-5 rounded-2xl bg-stone-50/70 border border-stone-200/80 space-y-3 print-break-inside-avoid"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-black text-orange-700 flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-orange-600"></span>
                    {day}
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {MEAL_TYPES.map((meal) => {
                    const selectedRecipeId = dayPlan[meal] || '';
                    const matchedRecipe = favorites.find((f) => f.id === selectedRecipeId);

                    return (
                      <div
                        key={meal}
                        className="bg-white p-3 rounded-xl border border-stone-200 shadow-2xs space-y-1.5"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-extrabold text-stone-600">
                            {meal}
                          </span>
                          {matchedRecipe && (
                            <span className="text-[11px] text-orange-600 font-bold">
                              {matchedRecipe.time}
                            </span>
                          )}
                        </div>

                        <select
                          value={selectedRecipeId}
                          onChange={(e) => onUpdateMealPlan(day, meal, e.target.value)}
                          className={`w-full text-xs font-bold rounded-lg border px-2.5 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                            selectedRecipeId
                              ? 'border-orange-300 bg-orange-50/50 text-stone-900'
                              : 'border-stone-200 bg-stone-50 text-stone-400'
                          }`}
                        >
                          <option value="">— غير محدد —</option>
                          {favorites.map((fav) => (
                            <option key={fav.id} value={fav.id}>
                              {fav.name} ({fav.cuisine || fav.meal})
                            </option>
                          ))}
                        </select>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
