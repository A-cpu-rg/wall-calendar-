"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  addMonths,
  subMonths,
  isSameDay,
  isSameMonth,
  isWeekend,
  startOfWeek,
  endOfWeek,
  differenceInDays,
} from "date-fns";
import {
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon,
  X,
  Clock,
  CalendarDays,
  CalendarSearch,
  Tag,
  Copy,
  Check,
  Keyboard,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
// Offline, highly reliable holiday calculation engine
// @ts-ignore
import Holidays from "date-holidays";

// ─────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────

const DAYS_OF_WEEK = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const MONTH_THEMES = [
  { image: "https://images.unsplash.com/photo-1483921020237-2ff51e8e4b22?w=900&q=80", accent: "#1565c0", label: "Winter" },
  { image: "https://images.unsplash.com/photo-1518895949257-7621c3c786d7?w=900&q=80", accent: "#ad1457", label: "Cherry Blossom" },
  { image: "https://images.unsplash.com/photo-1426604966848-d7adac402bff?w=900&q=80", accent: "#2e7d32", label: "Spring" },
  { image: "https://images.unsplash.com/photo-1465189684280-6a8fa9b19a7a?w=900&q=80", accent: "#e65100", label: "Golden Bloom" },
  { image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=900&q=80", accent: "#00695c", label: "Summer Vista" },
  { image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=900&q=80", accent: "#0277bd", label: "Ocean Horizon" },
  { image: "https://images.unsplash.com/photo-1501854140801-50d01698950b?w=900&q=80", accent: "#b71c1c", label: "Crimson Sunset" },
  { image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=900&q=80", accent: "#bf360c", label: "Late Summer" },
  { image: "https://images.unsplash.com/photo-1477414348463-c0eb7f1359b6?w=900&q=80", accent: "#4e342e", label: "Autumn Forest" },
  { image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=900&q=80", accent: "#e65100", label: "Fall Colors" },
  { image: "https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=900&q=80", accent: "#37474f", label: "Misty November" },
  { image: "https://images.unsplash.com/photo-1418985991508-e47386d96a71?w=900&q=80", accent: "#283593", label: "Winter Frost" },
];

const STATIC_HOLIDAYS_FALLBACK: Record<string, string> = {
  "01-26": "Republic Day 🇮🇳",
  "03-25": "Holi 🎨",
  "04-14": "Ambedkar Jayanti",
  "08-15": "Independence Day 🇮🇳",
  "10-02": "Gandhi Jayanti",
  "11-01": "Diwali 🪔",
  "12-25": "Christmas 🎄",
};

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

type NoteTag = "Work" | "Personal" | "Urgent";

const TAG_STYLES: Record<NoteTag, string> = {
  Work: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400 border border-blue-200 dark:border-blue-800",
  Personal: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800",
  Urgent: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400 border border-red-200 dark:border-red-800",
};

interface Note {
  start: string;
  end: string;
  text: string;
  tag: NoteTag;
}

// ─────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────

function SpiralBinding({ accent }: { accent: string }) {
  return (
    <div className="flex justify-center gap-1.5 md:gap-2.5 pt-1.5 px-4 md:px-6 pb-0 overflow-hidden select-none">
      {Array.from({ length: 22 }).map((_, i) => (
        <div
          key={i}
          className="w-2.5 md:w-3.5 h-[16px] md:h-[22px] opacity-75 drop-shadow-sm"
          style={{
            borderRadius: "50% 50% 40% 40%",
            borderTop: `2.5px solid ${accent}`,
            borderLeft: `2.5px solid ${accent}`,
            borderRight: `2.5px solid ${accent}`,
          }}
        />
      ))}
    </div>
  );
}

function HeroPanel({ monthDate, accent, label }: { monthDate: Date; accent: string; label: string }) {
  const { image } = MONTH_THEMES[monthDate.getMonth()];
  return (
    <div className="relative w-full h-full min-h-[220px] md:min-h-[500px] overflow-hidden bg-zinc-900 group">
      <motion.img
        initial={{ scale: 1.08 }}
        animate={{ scale: 1.02 }}
        transition={{ duration: 10, ease: "linear", repeat: Infinity, repeatType: "reverse" }}
        src={image}
        alt={`${label} scenery`}
        className="block w-full h-full object-cover"
        loading="eager"
      />
      <div
        className="absolute inset-0 transition-opacity duration-700"
        style={{ background: `linear-gradient(to bottom, transparent 30%, ${accent}e6 100%)` }}
      />
      <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-500" />
      <div className="absolute bottom-4 left-4 md:bottom-6 md:left-6 text-white font-serif tracking-wide select-none drop-shadow-lg">
        <p className="m-0 text-[10px] md:text-xs tracking-[5px] uppercase opacity-90 font-sans font-medium">{label}</p>
        <p className="m-0 mt-1 md:mt-2 text-4xl md:text-5xl font-bold leading-none">{format(monthDate, "MMMM")}</p>
        <p className="m-0 mt-1 text-base md:text-lg font-normal opacity-85 font-sans">{format(monthDate, "yyyy")}</p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Toast notification
// ─────────────────────────────────────────────

function Toast({ message, visible }: { message: string; visible: boolean }) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 8 }}
          className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-5 py-3 rounded-full bg-zinc-900 text-white text-sm font-semibold shadow-2xl"
        >
          <Check size={15} className="text-emerald-400" />
          {message}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─────────────────────────────────────────────
// Keyboard shortcut hint panel
// ─────────────────────────────────────────────

function ShortcutHints({ dark }: { dark: boolean }) {
  const [open, setOpen] = useState(false);
  const hints = [
    { key: "←  →", desc: "Previous / next month" },
    { key: "T", desc: "Jump to today" },
    { key: "Esc", desc: "Clear selection" },
  ];
  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        title="Keyboard shortcuts"
        className={`flex items-center gap-1.5 px-3 py-1.5 text-[11px] rounded-lg border transition-all active:scale-95 ${dark ? "border-zinc-700 bg-zinc-800 sm:hover:bg-zinc-700 text-zinc-400" : "border-zinc-200 bg-white sm:hover:bg-zinc-50 text-zinc-500"
          }`}
      >
        <Keyboard size={12} /> <span className="hidden sm:inline">Shortcuts</span>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -4 }}
            className={`absolute left-0 sm:left-auto sm:right-0 top-9 z-20 w-52 rounded-xl border p-3 shadow-xl text-xs ${dark ? "bg-zinc-800 border-zinc-700 text-zinc-300" : "bg-white border-zinc-200 text-zinc-700"
              }`}
          >
            {hints.map(({ key, desc }) => (
              <div key={key} className="flex justify-between py-1.5 border-b last:border-0 border-zinc-100 dark:border-zinc-700">
                <kbd className={`font-mono font-bold px-1.5 py-0.5 rounded text-[10px] ${dark ? "bg-zinc-700" : "bg-zinc-100"}`}>{key}</kbd>
                <span className="opacity-75">{desc}</span>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─────────────────────────────────────────────
// Monthly tag analytics bar
// ─────────────────────────────────────────────

function TagAnalytics({ notes, currentMonth, dark }: { notes: Note[]; currentMonth: Date; dark: boolean }) {
  const stats = useMemo(() => {
    const monthStr = format(currentMonth, "yyyy-MM");
    const monthNotes = notes.filter((n) => n.start.startsWith(monthStr) || n.end.startsWith(monthStr));
    const counts: Record<NoteTag, number> = { Work: 0, Personal: 0, Urgent: 0 };
    monthNotes.forEach((n) => counts[n.tag]++);
    return counts;
  }, [notes, currentMonth]);

  const total = stats.Work + stats.Personal + stats.Urgent;
  if (total === 0) return null;

  return (
    <div className={`flex flex-wrap gap-2 items-center text-[10px] md:text-[11px] px-3 py-2 rounded-xl ${dark ? "bg-zinc-800/60" : "bg-zinc-50"}`}>
      <span className={`font-bold uppercase tracking-widest ${dark ? "text-zinc-500" : "text-zinc-400"}`}>This month:</span>
      {stats.Urgent > 0 && (
        <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-100 text-red-700 border border-red-200 font-semibold">
          🔴 {stats.Urgent} Urgent
        </span>
      )}
      {stats.Work > 0 && (
        <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 border border-blue-200 font-semibold">
          🔵 {stats.Work} Work
        </span>
      )}
      {stats.Personal > 0 && (
        <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200 font-semibold">
          🟢 {stats.Personal} Personal
        </span>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────

export default function WallCalendar() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [dark, setDark] = useState(false);
  const [rangeStart, setRangeStart] = useState<Date | null>(null);
  const [rangeEnd, setRangeEnd] = useState<Date | null>(null);
  const [hoverDate, setHoverDate] = useState<Date | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [noteText, setNoteText] = useState("");
  const [selectedTag, setSelectedTag] = useState<NoteTag>("Work");
  const [apiHolidays, setApiHolidays] = useState<Record<string, string>>({});
  const [copied, setCopied] = useState(false);

  const themeIndex = currentMonth.getMonth();
  const { accent, label } = MONTH_THEMES[themeIndex];

  // 1. Persistence via Session Storage (as requested)
  useEffect(() => {
    const stored = sessionStorage.getItem("wall-calendar-advanced-notes");
    if (stored) {
      try { setNotes(JSON.parse(stored)); } catch (_) { }
    }
  }, []);

  useEffect(() => {
    sessionStorage.setItem("wall-calendar-advanced-notes", JSON.stringify(notes));
  }, [notes]);

  // 2. Offline-first reliable holiday generation via date-holidays library
  useEffect(() => {
    try {
      const hd = new Holidays('IN'); 
      const year = currentMonth.getFullYear();
      const holidaysData = hd.getHolidays(year);
      
      const mapped: Record<string, string> = {};
      holidaysData.forEach((h: any) => {
        const dateObj = new Date(h.date);
        const m = String(dateObj.getMonth() + 1).padStart(2, '0');
        const d = String(dateObj.getDate()).padStart(2, '0');
        mapped[`${m}-${d}`] = h.name; 
      });
      setApiHolidays(mapped);
    } catch (error) {
      console.warn("Library holiday generation failed, falling back to static map.");
      setApiHolidays({}); // Reset to allow fallback to trigger
    }
  }, [currentMonth]);

  const ALL_HOLIDAYS = useMemo(() => {
    // If apiHolidays populated successfully, use it. Otherwise, use static fallback.
    return Object.keys(apiHolidays).length > 0 ? apiHolidays : STATIC_HOLIDAYS_FALLBACK;
  }, [apiHolidays]);

  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(currentMonth), { weekStartsOn: 1 });
    const end = endOfWeek(endOfMonth(currentMonth), { weekStartsOn: 1 });
    return eachDayOfInterval({ start, end });
  }, [currentMonth]);

  const effectiveEnd = useMemo(() => {
    if (rangeStart && !rangeEnd && hoverDate && hoverDate >= rangeStart) return hoverDate;
    return rangeEnd;
  }, [rangeStart, rangeEnd, hoverDate]);

  const handlePrevMonth = useCallback(() => setCurrentMonth((p) => subMonths(p, 1)), []);
  const handleNextMonth = useCallback(() => setCurrentMonth((p) => addMonths(p, 1)), []);

  const handleDayClick = useCallback(
    (date: Date) => {
      if (!isSameMonth(date, currentMonth)) return;
      if (!rangeStart || (rangeStart && rangeEnd)) {
        setRangeStart(date);
        setRangeEnd(null);
      } else {
        if (date < rangeStart) { setRangeEnd(rangeStart); setRangeStart(date); }
        else setRangeEnd(date);
        setHoverDate(null);
      }
    },
    [rangeStart, rangeEnd, currentMonth]
  );

  const applyPreset = useCallback((preset: "today" | "week" | "month") => {
    const t = new Date();
    setCurrentMonth(t);
    if (preset === "today") { setRangeStart(t); setRangeEnd(t); }
    if (preset === "week") { setRangeStart(startOfWeek(t, { weekStartsOn: 1 })); setRangeEnd(endOfWeek(t, { weekStartsOn: 1 })); }
    if (preset === "month") { setRangeStart(startOfMonth(t)); setRangeEnd(endOfMonth(t)); }
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLInputElement) return;
      if (e.key === "ArrowRight") handleNextMonth();
      if (e.key === "ArrowLeft") handlePrevMonth();
      if (e.key === "t" || e.key === "T") applyPreset("today");
      if (e.key === "Escape") { setRangeStart(null); setRangeEnd(null); }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleNextMonth, handlePrevMonth, applyPreset]);

  const copyAgenda = useCallback(() => {
    if (notes.length === 0) return;
    const lines = notes.map((n) => `[${n.tag}] ${n.start}${n.end !== n.start ? ` → ${n.end}` : ""}: ${n.text}`);
    const text = `📅 Agenda:\n${lines.join("\n")}`;
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    });
  }, [notes]);

  const saveNote = () => {
    const trimmed = noteText.trim();
    if (!trimmed || !rangeStart) return;
    setNotes((prev) => [
      ...prev,
      {
        start: format(rangeStart, "yyyy-MM-dd"),
        end: format(rangeEnd ?? rangeStart, "yyyy-MM-dd"),
        text: trimmed,
        tag: selectedTag,
      },
    ]);
    setNoteText("");
  };

  const deleteNote = (index: number) => setNotes((prev) => prev.filter((_, i) => i !== index));

  const spanDays = rangeStart && rangeEnd
    ? Math.abs(differenceInDays(rangeEnd, rangeStart)) + 1
    : rangeStart ? 1 : 0;

  const bgClass = dark ? "bg-zinc-950 text-zinc-200" : "bg-[#f4f2ec] text-zinc-900";
  const surfaceClass = dark ? "bg-zinc-900 border-zinc-800 shadow-2xl shadow-black/80" : "bg-white border-[#e8e4de] shadow-2xl shadow-black/10";
  const borderClass = dark ? "border-zinc-800" : "border-[#e0dbd1]";
  const textMute = dark ? "text-zinc-500" : "text-zinc-400";

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center p-3 sm:p-6 md:p-12 transition-colors duration-500 ${bgClass}`}>
      <div className="w-full max-w-[1040px]">

        {/* Top toolbar */}
        <div className="flex justify-between items-center mb-4 md:mb-6">
          <ShortcutHints dark={dark} />
          <button
            onClick={() => setDark(!dark)}
            className={`flex items-center gap-2 px-4 md:px-5 py-2 rounded-full text-[11px] md:text-xs font-semibold border transition-all active:scale-95 ${dark ? "border-zinc-800 bg-zinc-900 sm:hover:bg-zinc-800 text-zinc-300" : "border-zinc-300 bg-white sm:hover:bg-zinc-50 text-zinc-600 shadow-sm"
              }`}
          >
            {dark ? <Sun size={14} /> : <Moon size={14} />}
            {dark ? "Light" : "Dark"}
          </button>
        </div>

        {/* Main card */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className={`rounded-3xl overflow-hidden border ${surfaceClass}`}
        >
          <SpiralBinding accent={accent} />

          <div className="flex flex-col md:grid md:grid-cols-5">
            {/* LEFT: hero */}
            <div className="md:col-span-2">
              <HeroPanel monthDate={currentMonth} accent={accent} label={label} />
            </div>

            {/* RIGHT: calendar + notes */}
            <div className={`p-4 sm:p-6 md:p-10 flex flex-col gap-6 md:gap-8 md:col-span-3 border-t md:border-t-0 md:border-l ${borderClass}`}>

              {/* Presets */}
              <div className="flex flex-wrap items-center gap-2 md:gap-3">
                <span className={`text-[10px] font-bold uppercase tracking-widest hidden sm:inline-block ${textMute}`}>Presets</span>
                {([["today", <Clock size={12} />, "Today"], ["week", <CalendarDays size={12} />, "Week"], ["month", <CalendarSearch size={12} />, "Month"]] as const).map(([p, icon, txt]) => (
                  <button
                    key={p}
                    onClick={() => applyPreset(p as any)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 text-[11px] md:text-xs rounded-lg transition-transform sm:hover:scale-105 active:scale-95 ${dark ? "bg-zinc-800 sm:hover:bg-zinc-700" : "bg-zinc-100 sm:hover:bg-zinc-200"
                      }`}
                  >
                    {icon} {txt}
                  </button>
                ))}
              </div>

              {/* Month navigation */}
              <div className="flex items-center justify-between">
                <button
                  onClick={handlePrevMonth}
                  className={`p-2.5 rounded-full border transition-all sm:hover:scale-110 active:scale-90 shadow-sm ${dark ? "border-zinc-700 bg-zinc-800 sm:hover:bg-zinc-700" : "border-zinc-200 bg-white sm:hover:bg-zinc-50"
                    }`}
                >
                  <ChevronLeft size={18} className={dark ? "text-zinc-300" : "text-zinc-600"} />
                </button>
                <h2 className="font-serif text-2xl md:text-3xl font-bold select-none tracking-tight">
                  {format(currentMonth, "MMMM yyyy")}
                </h2>
                <button
                  onClick={handleNextMonth}
                  className={`p-2.5 rounded-full border transition-all sm:hover:scale-110 active:scale-90 shadow-sm ${dark ? "border-zinc-700 bg-zinc-800 sm:hover:bg-zinc-700" : "border-zinc-200 bg-white sm:hover:bg-zinc-50"
                    }`}
                >
                  <ChevronRight size={18} className={dark ? "text-zinc-300" : "text-zinc-600"} />
                </button>
              </div>

              {/* Weekday headers */}
              <div className="grid grid-cols-7 gap-1 md:gap-1.5">
                {DAYS_OF_WEEK.map((day) => (
                  <div
                    key={day}
                    className={`text-center text-[10px] md:text-[11px] font-bold uppercase tracking-widest ${day === "Sat" || day === "Sun" ? "" : textMute
                      }`}
                    style={{ color: day === "Sat" || day === "Sun" ? accent : undefined }}
                  >
                    {day}
                  </div>
                ))}
              </div>

              {/* Day cells */}
              <div className="grid grid-cols-7 gap-1 md:gap-1.5">
                {days.map((day) => {
                  const isCurrentMonth = isSameMonth(day, currentMonth);
                  const isToday = isSameDay(day, new Date());
                  const holiday = ALL_HOLIDAYS[format(day, "MM-dd")];
                  const dWeekend = isWeekend(day);
                  const isStart = rangeStart != null && isSameDay(day, rangeStart);
                  const isEnd = effectiveEnd != null && isSameDay(day, effectiveEnd);
                  const inRange = rangeStart != null && effectiveEnd != null && day > rangeStart && day < effectiveEnd;
                  const isSelected = isStart || isEnd;

                  return (
                    <motion.button
                      key={day.toISOString()}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleDayClick(day)}
                      onMouseEnter={() => setHoverDate(day)}
                      title={holiday ?? undefined}
                      disabled={!isCurrentMonth}
                      className={`relative flex flex-col items-center justify-center h-10 sm:h-12 md:h-14 rounded-xl text-sm select-none transition-all border ${inRange && !isSelected ? "border-dashed" : "border-solid"
                        } ${!isCurrentMonth ? "opacity-30 cursor-default" : "cursor-pointer active:scale-95"}`}
                      style={{
                        backgroundColor: isSelected ? accent : inRange ? `${accent}22` : "transparent",
                        color: isSelected ? "#fff" : dWeekend && isCurrentMonth ? accent : "inherit",
                        fontWeight: isSelected || isToday ? 700 : 500,
                        borderColor: isSelected
                          ? "transparent"
                          : inRange
                            ? `${accent}66`
                            : isToday
                              ? accent
                              : dark ? "#27272a" : "#f4f4f5",
                        boxShadow: isSelected ? `0 4px 12px ${accent}66` : undefined,
                      }}
                    >
                      {format(day, "d")}
                      {holiday && (
                        <span
                          className="absolute bottom-1 w-1 md:w-1.5 h-1 md:h-1.5 rounded-full"
                          style={{ backgroundColor: isSelected ? "#fff" : accent }}
                        />
                      )}
                    </motion.button>
                  );
                })}
              </div>

              <hr className={`border-0 border-t ${borderClass}`} />

              {/* Notes section */}
              <div className="flex flex-col gap-4">

                {/* Header + span count + copy button */}
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <h3
                    className="text-[11px] md:text-[12px] font-bold tracking-[2px] md:tracking-[4px] uppercase flex items-center gap-2"
                    style={{ color: accent }}
                  >
                    <Tag size={12} /> Agenda
                  </h3>
                  <div className="flex items-center gap-2">
                    {spanDays > 0 && (
                      <span className={`text-[10px] md:text-[11px] font-mono font-medium px-2 py-0.5 rounded-md ${dark ? "bg-zinc-800 text-zinc-300" : "bg-zinc-100 text-zinc-600"}`}>
                        {spanDays} day{spanDays !== 1 && "s"}
                      </span>
                    )}
                    {/* FEATURE 3: Copy Agenda button */}
                    {notes.length > 0 && (
                      <button
                        onClick={copyAgenda}
                        title="Copy all notes to clipboard"
                        className={`flex items-center gap-1.5 px-3 py-1 text-[10px] md:text-[11px] font-semibold rounded-lg border transition-all sm:hover:scale-105 active:scale-95 ${dark ? "border-zinc-700 bg-zinc-800 sm:hover:bg-zinc-700 text-zinc-300" : "border-zinc-200 bg-white sm:hover:bg-zinc-50 text-zinc-600 shadow-sm"
                          }`}
                      >
                        <Copy size={11} /> Copy
                      </button>
                    )}
                  </div>
                </div>

                {/* FEATURE 4: Tag analytics */}
                <TagAnalytics notes={notes} currentMonth={currentMonth} dark={dark} />

                {/* Range label */}
                <p className="text-xs md:text-[13px] font-mono leading-relaxed truncate" style={{ color: dark ? "#888" : "#666" }}>
                  {!rangeStart
                    ? "No primary dates selected."
                    : !rangeEnd || isSameDay(rangeStart, rangeEnd)
                      ? format(rangeStart, "MMMM d, yyyy")
                      : `${format(rangeStart, "MMM d")}  —  ${format(rangeEnd, "MMM d, yyyy")}`}
                </p>

                {/* Textarea */}
                <textarea
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  disabled={!rangeStart}
                  placeholder={rangeStart ? "Document events..." : "Select dates first..."}
                  className={`w-full p-3 md:p-4 text-sm rounded-xl border outline-none bg-transparent transition-all focus:shadow-md resize-y min-h-[80px] md:min-h-[90px] ${dark ? "border-zinc-700 text-zinc-200" : "border-zinc-300 text-zinc-900 focus:border-zinc-400"
                    } ${!rangeStart && "opacity-40"}`}
                  style={{ outlineColor: accent }}
                />

                {/* Tag picker + Save */}
                <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-opacity ${!rangeStart ? "opacity-40 pointer-events-none" : "opacity-100"}`}>
                  <div className="flex gap-2 flex-wrap">
                    {(["Work", "Personal", "Urgent"] as NoteTag[]).map((tag) => (
                      <button
                        key={tag}
                        onClick={() => setSelectedTag(tag)}
                        className={`text-[9px] md:text-[10px] uppercase font-bold tracking-wider px-3 py-1.5 rounded-full border transition-all ${selectedTag === tag
                            ? TAG_STYLES[tag]
                            : dark
                              ? "bg-zinc-800 border-zinc-700 text-zinc-400 sm:hover:text-zinc-200"
                              : "bg-zinc-50 border-zinc-200 text-zinc-500 sm:hover:text-zinc-700"
                          }`}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={saveNote}
                    disabled={!rangeStart || !noteText.trim()}
                    className="w-full sm:w-auto px-6 py-2 md:py-2.5 rounded-full text-[12px] md:text-[13px] font-bold text-white transition-all sm:hover:scale-105 active:scale-95 disabled:opacity-30 disabled:sm:hover:scale-100 shadow-md"
                    style={{ backgroundColor: accent }}
                  >
                    Save to Core
                  </button>
                </div>

                {/* Saved notes list */}
                <AnimatePresence>
                  {notes.length > 0 && (
                    <div className="flex flex-col gap-3 mt-2">
                      {notes.map((n, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          className={`relative flex flex-col gap-2 p-3 md:p-4 rounded-xl border transition-colors group ${dark ? "bg-zinc-800/50 border-zinc-700/50" : "bg-zinc-50 border-zinc-100 sm:hover:border-zinc-200"
                            }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className={`text-[8px] md:text-[9px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-md ${TAG_STYLES[n.tag]}`}>
                                {n.tag}
                              </span>
                              <p className="text-[10px] md:text-[11px] font-mono text-zinc-400 mb-0">
                                {n.start === n.end
                                  ? format(new Date(n.start), "MMM d, yyyy")
                                  : `${format(new Date(n.start), "MMM d")} → ${format(new Date(n.end), "MMM d, yyyy")}`}
                              </p>
                            </div>
                            <button
                              onClick={() => deleteNote(i)}
                              className="text-zinc-400 hover:text-red-500 transition-colors p-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 focus:opacity-100"
                            >
                              <X size={16} />
                            </button>
                          </div>
                          <p className={`text-xs md:text-sm whitespace-pre-wrap leading-relaxed ${dark ? "text-zinc-300" : "text-zinc-700"}`}>
                            {n.text}
                          </p>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </motion.div>

        <p className="text-center mt-6 md:mt-8 text-[10px] md:text-[11px] font-medium tracking-wide text-zinc-500 uppercase">
          Production Grade Planning Tool · Navis AI Standard
        </p>
      </div>

      <Toast message="Agenda copied to clipboard!" visible={copied} />
    </div>
  );
}