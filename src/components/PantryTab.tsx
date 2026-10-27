import React, { useState, KeyboardEvent } from 'react';
import { PackageOpen, Plus, X, RotateCcw, Trash2, CheckCircle2 } from 'lucide-react';
import { DEFAULT_PANTRY, normalizeArabic } from '../utils/arabic';

interface PantryTabProps {
  pantryItems: string[];
  onAddPantryItem: (item: string) => boolean;
  onRemovePantryItem: (index: number) => void;
  onResetPantry: () => void;
  onClearPantry: () => void;
}

const COMMON_PANTRY_SUGGESTIONS = [
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
  'خل أبيض',
  'كمون',
  'شاي',
  'قهوة',
  'سمنة',
  'عدس',
];

export const PantryTab: React.FC<PantryTabProps> = ({
  pantryItems,
  onAddPantryItem,
  onRemovePantryItem,
  onResetPantry,
  onClearPantry,
}) => {
  const [inputValue, setInputValue] = useState('');

  const handleAdd = () => {
    const val = inputValue.trim();
    if (!val) return;
    onAddPantryItem(val);
    setInputValue('');
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.nativeEvent.isComposing) {
      e.preventDefault();
      handleAdd();
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-orange-100 shadow-md space-y-6">
        {/* Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100">
              <PackageOpen className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-stone-900">مخزن المنزل الدائم</h2>
              <p className="text-xs text-stone-500">
                المواد الأساسية المتوفرة دائماً في بيتك (الملح، البهارات، الزيت...). لا تظهر في
                قائمة النواقص.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onResetPantry}
              className="text-xs font-bold text-stone-600 hover:text-stone-900 bg-stone-100 hover:bg-stone-200 px-3 py-2 rounded-xl transition-all flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>استعادة الافتراضي</span>
            </button>
            <button
              onClick={onClearPantry}
              className="text-xs font-bold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 px-3 py-2 rounded-xl transition-all flex items-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>مسح الكل</span>
            </button>
          </div>
        </div>

        {/* Input box */}
        <div className="flex gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            maxLength={40}
            placeholder="أضف مادة دائمة (مثال: سمنة، هيل، ماجي، صويا صوص...)"
            className="flex-grow bg-stone-50/80 hover:bg-stone-50 focus:bg-white border border-stone-300 rounded-2xl px-4 py-3.5 text-sm font-semibold text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <button
            onClick={handleAdd}
            disabled={!inputValue.trim()}
            className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white px-6 py-3.5 rounded-2xl font-bold text-sm transition-all shadow-md shadow-emerald-600/20 flex items-center gap-1.5 shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة</span>
          </button>
        </div>

        {/* Suggestions */}
        <div>
          <div className="text-xs font-bold text-stone-500 mb-2">
            إضافات شائعة للمخزن المنزلي:
          </div>
          <div className="flex flex-wrap gap-1.5">
            {COMMON_PANTRY_SUGGESTIONS.map((item) => {
              const alreadyHas = pantryItems.some(
                (p) => normalizeArabic(p) === normalizeArabic(item)
              );
              return (
                <button
                  key={item}
                  onClick={() => onAddPantryItem(item)}
                  disabled={alreadyHas}
                  className={`text-xs px-2.5 py-1 rounded-xl font-semibold transition-all ${
                    alreadyHas
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 cursor-default'
                      : 'bg-stone-100 hover:bg-emerald-50 text-stone-700 hover:text-emerald-800 border border-stone-200'
                  }`}
                >
                  {alreadyHas ? `✓ ${item}` : `+ ${item}`}
                </button>
              );
            })}
          </div>
        </div>

        {/* Items List */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-black text-stone-800 flex items-center gap-2">
              <span>المواد المسجلة في مخزنك ({pantryItems.length})</span>
            </h3>
          </div>

          <div className="min-h-[90px] p-4 bg-stone-50 rounded-2xl border border-dashed border-stone-300 flex flex-wrap gap-2.5">
            {pantryItems.length > 0 ? (
              pantryItems.map((item, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-900 border border-emerald-200/90 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold shadow-2xs"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{item}</span>
                  <button
                    onClick={() => onRemovePantryItem(idx)}
                    className="hover:bg-emerald-100 rounded-lg p-0.5 transition-colors"
                    aria-label={`حذف ${item}`}
                  >
                    <X className="w-3.5 h-3.5 text-emerald-700" />
                  </button>
                </span>
              ))
            ) : (
              <span className="text-stone-400 text-xs sm:text-sm mx-auto my-auto py-4">
                مخزنك فارغ حالياً. اضغط على "استعادة الافتراضي" أو أضف موادك يدوياً أعلاه.
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
