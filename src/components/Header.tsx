import React from 'react';
import {
  Sparkles,
  PackageOpen,
  CalendarDays,
  Heart,
  ShoppingCart,
  ChefHat,
} from 'lucide-react';
import { TabType } from '../types';

interface HeaderProps {
  currentTab: TabType;
  onSelectTab: (tab: TabType) => void;
  pantryCount: number;
  favoritesCount: number;
  shoppingPendingCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onSelectTab,
  pantryCount,
  favoritesCount,
  shoppingPendingCount,
}) => {
  const tabs = [
    {
      id: 'ai' as TabType,
      label: 'بحث الذكاء الاصطناعي',
      shortLabel: 'اقتراح وصفات',
      icon: Sparkles,
      badge: null,
    },
    {
      id: 'pantry' as TabType,
      label: 'مخزن المنزل',
      shortLabel: 'المخزن',
      icon: PackageOpen,
      badge: pantryCount > 0 ? pantryCount : null,
    },
    {
      id: 'planner' as TabType,
      label: 'خطة الأسبوع',
      shortLabel: 'الخطة',
      icon: CalendarDays,
      badge: null,
    },
    {
      id: 'favorites' as TabType,
      label: 'وصفاتي المفضلة',
      shortLabel: 'المفضلة',
      icon: Heart,
      badge: favoritesCount > 0 ? favoritesCount : null,
    },
    {
      id: 'shopping' as TabType,
      label: 'قائمة الناقص',
      shortLabel: 'التسوق',
      icon: ShoppingCart,
      badge: shoppingPendingCount > 0 ? shoppingPendingCount : null,
      highlightBadge: true,
    },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-orange-100 shadow-xs">
      <div className="max-w-6xl mx-auto px-4 py-3">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          {/* Brand Logo & Title */}
          <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-orange-600 to-amber-500 flex items-center justify-center text-white shadow-md shadow-orange-500/20">
                <ChefHat className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-extrabold text-stone-900 tracking-tight flex items-center gap-1.5">
                  هناكل إيه؟
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-orange-100 text-orange-700">
                    مساعد الطهي
                  </span>
                </h1>
                <p className="text-xs text-stone-500 hidden sm:block">
                  حوّل المكونات المتوفرة لديك إلى أشهى الوصفات المنزلية
                </p>
              </div>
            </div>

            {/* Mobile quick pending count */}
            <div className="flex md:hidden items-center gap-2 text-xs font-medium text-stone-600">
              {shoppingPendingCount > 0 && (
                <button
                  onClick={() => onSelectTab('shopping')}
                  className="flex items-center gap-1 bg-red-50 text-red-700 px-2.5 py-1 rounded-xl border border-red-200"
                >
                  <ShoppingCart className="w-3.5 h-3.5" />
                  <span>{shoppingPendingCount} ناقص</span>
                </button>
              )}
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav
            aria-label="أقسام التطبيق الرئيسية"
            className="w-full md:w-auto flex items-center gap-1.5 p-1 bg-stone-100/80 rounded-2xl overflow-x-auto scrollbar-none"
          >
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = currentTab === tab.id;

              return (
                <button
                  key={tab.id}
                  onClick={() => onSelectTab(tab.id)}
                  className={`relative flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap shrink-0 ${
                    isActive
                      ? 'bg-orange-600 text-white shadow-sm shadow-orange-600/30'
                      : 'text-stone-600 hover:text-orange-600 hover:bg-stone-200/50'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-stone-500'}`} />
                  <span className="hidden sm:inline">{tab.label}</span>
                  <span className="sm:hidden">{tab.shortLabel}</span>

                  {tab.badge !== null && (
                    <span
                      className={`inline-flex items-center justify-center min-w-5 h-5 px-1.5 text-[11px] font-black rounded-full transition-colors ${
                        isActive
                          ? 'bg-white text-orange-700'
                          : tab.highlightBadge
                          ? 'bg-red-500 text-white'
                          : 'bg-stone-300 text-stone-700'
                      }`}
                    >
                      {tab.badge > 99 ? '99+' : tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
};
