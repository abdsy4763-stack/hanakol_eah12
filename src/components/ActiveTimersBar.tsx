import React from 'react';
import { Timer as TimerIcon, Play, Pause, X, Bell } from 'lucide-react';
import { ActiveTimer } from '../types';

interface ActiveTimersBarProps {
  timers: ActiveTimer[];
  onToggleTimer: (id: string) => void;
  onRemoveTimer: (id: string) => void;
}

export const ActiveTimersBar: React.FC<ActiveTimersBarProps> = ({
  timers,
  onToggleTimer,
  onRemoveTimer,
}) => {
  if (timers.length === 0) return null;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  return (
    <aside
      aria-label="مؤقتات الطبخ الجارية"
      className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:w-96 z-50 space-y-2 pointer-events-auto no-print"
    >
      {timers.map((timer) => {
        const isDone = timer.remainingSeconds <= 0;

        return (
          <div
            key={timer.id}
            className={`p-3.5 rounded-2xl shadow-xl border flex items-center justify-between gap-3 backdrop-blur-md transition-all ${
              isDone
                ? 'bg-red-600 text-white border-red-700 animate-bounce'
                : 'bg-stone-900/95 text-white border-stone-800'
            }`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div
                className={`p-2 rounded-xl shrink-0 ${
                  isDone ? 'bg-white text-red-600' : 'bg-orange-500/20 text-orange-400'
                }`}
              >
                {isDone ? <Bell className="w-4 h-4 animate-spin" /> : <TimerIcon className="w-4 h-4" />}
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold truncate">
                  {timer.recipeName} (خطوة {timer.stepNumber})
                </div>
                <div className="text-lg font-black tracking-widest font-mono">
                  {isDone ? '⏰ انتهى الوقت!' : formatTime(timer.remainingSeconds)}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              {!isDone && (
                <button
                  onClick={() => onToggleTimer(timer.id)}
                  className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
                  title={timer.isRunning ? 'إيقاف مؤقت' : 'استئناف'}
                >
                  {timer.isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </button>
              )}
              <button
                onClick={() => onRemoveTimer(timer.id)}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
                title="إغلاق المؤقت"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        );
      })}
    </aside>
  );
};
