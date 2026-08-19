import React, { useState } from 'react';
import {
  Calendar as CalendarIcon,
  Clock,
  Plus,
  CheckCircle2,
  Circle,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Filter,
  User,
  MapPin,
  Trash2,
  Sparkles,
  PhoneCall,
  Mail,
  TrendingUp,
  Code2,
  CalendarDays,
  ListTodo,
  Bell,
  Check,
} from 'lucide-react';
import { CalendarTask } from '../types';

interface CalendarSchedulerProps {
  tasks: CalendarTask[];
  onAddTask: (task: CalendarTask) => void;
  onUpdateTask: (task: CalendarTask) => void;
  onDeleteTask: (taskId: string) => void;
  onTriggerAutomation?: (event: string, details: string) => void;
}

export const CalendarScheduler: React.FC<CalendarSchedulerProps> = ({
  tasks,
  onAddTask,
  onUpdateTask,
  onDeleteTask,
  onTriggerAutomation,
}) => {
  const [selectedDate, setSelectedDate] = useState<string>('2026-08-20');
  const [viewMode, setViewMode] = useState<'agenda' | 'month' | 'day'>('agenda');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);

  // Form State for new task
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newDate, setNewDate] = useState('2026-08-20');
  const [newTime, setNewTime] = useState('10:00');
  const [newDuration, setNewDuration] = useState(60);
  const [newCategory, setNewCategory] = useState<CalendarTask['category']>('shop_service');
  const [newPriority, setNewPriority] = useState<CalendarTask['priority']>('normal');
  const [newAttendee, setNewAttendee] = useState('');
  const [newLocation, setNewLocation] = useState('Workshop Bay 1');

  // Filter tasks
  const filteredTasks = tasks.filter((t) => {
    if (filterCategory !== 'all' && t.category !== filterCategory) return false;
    if (viewMode === 'day' && t.date !== selectedDate) return false;
    return true;
  });

  const handleToggleComplete = (task: CalendarTask) => {
    const updated = { ...task, completed: !task.completed };
    onUpdateTask(updated);
    if (!task.completed && onTriggerAutomation) {
      onTriggerAutomation(
        'calendar_task_completed',
        `Completed schedule item: "${task.title}" (${task.category.replace('_', ' ')})`
      );
    }
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const createdTask: CalendarTask = {
      id: `task-${Date.now().toString().slice(-4)}`,
      title: newTitle,
      description: newDesc,
      date: newDate,
      time: newTime,
      durationMinutes: Number(newDuration) || 60,
      category: newCategory,
      priority: newPriority,
      completed: false,
      sourceModule: 'manual',
      attendeeOrCustomer: newAttendee,
      location: newLocation,
    };

    onAddTask(createdTask);
    setShowAddModal(false);
    setNewTitle('');
    setNewDesc('');
    setNewAttendee('');

    if (onTriggerAutomation) {
      onTriggerAutomation(
        'calendar_event_scheduled',
        `Scheduled new event: "${createdTask.title}" on ${createdTask.date} at ${createdTask.time}`
      );
    }
  };

  const getCategoryBadge = (cat: CalendarTask['category']) => {
    switch (cat) {
      case 'shop_service':
        return {
          label: 'Shop Service',
          icon: PhoneCall,
          className: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
        };
      case 'meeting':
        return {
          label: 'Meeting',
          icon: User,
          className: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
        };
      case 'portfolio_review':
        return {
          label: 'Portfolio Audit',
          icon: TrendingUp,
          className: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
        };
      case 'builder_sprint':
        return {
          label: 'Builder Sprint',
          icon: Code2,
          className: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
        };
      default:
        return {
          label: 'General Task',
          icon: ListTodo,
          className: 'bg-slate-500/10 text-slate-300 border-slate-700',
        };
    }
  };

  const getPriorityBadge = (pri: CalendarTask['priority']) => {
    switch (pri) {
      case 'urgent':
        return 'text-rose-400 bg-rose-500/10 border-rose-500/30 font-bold';
      case 'high':
        return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
      case 'normal':
        return 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30';
      default:
        return 'text-slate-400 bg-slate-800 border-slate-700';
    }
  };

  // Month days generator for August 2026
  const augustDays = Array.from({ length: 31 }, (_, i) => {
    const dayNum = i + 1;
    const dateStr = `2026-08-${dayNum < 10 ? '0' + dayNum : dayNum}`;
    const dayTasks = tasks.filter((t) => t.date === dateStr);
    return { dayNum, dateStr, dayTasks };
  });

  return (
    <div className="space-y-6">
      {/* Subheader / Action Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/50 backdrop-blur-md border border-slate-800 p-5 rounded-2xl shadow-md">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shadow-[0_0_10px_rgba(6,182,212,0.2)]">
            <CalendarIcon className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white uppercase tracking-tight">Calendar &amp; Autonomous Task Scheduler</h2>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 uppercase tracking-wider">
                <Clock className="w-3 h-3" />
                Live Dispatch
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Coordinated timeline for shop repair bookings, executive meetings, portfolio audits, and voice-dispatched appointments
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 self-start md:self-auto">
          <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setViewMode('agenda')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-colors ${
                viewMode === 'agenda' ? 'bg-cyan-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              Agenda
            </button>
            <button
              onClick={() => setViewMode('month')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-colors ${
                viewMode === 'month' ? 'bg-cyan-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              Month Grid
            </button>
            <button
              onClick={() => setViewMode('day')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-colors ${
                viewMode === 'day' ? 'bg-cyan-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              Day Timeline
            </button>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-[0_0_12px_rgba(6,182,212,0.3)] font-mono"
          >
            <Plus className="w-4 h-4" />
            Add Event / Task
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800 rounded-2xl p-4">
          <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block">Total Scheduled</span>
          <div className="text-xl font-mono font-black text-white mt-1">{tasks.length} Items</div>
        </div>
        <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800 rounded-2xl p-4">
          <span className="text-[11px] font-mono text-cyan-400 uppercase tracking-wider block">Pending Tasks</span>
          <div className="text-xl font-mono font-black text-cyan-400 mt-1">
            {tasks.filter((t) => !t.completed).length} Remaining
          </div>
        </div>
        <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800 rounded-2xl p-4">
          <span className="text-[11px] font-mono text-emerald-400 uppercase tracking-wider block">Shop Bookings</span>
          <div className="text-xl font-mono font-black text-emerald-400 mt-1">
            {tasks.filter((t) => t.category === 'shop_service').length} Booked
          </div>
        </div>
        <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800 rounded-2xl p-4">
          <span className="text-[11px] font-mono text-purple-400 uppercase tracking-wider block">Voice / Auto-Synced</span>
          <div className="text-xl font-mono font-black text-purple-400 mt-1">
            {tasks.filter((t) => t.sourceModule && t.sourceModule !== 'manual').length} Synced
          </div>
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-mono text-slate-400 flex items-center gap-1 mr-2">
          <Filter className="w-3.5 h-3.5 text-cyan-400" /> Filter:
        </span>
        {[
          { id: 'all', label: 'All Categories' },
          { id: 'shop_service', label: 'Shop Services' },
          { id: 'meeting', label: 'Meetings' },
          { id: 'portfolio_review', label: 'Portfolio Reviews' },
          { id: 'builder_sprint', label: 'Builder Sprints' },
          { id: 'general', label: 'General' },
        ].map((c) => (
          <button
            key={c.id}
            onClick={() => setFilterCategory(c.id)}
            className={`px-3 py-1 rounded-xl text-xs font-mono transition-all border ${
              filterCategory === c.id
                ? 'bg-cyan-500/10 border-cyan-500 text-cyan-400 font-bold shadow-[0_0_8px_rgba(6,182,212,0.2)]'
                : 'bg-slate-900/40 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Main View Area */}
      {viewMode === 'agenda' && (
        <div className="space-y-4">
          {filteredTasks.length === 0 ? (
            <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-12 text-center">
              <CalendarIcon className="w-10 h-10 text-slate-600 mx-auto mb-3" />
              <h3 className="text-sm font-bold text-slate-300 font-mono">No tasks matching selected filter</h3>
              <p className="text-xs text-slate-500 mt-1">Use the "Add Event" button or speak a voice command to schedule items.</p>
            </div>
          ) : (
            filteredTasks.map((task) => {
              const catBadge = getCategoryBadge(task.category);
              const CatIcon = catBadge.icon;
              return (
                <div
                  key={task.id}
                  className={`bg-slate-900/50 backdrop-blur-md border rounded-2xl p-5 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                    task.completed
                      ? 'border-slate-800/60 opacity-60 bg-slate-950/40'
                      : 'border-slate-800 hover:border-slate-700 hover:bg-slate-900/80 shadow-md'
                  }`}
                >
                  <div className="flex items-start gap-4 flex-1">
                    <button
                      onClick={() => handleToggleComplete(task)}
                      className={`mt-1 p-1 rounded-lg transition-colors ${
                        task.completed ? 'text-emerald-400 bg-emerald-500/10' : 'text-slate-500 hover:text-cyan-400'
                      }`}
                    >
                      {task.completed ? <CheckCircle2 className="w-5 h-5" /> : <Circle className="w-5 h-5" />}
                    </button>

                    <div className="space-y-1.5 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono border ${catBadge.className}`}
                        >
                          <CatIcon className="w-3 h-3" />
                          {catBadge.label}
                        </span>

                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono uppercase border ${getPriorityBadge(
                            task.priority
                          )}`}
                        >
                          {task.priority}
                        </span>

                        {task.sourceModule && task.sourceModule !== 'manual' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono bg-purple-500/10 text-purple-400 border border-purple-500/30">
                            <Sparkles className="w-2.5 h-2.5" />
                            Auto-Synced from {task.sourceModule.replace('_', ' ')}
                          </span>
                        )}
                      </div>

                      <h3
                        className={`text-sm font-bold font-mono text-white ${
                          task.completed ? 'line-through text-slate-500' : ''
                        }`}
                      >
                        {task.title}
                      </h3>

                      {task.description && (
                        <p className="text-xs text-slate-400 leading-relaxed">{task.description}</p>
                      )}

                      <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-slate-400 pt-1">
                        <span className="flex items-center gap-1 text-cyan-400">
                          <Clock className="w-3.5 h-3.5" />
                          {task.date} @ {task.time || 'All Day'} ({task.durationMinutes} min)
                        </span>

                        {task.attendeeOrCustomer && (
                          <span className="flex items-center gap-1 text-slate-300">
                            <User className="w-3.5 h-3.5 text-slate-500" />
                            {task.attendeeOrCustomer}
                          </span>
                        )}

                        {task.location && (
                          <span className="flex items-center gap-1 text-slate-400">
                            <MapPin className="w-3.5 h-3.5 text-slate-500" />
                            {task.location}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end md:self-auto border-t md:border-t-0 border-slate-800 pt-3 md:pt-0">
                    <button
                      onClick={() => handleToggleComplete(task)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-mono font-semibold transition-colors flex items-center gap-1.5 ${
                        task.completed
                          ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                          : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20'
                      }`}
                    >
                      <Check className="w-3.5 h-3.5" />
                      {task.completed ? 'Reopen' : 'Complete'}
                    </button>

                    <button
                      onClick={() => onDeleteTask(task.id)}
                      className="p-2 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                      title="Delete task"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {viewMode === 'month' && (
        <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">August 2026 Schedule</h3>
            <span className="text-xs font-mono text-cyan-400">Austin HQ / Automated Dispatch</span>
          </div>

          <div className="grid grid-cols-7 gap-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
              <div key={d} className="text-center text-[11px] font-mono font-bold text-slate-500 uppercase py-1">
                {d}
              </div>
            ))}

            {/* Empty slots for August 2026 (Aug 1 is Saturday -> 6 empty days) */}
            {Array.from({ length: 6 }).map((_, idx) => (
              <div key={`empty-${idx}`} className="h-24 bg-slate-950/20 border border-slate-900 rounded-xl p-2 opacity-30" />
            ))}

            {augustDays.map(({ dayNum, dateStr, dayTasks }) => {
              const isSelected = selectedDate === dateStr;
              return (
                <div
                  key={dateStr}
                  onClick={() => {
                    setSelectedDate(dateStr);
                    setViewMode('day');
                  }}
                  className={`min-h-24 bg-slate-950/60 border rounded-xl p-2 cursor-pointer transition-all flex flex-col justify-between ${
                    isSelected
                      ? 'border-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.2)] bg-cyan-950/20'
                      : dayTasks.length > 0
                      ? 'border-slate-800 hover:border-slate-700'
                      : 'border-slate-900 hover:border-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-mono font-bold ${isSelected ? 'text-cyan-400' : 'text-slate-300'}`}>
                      {dayNum}
                    </span>
                    {dayTasks.length > 0 && (
                      <span className="text-[10px] font-mono px-1.5 py-0.2 bg-cyan-500/20 text-cyan-300 rounded-full">
                        {dayTasks.length}
                      </span>
                    )}
                  </div>

                  <div className="space-y-1 mt-1 overflow-hidden">
                    {dayTasks.slice(0, 2).map((t) => (
                      <div
                        key={t.id}
                        className={`text-[10px] font-mono truncate px-1.5 py-0.5 rounded ${
                          t.category === 'shop_service'
                            ? 'bg-cyan-500/20 text-cyan-300'
                            : t.category === 'meeting'
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : 'bg-purple-500/20 text-purple-300'
                        }`}
                      >
                        {t.time} {t.title}
                      </div>
                    ))}
                    {dayTasks.length > 2 && (
                      <div className="text-[9px] font-mono text-slate-500 text-right">+{dayTasks.length - 2} more</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {viewMode === 'day' && (
        <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800 rounded-2xl p-6 space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-slate-950 border border-slate-700 text-white rounded-xl px-3 py-1.5 text-xs font-mono focus:border-cyan-500 focus:outline-none"
              />
              <span className="text-xs font-mono text-cyan-400">Day View &amp; Hourly Timeline</span>
            </div>
            <button
              onClick={() => setViewMode('agenda')}
              className="text-xs font-mono text-slate-400 hover:text-white"
            >
              Back to Agenda
            </button>
          </div>

          <div className="space-y-3">
            {filteredTasks.length === 0 ? (
              <div className="p-8 text-center text-xs font-mono text-slate-500">
                No events scheduled for {selectedDate}. Click "Add Event" to create one.
              </div>
            ) : (
              filteredTasks.map((t) => (
                <div
                  key={t.id}
                  className="p-4 bg-slate-950 rounded-xl border border-slate-800 flex items-start justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-cyan-400">{t.time || 'All-Day'}</span>
                      <span className="text-xs font-mono font-bold text-white">{t.title}</span>
                    </div>
                    {t.description && <p className="text-xs text-slate-400">{t.description}</p>}
                    <div className="flex items-center gap-3 text-[11px] font-mono text-slate-500 pt-1">
                      {t.attendeeOrCustomer && <span>Client: {t.attendeeOrCustomer}</span>}
                      {t.location && <span>Location: {t.location}</span>}
                    </div>
                  </div>
                  <button
                    onClick={() => handleToggleComplete(t)}
                    className={`px-2.5 py-1 text-xs font-mono rounded-lg border ${
                      t.completed
                        ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                        : 'border-slate-700 text-slate-400 hover:border-cyan-500'
                    }`}
                  >
                    {t.completed ? 'Done' : 'Mark Done'}
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Add Task / Event Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
                <CalendarIcon className="w-4 h-4 text-cyan-400" />
                Schedule Calendar Event / Task
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white font-mono text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-3.5 text-xs font-mono">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Title / Task Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Brake Pad Replacement or Macro Strategy Call"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Description / Notes</label>
                <textarea
                  rows={2}
                  placeholder="Specific details, service checklists, or meeting objectives..."
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Time</label>
                  <input
                    type="time"
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Duration (Min)</label>
                  <input
                    type="number"
                    min={15}
                    step={15}
                    value={newDuration}
                    onChange={(e) => setNewDuration(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-2 py-2 text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value="shop_service">Shop Service</option>
                    <option value="meeting">Meeting</option>
                    <option value="portfolio_review">Portfolio Review</option>
                    <option value="builder_sprint">Builder Sprint</option>
                    <option value="general">General</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Priority</label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-2 py-2 text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value="urgent">Urgent</option>
                    <option value="high">High</option>
                    <option value="normal">Normal</option>
                    <option value="low">Low</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Client / Attendee</label>
                  <input
                    type="text"
                    placeholder="e.g. Marcus Vance"
                    value={newAttendee}
                    onChange={(e) => setNewAttendee(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Location / Bay</label>
                  <input
                    type="text"
                    placeholder="e.g. Bay 2 Dyno"
                    value={newLocation}
                    onChange={(e) => setNewLocation(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl shadow-[0_0_12px_rgba(6,182,212,0.3)]"
                >
                  Confirm &amp; Dispatch Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
