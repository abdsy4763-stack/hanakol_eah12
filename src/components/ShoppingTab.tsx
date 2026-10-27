import React, { useState, KeyboardEvent } from 'react';
import {
  ShoppingCart,
  Plus,
  Trash2,
  CheckCheck,
  Copy,
  Check,
  Sparkles,
} from 'lucide-react';
import { ShoppingItem, TabType } from '../types';

interface ShoppingTabProps {
  items: ShoppingItem[];
  onAddItem: (name: string) => boolean;
  onToggleItem: (id: string) => void;
  onDeleteItem: (id: string) => void;
  onClearBought: () => void;
  onClearAll: () => void;
  onSwitchTab: (tab: TabType) => void;
}

export const ShoppingTab: React.FC<ShoppingTabProps> = ({
  items,
  onAddItem,
  onToggleItem,
  onDeleteItem,
  onClearBought,
  onClearAll,
  onSwitchTab,
}) => {
  const [inputValue, setInputValue] = useState('');
  const [copied, setCopied] = useState(false);

  const pendingItems = items.filter((i) => !i.done);
  const boughtItems = items.filter((i) => i.done);

  const handleAdd = () => {
    const val = inputValue.trim();
    if (!val) return;
    onAddItem(val);
    setInputValue('');
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.nativeEvent.isComposing) {
      e.preventDefault();
      handleAdd();
    }
  };

  const handleCopyList = async () => {
    if (items.length === 0) return;
    const text = `🛒 قائمة النواقص والمشتريات ("هناكل إيه؟"):\n\n${items
      .map((i) => `${i.done ? '✅ [تم الشراء]' : '⬜ [ناقص]'} ${i.name}`)
      .join('\n')}\n\nالإجمالي: ${items.length} غرض (المتبقي: ${pendingItems.length})`;

    if (navigator.clipboard) {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-orange-100 shadow-md space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-orange-50 text-orange-600 border border-orange-100">
              <ShoppingCart className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-stone-900">قائمة الناقص والتسوق</h2>
              <p className="text-xs text-stone-500">
                {pendingItems.length} أغراض باقية للشراء • {boughtItems.length} تم شراؤها
              </p>
            </div>
          </div>

          {items.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 no-print">
              <button
                onClick={handleCopyList}
                className="text-xs font-bold text-orange-700 bg-orange-50 hover:bg-orange-100 border border-orange-200 px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>تم النسخ!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>نسخ القائمة</span>
                  </>
                )}
              </button>

              {boughtItems.length > 0 && (
                <button
                  onClick={onClearBought}
                  className="text-xs font-bold text-stone-600 bg-stone-100 hover:bg-stone-200 px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  <span>حذف المشتراة</span>
                </button>
              )}

              <button
                onClick={onClearAll}
                className="text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>مسح الكل</span>
              </button>
            </div>
          )}
        </div>

        {/* Add Input */}
        <div className="flex gap-2 no-print">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            maxLength={60}
            placeholder="أضف غرضاً يدوياً (مثال: جبنة حلوم، خبز صامولي، قشطة...)"
            className="flex-grow bg-stone-50/80 hover:bg-stone-50 focus:bg-white border border-stone-300 rounded-2xl px-4 py-3.5 text-sm font-semibold text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
          <button
            onClick={handleAdd}
            disabled={!inputValue.trim()}
            className="bg-orange-600 hover:bg-orange-700 disabled:opacity-40 text-white px-6 py-3.5 rounded-2xl font-bold text-sm transition-all shadow-md shadow-orange-600/20 flex items-center gap-1.5 shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة</span>
          </button>
        </div>

        {/* List of items */}
        {items.length === 0 ? (
          <div className="p-10 text-center rounded-2xl border border-dashed border-stone-200 bg-stone-50/50 space-y-3">
            <div className="w-14 h-14 rounded-3xl bg-orange-50 text-orange-400 flex items-center justify-center mx-auto">
              <ShoppingCart className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-stone-800">قائمة التسوق فارغة 🎉</h3>
              <p className="text-xs text-stone-500 max-w-sm mx-auto">
                يمكنك إضافة أغراض يدوياً أعلاه، أو الضغط على "أضف النواقص" في أي وصفة أو من خطة
                الأسبوع!
              </p>
            </div>
            <button
              onClick={() => onSwitchTab('ai')}
              className="inline-flex items-center gap-1.5 text-xs font-black text-orange-600 hover:text-orange-700 hover:underline pt-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>تصفح واقتراح وصفات لإضافة نواقصها</span>
            </button>
          </div>
        ) : (
          <ul className="space-y-2">
            {items.map((item) => (
              <li
                key={item.id}
                className={`flex items-center justify-between gap-3 p-3 sm:p-3.5 rounded-2xl border transition-all ${
                  item.done
                    ? 'bg-stone-50/60 border-stone-200 text-stone-400'
                    : 'bg-white border-stone-200/90 text-stone-800 shadow-2xs hover:border-orange-200'
                }`}
              >
                <label className="flex items-center gap-3 flex-grow cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={item.done}
                    onChange={() => onToggleItem(item.id)}
                    className="w-5 h-5 rounded-lg accent-orange-600 cursor-pointer shrink-0"
                  />
                  <span
                    className={`text-xs sm:text-sm font-bold ${
                      item.done ? 'line-through text-stone-400' : 'text-stone-800'
                    }`}
                  >
                    {item.name}
                  </span>
                </label>

                <button
                  onClick={() => onDeleteItem(item.id)}
                  className="no-print text-stone-400 hover:text-red-600 p-1 rounded-lg hover:bg-red-50 transition-colors"
                  aria-label={`حذف ${item.name}`}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};
