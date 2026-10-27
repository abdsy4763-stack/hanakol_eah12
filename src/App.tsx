import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Recipe,
  ShoppingItem,
  MealType,
  WeeklyPlan,
  TabType,
  ActiveTimer,
} from './types';
import {
  storage,
  DEFAULT_PANTRY,
  normalizeArabic,
  playTimerChime,
  getMissingIngredients,
} from './utils/arabic';
import { Header } from './components/Header';
import { AiSearchTab } from './components/AiSearchTab';
import { PantryTab } from './components/PantryTab';
import { PlannerTab } from './components/PlannerTab';
import { FavoritesTab } from './components/FavoritesTab';
import { ShoppingTab } from './components/ShoppingTab';
import { ActiveTimersBar } from './components/ActiveTimersBar';

export default function App() {
  // Navigation
  const [currentTab, setCurrentTab] = useState<TabType>('ai');

  // Core Data States with localStorage persistence
  const [ingredients, setIngredients] = useState<string[]>(() =>
    storage.get<string[]>('ingredients', ['بطاطا', 'دجاج', 'بصل'])
  );

  const [pantryItems, setPantryItems] = useState<string[]>(() =>
    storage.get<string[]>('pantry', DEFAULT_PANTRY)
  );

  const [favorites, setFavorites] = useState<Recipe[]>(() =>
    storage.get<Recipe[]>('favorites', [])
  );

  const [weeklyPlan, setWeeklyPlan] = useState<WeeklyPlan>(() =>
    storage.get<WeeklyPlan>('plan', {})
  );

  const [shoppingItems, setShoppingItems] = useState<ShoppingItem[]>(() =>
    storage.get<ShoppingItem[]>('shopping', [])
  );

  const [mealType, setMealType] = useState<MealType>(() =>
    storage.get<MealType>('mealType', 'غداء')
  );

  const [cuisine, setCuisine] = useState<string>('أي مطبخ');
  const [diet, setDiet] = useState<string>('عام');
  const [includePantry, setIncludePantry] = useState<boolean>(true);

  // Search Results & Loading
  const [results, setResults] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Timers state
  const [activeTimers, setActiveTimers] = useState<ActiveTimer[]>([]);

  // Toast notification state
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const showToast = useCallback((msg: string) => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setToastMessage(msg);
    toastTimeoutRef.current = setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  }, []);

  // Save changes to localStorage
  useEffect(() => {
    storage.set('ingredients', ingredients);
  }, [ingredients]);

  useEffect(() => {
    storage.set('pantry', pantryItems);
  }, [pantryItems]);

  useEffect(() => {
    storage.set('favorites', favorites);
  }, [favorites]);

  useEffect(() => {
    storage.set('plan', weeklyPlan);
  }, [weeklyPlan]);

  useEffect(() => {
    storage.set('shopping', shoppingItems);
  }, [shoppingItems]);

  useEffect(() => {
    storage.set('mealType', mealType);
  }, [mealType]);

  // Timer Tick Interval
  useEffect(() => {
    if (activeTimers.length === 0) return;

    const interval = setInterval(() => {
      setActiveTimers((prev) =>
        prev.map((t) => {
          if (!t.isRunning || t.remainingSeconds <= 0) return t;
          const nextRemaining = t.remainingSeconds - 1;
          if (nextRemaining === 0) {
            playTimerChime();
            showToast(`⏰ انتهى وقت طهي ${t.recipeName} (خطوة ${t.stepNumber})!`);
          }
          return {
            ...t,
            remainingSeconds: nextRemaining,
            isRunning: nextRemaining > 0,
          };
        })
      );
    }, 1000);

    return () => clearInterval(interval);
  }, [activeTimers.length, showToast]);

  // Ingredients Actions
  const handleAddIngredient = (item: string): boolean => {
    const trimmed = item.trim();
    if (!trimmed) return false;
    const norm = normalizeArabic(trimmed);
    if (ingredients.some((i) => normalizeArabic(i) === norm)) {
      showToast('المكون موجود بالفعل في قائمتك');
      return false;
    }
    setIngredients((prev) => [...prev, trimmed]);
    showToast(`تمت إضافة "${trimmed}" بنجاح`);
    return true;
  };

  const handleRemoveIngredient = (index: number) => {
    setIngredients((prev) => prev.filter((_, i) => i !== index));
  };

  const handleClearIngredients = () => {
    setIngredients([]);
    showToast('تم مسح جميع المكونات');
  };

  // Pantry Actions
  const handleAddPantryItem = (item: string): boolean => {
    const trimmed = item.trim();
    if (!trimmed) return false;
    const norm = normalizeArabic(trimmed);
    if (pantryItems.some((p) => normalizeArabic(p) === norm)) {
      showToast('المادة موجودة مسبقاً في المخزن');
      return false;
    }
    setPantryItems((prev) => [...prev, trimmed]);
    showToast(`أُضيفت "${trimmed}" إلى مخزن المنزل`);
    return true;
  };

  const handleRemovePantryItem = (index: number) => {
    setPantryItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleResetPantry = () => {
    setPantryItems([...DEFAULT_PANTRY]);
    showToast('تمت استعادة القائمة الافتراضية للمخزن');
  };

  const handleClearPantry = () => {
    if (window.confirm('هل أنت متأكد من مسح جميع مواد مخزن المنزل؟')) {
      setPantryItems([]);
      showToast('تم مسح مخزن المنزل');
    }
  };

  // Favorites Actions
  const handleToggleFavorite = (recipe: Recipe) => {
    const exists = favorites.some((f) => f.id === recipe.id);
    if (exists) {
      setFavorites((prev) => prev.filter((f) => f.id !== recipe.id));
      // Also clean up from weekly plan if removed
      setWeeklyPlan((prev) => {
        const next = { ...prev };
        Object.keys(next).forEach((day) => {
          Object.keys(next[day] || {}).forEach((m) => {
            if (next[day][m] === recipe.id) {
              delete next[day][m];
            }
          });
        });
        return next;
      });
      showToast('أُزيلت الوصفة من المفضلة');
    } else {
      setFavorites((prev) => [recipe, ...prev]);
      showToast('أُضيفت الوصفة إلى المفضلة ❤️');
    }
  };

  // Shopping List Actions
  const handleAddShoppingItem = (name: string): boolean => {
    const trimmed = name.trim();
    if (!trimmed) return false;
    const norm = normalizeArabic(trimmed);
    if (shoppingItems.some((i) => normalizeArabic(i.name) === norm)) {
      showToast('الغرض موجود مسبقاً في قائمة التسوق');
      return false;
    }
    const newItem: ShoppingItem = {
      id: 'shop_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      name: trimmed,
      done: false,
      addedAt: Date.now(),
    };
    setShoppingItems((prev) => [...prev, newItem]);
    showToast(`أُضيف "${trimmed}" إلى قائمة التسوق`);
    return true;
  };

  const handleAddMissingToShopping = (missingItems: string[]) => {
    let addedCount = 0;
    setShoppingItems((prev) => {
      const existingNorms = new Set(prev.map((i) => normalizeArabic(i.name)));
      const newEntries: ShoppingItem[] = [];

      missingItems.forEach((item) => {
        const norm = normalizeArabic(item);
        if (!existingNorms.has(norm)) {
          existingNorms.add(norm);
          newEntries.push({
            id: 'shop_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
            name: item,
            done: false,
            addedAt: Date.now(),
          });
          addedCount++;
        }
      });

      return [...prev, ...newEntries];
    });

    if (addedCount > 0) {
      showToast(`تمت إضافة ${addedCount} مكون ناقص إلى قائمة التسوق 🛒`);
    } else {
      showToast('جميع هذه المكونات موجودة بالفعل في قائمة التسوق');
    }
  };

  const handleToggleShoppingItem = (id: string) => {
    setShoppingItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, done: !item.done } : item))
    );
  };

  const handleDeleteShoppingItem = (id: string) => {
    setShoppingItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleClearBoughtShopping = () => {
    setShoppingItems((prev) => prev.filter((item) => !item.done));
    showToast('تم حذف الأغراض المشتراة');
  };

  const handleClearAllShopping = () => {
    if (window.confirm('هل أنت متأكد من مسح جميع عناصر قائمة التسوق؟')) {
      setShoppingItems([]);
      showToast('تم مسح قائمة التسوق بالكامل');
    }
  };

  // Weekly Planner Actions
  const handleUpdateMealPlan = (day: string, meal: string, recipeId: string) => {
    setWeeklyPlan((prev) => {
      const dayPlan = { ...(prev[day] || {}) };
      if (recipeId) {
        dayPlan[meal] = recipeId;
      } else {
        delete dayPlan[meal];
      }
      return {
        ...prev,
        [day]: dayPlan,
      };
    });
  };

  const handleClearPlan = () => {
    if (window.confirm('هل أنت متأكد من مسح جدول الأسبوع كاملاً؟')) {
      setWeeklyPlan({});
      showToast('تم مسح جدول الأسبوع');
    }
  };

  const handlePlanToShopping = () => {
    const plannedRecipeIds = new Set<string>();
    Object.values(weeklyPlan).forEach((dayMeals) => {
      Object.values(dayMeals || {}).forEach((recId) => {
        if (recId) plannedRecipeIds.add(recId);
      });
    });

    if (plannedRecipeIds.size === 0) {
      showToast('الجدول الأسبوعي فارغ حالياً');
      return;
    }

    const allMissing: string[] = [];
    plannedRecipeIds.forEach((id) => {
      const rec = favorites.find((f) => f.id === id);
      if (rec) {
        const missing = getMissingIngredients(rec.ingredients, ingredients, pantryItems, true);
        allMissing.push(...missing);
      }
    });

    handleAddMissingToShopping(allMissing);
  };

  // Timer Management
  const handleStartTimer = (recipeName: string, stepNumber: number, minutes: number) => {
    const timerId = `${recipeName}_${stepNumber}`;
    const existing = activeTimers.find((t) => t.id === timerId);

    if (existing) {
      // Toggle run/pause
      setActiveTimers((prev) =>
        prev.map((t) => (t.id === timerId ? { ...t, isRunning: !t.isRunning } : t))
      );
      showToast(existing.isRunning ? 'تم إيقاف المؤقت مؤقتاً' : 'تم استئناف المؤقت');
      return;
    }

    const newTimer: ActiveTimer = {
      id: timerId,
      recipeName,
      stepNumber,
      totalSeconds: minutes * 60,
      remainingSeconds: minutes * 60,
      isRunning: true,
    };

    setActiveTimers((prev) => [...prev, newTimer]);
    showToast(`بدأ مؤقت ${minutes} دقيقة لـ "${recipeName}"!`);
  };

  const handleToggleTimer = (id: string) => {
    setActiveTimers((prev) =>
      prev.map((t) => (t.id === id ? { ...t, isRunning: !t.isRunning } : t))
    );
  };

  const handleRemoveTimer = (id: string) => {
    setActiveTimers((prev) => prev.filter((t) => t.id !== id));
  };

  // Recipe AI Search via server route
  const handleSearchRecipes = async () => {
    if (ingredients.length === 0) {
      showToast('يرجى إضافة مكون واحد على الأقل للبحث');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/recipes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ingredients,
          pantry: includePantry ? pantryItems : [],
          mealType,
          cuisine,
          diet,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData?.error || 'تعذّر الاتصال بخادم الوصفات.');
      }

      const data = await res.json();
      if (!Array.isArray(data) || data.length === 0) {
        throw new Error('لم نحصل على وصفات ملائمة، يرجى المحاولة بمكونات أخرى.');
      }

      setResults(data);
      showToast('تم ابتكار 3 وصفات شهية وجاهزة لك!');

      // Smooth scroll down to results
      setTimeout(() => {
        const el = document.getElementById('recipes-results-section');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else {
          window.scrollTo({ top: 400, behavior: 'smooth' });
        }
      }, 150);
    } catch (err: any) {
      console.error('Failed to search recipes:', err);
      setError(err?.message || 'حدث خطأ أثناء ابتكار الوصفات، يرجى المحاولة مجدداً.');
    } finally {
      setIsLoading(false);
    }
  };

  // Maps for quick timer lookup on recipe cards
  const activeTimersMap: Record<string, number> = {};
  const remainingTimersMap: Record<string, string> = {};
  activeTimers.forEach((t) => {
    activeTimersMap[t.recipeName] = t.stepNumber;
    const mins = Math.floor(t.remainingSeconds / 60);
    const secs = t.remainingSeconds % 60;
    remainingTimersMap[t.recipeName] = `${String(mins).padStart(2, '0')}:${String(
      secs
    ).padStart(2, '0')}`;
  });

  const shoppingPendingCount = shoppingItems.filter((i) => !i.done).length;

  return (
    <div className="min-h-screen flex flex-col justify-between bg-amber-50/30">
      {/* Top Header */}
      <Header
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        pantryCount={pantryItems.length}
        favoritesCount={favorites.length}
        shoppingPendingCount={shoppingPendingCount}
      />

      {/* Main Tab Content */}
      <main className="max-w-6xl w-full mx-auto px-4 py-6 sm:py-8 flex-grow">
        {currentTab === 'ai' && (
          <AiSearchTab
            ingredients={ingredients}
            onAddIngredient={handleAddIngredient}
            onRemoveIngredient={handleRemoveIngredient}
            onClearIngredients={handleClearIngredients}
            includePantry={includePantry}
            onToggleIncludePantry={setIncludePantry}
            mealType={mealType}
            onChangeMealType={setMealType}
            cuisine={cuisine}
            onChangeCuisine={setCuisine}
            diet={diet}
            onChangeDiet={setDiet}
            pantryItems={pantryItems}
            results={results}
            isLoading={isLoading}
            error={error}
            onSearch={handleSearchRecipes}
            favorites={favorites}
            onToggleFavorite={handleToggleFavorite}
            onAddMissingToShopping={handleAddMissingToShopping}
            onStartTimer={handleStartTimer}
            activeTimersMap={activeTimersMap}
            remainingTimersMap={remainingTimersMap}
          />
        )}

        {currentTab === 'pantry' && (
          <PantryTab
            pantryItems={pantryItems}
            onAddPantryItem={handleAddPantryItem}
            onRemovePantryItem={handleRemovePantryItem}
            onResetPantry={handleResetPantry}
            onClearPantry={handleClearPantry}
          />
        )}

        {currentTab === 'planner' && (
          <PlannerTab
            plan={weeklyPlan}
            favorites={favorites}
            onUpdateMealPlan={handleUpdateMealPlan}
            onClearPlan={handleClearPlan}
            onPlanToShopping={handlePlanToShopping}
            onSwitchTab={setCurrentTab}
          />
        )}

        {currentTab === 'favorites' && (
          <FavoritesTab
            favorites={favorites}
            onToggleFavorite={handleToggleFavorite}
            userIngredients={ingredients}
            pantryItems={pantryItems}
            onAddMissingToShopping={handleAddMissingToShopping}
            onStartTimer={handleStartTimer}
            activeTimersMap={activeTimersMap}
            remainingTimersMap={remainingTimersMap}
            onSwitchTab={setCurrentTab}
          />
        )}

        {currentTab === 'shopping' && (
          <ShoppingTab
            items={shoppingItems}
            onAddItem={handleAddShoppingItem}
            onToggleItem={handleToggleShoppingItem}
            onDeleteItem={handleDeleteShoppingItem}
            onClearBought={handleClearBoughtShopping}
            onClearAll={handleClearAllShopping}
            onSwitchTab={setCurrentTab}
          />
        )}
      </main>

      {/* Floating Active Timers Bar */}
      <ActiveTimersBar
        timers={activeTimers}
        onToggleTimer={handleToggleTimer}
        onRemoveTimer={handleRemoveTimer}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div
          role="status"
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-stone-900 text-white text-xs sm:text-sm font-bold px-5 py-3 rounded-2xl shadow-2xl border border-stone-800 animate-in fade-in slide-in-from-bottom-3 duration-200"
        >
          {toastMessage}
        </div>
      )}

      {/* Footer */}
      <footer className="text-center text-xs text-stone-500 py-6 border-t border-stone-200/60 no-print">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            هناكل إيه؟ — مساعد الطهي الذكي باللغة العربية • حفظ تلقائي في المتصفح
          </span>
          <span className="text-stone-400">
            تأكد من ملاءمة المكونات ومدد الطهي حسب أجهزة مطبخك
          </span>
        </div>
      </footer>
    </div>
  );
}
