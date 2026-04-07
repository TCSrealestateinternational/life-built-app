import { useEffect, useRef } from 'react';
import Gantt from 'frappe-gantt';
import '../assets/frappe-gantt.css';

// frappe-gantt returns Date objects from on_date_change; normalize to 'YYYY-MM-DD'
function fmtDate(d) {
  if (!d) return new Date().toISOString().slice(0, 10);
  if (d instanceof Date) return d.toISOString().slice(0, 10);
  return String(d).slice(0, 10);
}

export default function GanttChart({ tasks, viewMode = 'Month', onDateChange, onProgressChange, onTaskClick }) {
  const containerRef = useRef(null);
  const ganttRef = useRef(null);

  // Keep callbacks in a ref so closures inside useEffect always have the latest version
  const cbRef = useRef({ onDateChange, onProgressChange, onTaskClick });
  useEffect(() => {
    cbRef.current = { onDateChange, onProgressChange, onTaskClick };
  });

  // Re-initialize the Gantt whenever tasks or viewMode change
  useEffect(() => {
    const el = containerRef.current;
    if (!el || !tasks.length) return;

    // Clear any previous instance
    el.innerHTML = '';

    const ganttTasks = tasks.map((t) => ({
      id: String(t.id),
      name: t.title || 'Untitled',
      start: t.start,
      end: t.end,
      progress: typeof t.progress === 'number' ? t.progress : (t.done ? 100 : 0),
      dependencies: t.dependencies || '',
    }));

    try {
      ganttRef.current = new Gantt(el, ganttTasks, {
        view_mode: viewMode,
        date_format: 'YYYY-MM-DD',
        on_click: (task) => cbRef.current.onTaskClick?.(task),
        on_date_change: (task, start, end) =>
          cbRef.current.onDateChange?.(task.id, fmtDate(start), fmtDate(end)),
        on_progress_change: (task, progress) =>
          cbRef.current.onProgressChange?.(task.id, Math.round(progress)),
        on_view_change: () => {},
      });
    } catch (e) {
      console.warn('Gantt init error:', e);
    }

    return () => {
      el.innerHTML = '';
      ganttRef.current = null;
    };
  }, [tasks, viewMode]);

  if (!tasks.length) return null;

  return (
    <div>
      <div className="overflow-x-auto rounded-[40px] shadow-xl border border-outline-variant/10">
        <div className="gantt-container p-8" ref={containerRef} />
      </div>
      {/* Legend */}
      <div className="flex items-center gap-6 mt-4 px-2 text-xs text-on-surface-variant">
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-primary inline-block" />
          Active Task
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-outline-variant inline-block" />
          Planned
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-primary-dim inline-block" />
          Milestone Hit
        </span>
      </div>
    </div>
  );
}
