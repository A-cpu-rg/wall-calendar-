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
  addDays
} from "date-fns";
import { ChevronLeft, ChevronRight, Sun, Moon, X, Clock, CalendarDays, CalendarSearch, Tag } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

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

const STATIC_HOLIDAYS: Record<string, string> = {
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
  "Work": "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400 border border-blue-200 dark:border-blue-800",
  "Personal": "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800",
  "Urgent": "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400 border border-red-200 dark:border-red-800",
};

interface Note {
  start: string;
  end: string;
  text: string;
  tag: NoteTag;
}

// ─────────────────────────────────────────────
// Helper Components
// ─────────────────────────────────────────────

function SpiralBinding({ accent }: { accent: string }) {
  const coils = Array.from({ length: 22 });
  return (
    <div className="flex justify-center gap-2.5 pt-1.5 px-6 pb-0 overflow-hidden select-none">
      {coils.map((_, i) => (
        <div
          key={i}
          className="w-3.5 h-[22px] opacity-75 drop-shadow-sm"
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
  const monthIndex = monthDate.getMonth();
  const { image } = MONTH_THEMES[monthIndex];

  return (
    <div className="relative w-full h-full min-h-[240px] md:min-h-[500px] overflow-hidden bg-zinc-900 group">
      <motion.img
        initial={{ scale: 1.08 }}
        animate={{ scale: 1.02 }}
        transition={{ duration: 10, ease: "linear", repeat: Infinity, repeatType: "reverse" }}
        src={image}
        alt={`${label} scenery`}
        className="block w-full h-full object-cover transition-transform duration-[1500ms] group-hover:scale-110"
        loading="eager"
      />
      <div
        className="absolute inset-0 transition-opacity duration-700"
        style={{
          background: `linear-gradient(to bottom, transparent 30%, ${accent}e6 100%)`,
        }}
      />
      <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-500" />
      <div className="absolute bottom-6 left-6 text-white font-serif tracking-wide select-none drop-shadow-lg">
        <p className="m-0 text-xs tracking-[5px] uppercase opacity-90 font-sans font-medium">{label}</p>
        <p className="m-0 mt-2 text-5xl font-bold leading-none">{format(monthDate, "MMMM")}</p>
        <p className="m-0 mt-1 text-lg font-normal opacity-85 font-sans">{format(monthDate, "yyyy")}</p>
      </div>
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
  
  // API State
  const [apiHolidays, setApiHolidays] = useState<Record<string, string>>({});

  const themeIndex = currentMonth.getMonth();
  const { accent, label } = MONTH_THEMES[themeIndex];

  // Load Persistence
  useEffect(() => {
    const stored = localStorage.getItem("wall-calendar-advanced-notes");
    if (stored) {
      try { setNotes(JSON.parse(stored)); } catch (e) { }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("wall-calendar-advanced-notes", JSON.stringify(notes));
  }, [notes]);

  // Hybrid Holiday Fetcher
  useEffect(() => {
    const year = currentMonth.getFullYear();
    // Exploring Nager API: IN endpoint currently returns 204 No Content for future years.
    // We fetch 'US' worldwide standard holidays to demonstrate live API merging functionality.
    fetch(`https://date.nager.at/api/v3/PublicHolidays/${year}/US`)
      .then(async (res) => {
        if (!res.ok || res.status === 204) throw new Error("No data");
        return res.json();
      })
      .then(data => {
        const mapped: Record<string, string> = {};
        data.forEach((h: any) => {
          const [_, m, d] = h.date.split('-');
          mapped[`${m}-${d}`] = h.localName || h.name;
        });
        setApiHolidays(mapped);
      })
      .catch(() => console.warn("API fallback triggered; continuing with static baseline."));
  }, [currentMonth]);

  const ALL_HOLIDAYS = useMemo(() => ({
    ...STATIC_HOLIDAYS,
    ...apiHolidays,
  }), [apiHolidays]);

  // Calendar Engine
  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(currentMonth), { weekStartsOn: 1 });
    const end = endOfWeek(endOfMonth(currentMonth), { weekStartsOn: 1 });
    return eachDayOfInterval({ start, end });
  }, [currentMonth]);

  const effectiveEnd = useMemo(() => {
    if (rangeStart && !rangeEnd && hoverDate && hoverDate >= rangeStart) {
      return hoverDate;
    }
    return rangeEnd;
  }, [rangeStart, rangeEnd, hoverDate]);

  // Event Handlers
  const handlePrevMonth = useCallback(() => setCurrentMonth((prev) => subMonths(prev, 1)), []);
  const handleNextMonth = useCallback(() => setCurrentMonth((prev) => addMonths(prev, 1)), []);
  
  const handleDayClick = useCallback(
    (date: Date) => {
      if (!isSameMonth(date, currentMonth)) return; // Lock to current month grid

      if (!rangeStart || (rangeStart && rangeEnd)) {
        setRangeStart(date);
        setRangeEnd(null);
      } else {
        if (date < rangeStart) {
          setRangeEnd(rangeStart);
          setRangeStart(date);
        } else {
          setRangeEnd(date);
        }
        setHoverDate(null);
      }
    },
    [rangeStart, rangeEnd, currentMonth]
  );

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

  const deleteNote = (index: number) => {
    setNotes((prev) => prev.filter((_, i) => i !== index));
  };

  // Presets
  const applyPresetToday = () => {
    const t = new Date();
    setCurrentMonth(t);
    setRangeStart(t);
    setRangeEnd(t);
  };

  const applyPresetThisWeek = () => {
    const t = new Date();
    setCurrentMonth(t);
    setRangeStart(startOfWeek(t, { weekStartsOn: 1 }));
    setRangeEnd(endOfWeek(t, { weekStartsOn: 1 }));
  };

  const applyPresetThisMonth = () => {
    const t = new Date();
    setCurrentMonth(t);
    setRangeStart(startOfMonth(t));
    setRangeEnd(endOfMonth(t));
  };

  // UI Derivations
  const bgClass = dark ? "bg-zinc-950 text-zinc-200" : "bg-[#f4f2ec] text-zinc-900";
  const surfaceClass = dark ? "bg-zinc-900 border-zinc-800 shadow-2xl shadow-black/80" : "bg-white border-[#e8e4de] shadow-2xl shadow-black/10";
  const borderClass = dark ? "border-zinc-800" : "border-[#e0dbd1]";
  const textMuteClass = dark ? "text-zinc-500" : "text-zinc-400";
  
  const spanDays = rangeStart && rangeEnd 
    ? Math.abs(differenceInDays(rangeEnd, rangeStart)) + 1 
    : (rangeStart ? 1 : 0);

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center p-4 md:p-12 transition-colors duration-500 ${bgClass}`}>
      <div className="w-full max-w-[1040px]">
        {/* Toggle Controls */}
        <div className="flex justify-end mb-6">
          <button
            onClick={() => setDark(!dark)}
            className={`flex items-center gap-2 px-5 py-2 rounded-full text-xs font-semibold border transition-all active:scale-95 ${
              dark ? "border-zinc-800 hover:bg-zinc-800 text-zinc-300" : "border-zinc-300 hover:bg-white text-zinc-600 bg-white shadow-sm"
            }`}
          >
            {dark ? <Sun size={15} /> : <Moon size={15} />}
            {dark ? "Light Mode" : "Dark Mode"}
          </button>
        </div>

        {/* Main Card */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className={`rounded-3xl overflow-hidden border ${surfaceClass}`}
        >
          <SpiralBinding accent={accent} />

          <div className="flex flex-col md:grid md:grid-cols-5 md:grid-rows-1 group/calendar">
            {/* LEFT: Picture Panel */}
            <div className="md:col-span-2">
              <HeroPanel monthDate={currentMonth} accent={accent} label={label} />
            </div>

            {/* RIGHT: Calendar & Notes */}
            <div className={`p-6 md:p-10 flex flex-col gap-8 md:col-span-3 ${dark ? 'border-t md:border-t-0 md:border-l border-zinc-800' : 'border-t md:border-t-0 md:border-l border-[#e8e4de]'}`}>
              
              {/* Presets Row */}
              <div className="flex flex-wrap items-center gap-3">
                <span className={`text-[10px] font-bold uppercase tracking-widest ${textMuteClass}`}>Presets</span>
                <button onClick={applyPresetToday} className={`flex items-center gap-1.5 px-3 py-1 text-xs rounded-lg transition-transform hover:scale-105 active:scale-95 ${dark ? "bg-zinc-800 hover:bg-zinc-700" : "bg-zinc-100 hover:bg-zinc-200"}`}>
                  <Clock size={12} /> Today
                </button>
                <button onClick={applyPresetThisWeek} className={`flex items-center gap-1.5 px-3 py-1 text-xs rounded-lg transition-transform hover:scale-105 active:scale-95 ${dark ? "bg-zinc-800 hover:bg-zinc-700" : "bg-zinc-100 hover:bg-zinc-200"}`}>
                  <CalendarDays size={12} /> This Week
                </button>
                 <button onClick={applyPresetThisMonth} className={`flex items-center gap-1.5 px-3 py-1 text-xs rounded-lg transition-transform hover:scale-105 active:scale-95 ${dark ? "bg-zinc-800 hover:bg-zinc-700" : "bg-zinc-100 hover:bg-zinc-200"}`}>
                  <CalendarSearch size={12} /> This Month
                </button>
              </div>

              {/* Header Navigation */}
              <div className="flex items-center justify-between mt-2">
                <button
                  onClick={handlePrevMonth}
                  className={`p-2.5 rounded-full border transition-all hover:scale-110 active:scale-90 shadow-sm ${dark ? "border-zinc-700 hover:bg-zinc-700 bg-zinc-800" : "border-zinc-200 hover:bg-zinc-50 bg-white"}`}
                >
                  <ChevronLeft size={20} className={dark ? "text-zinc-300" : "text-zinc-600"} />
                </button>
                <h2 className="font-serif text-3xl font-bold select-none tracking-tight">
                  {format(currentMonth, "MMMM yyyy")}
                </h2>
                <button
                  onClick={handleNextMonth}
                  className={`p-2.5 rounded-full border transition-all hover:scale-110 active:scale-90 shadow-sm ${dark ? "border-zinc-700 hover:bg-zinc-700 bg-zinc-800" : "border-zinc-200 hover:bg-zinc-50 bg-white"}`}
                >
                  <ChevronRight size={20} className={dark ? "text-zinc-300" : "text-zinc-600"} />
                </button>
              </div>

              {/* Grid Header */}
              <div className="grid grid-cols-7 gap-1.5">
                {DAYS_OF_WEEK.map((day) => (
                  <div
                    key={day}
                    className={`text-center text-[11px] font-bold uppercase tracking-widest ${
                      day === "Sat" || day === "Sun" ? "" : textMuteClass
                    }`}
                    style={{ color: day === "Sat" || day === "Sun" ? accent : undefined }}
                  >
                    {day}
                  </div>
                ))}
              </div>

              {/* Grid Cells */}
              <div className="grid grid-cols-7 gap-1.5">
                {days.map((day) => {
                  const isCurrentMonth = isSameMonth(day, currentMonth);
                  const isToday = isSameDay(day, new Date());
                  const holiday = ALL_HOLIDAYS[format(day, "MM-dd")];
                  const dWeekend = isWeekend(day);

                  // Range logic
                  const isStart = rangeStart && isSameDay(day, rangeStart);
                  const isEnd = effectiveEnd && isSameDay(day, effectiveEnd);
                  const inRange =
                    rangeStart &&
                    effectiveEnd &&
                    day > rangeStart &&
                    day < effectiveEnd;
                  const isSelected = isStart || isEnd;

                  // Disabled logic
                  const isPast = day < new Date(new Date().setHours(0,0,0,0));

                  // CSS Mapping
                  let cellBg = "transparent";
                  let cellBorder = "transparent";
                  let cellWeight = isToday ? "font-bold" : "font-medium";
                  let cellColor = dWeekend ? accent : "inherit";

                  if (!isCurrentMonth) cellColor = dark ? "#444" : "#ccc";

                  if (isSelected) {
                    cellBg = accent;
                    cellColor = "#fff";
                    cellWeight = "font-bold";
                  } else if (inRange) {
                    cellBg = `${accent}22`;
                    cellBorder = `${accent}66`;
                  }

                  if (isToday && !isSelected) {
                    cellBorder = accent;
                    cellWeight = "font-bold";
                  }

                  return (
                    <motion.button
                      key={day.toISOString()}
                      whileHover={{ scale: isCurrentMonth && !isSelected ? 1.1 : 1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleDayClick(day)}
                      onMouseEnter={() => setHoverDate(day)}
                      title={holiday || (isPast ? "Past Date" : "")}
                      disabled={!isCurrentMonth}
                      className={`relative flex flex-col items-center justify-center h-12 md:h-14 rounded-xl text-sm select-none transition-all border shadow-sm ${
                        inRange && !isSelected ? "border-dashed" : "border-solid"
                      } ${!isCurrentMonth ? "opacity-30 cursor-default" : "cursor-pointer"} ${isPast && !isSelected && isCurrentMonth ? "opacity-60" : ""}`}
                      style={{
                        backgroundColor: cellBg,
                        color: cellColor,
                        fontWeight: cellWeight === "font-bold" ? 700 : 500,
                        borderColor: cellBorder !== "transparent" ? cellBorder : (dark ? "#27272a" : "#f4f4f5"),
                        boxShadow: isSelected ? `0 4px 12px ${accent}66` : undefined,
                      }}
                    >
                      {format(day, "d")}
                      {holiday && (
                        <span
                          className="absolute bottom-1 w-1.5 h-1.5 rounded-full shadow-sm"
                          style={{ backgroundColor: isSelected ? "#fff" : accent }}
                        />
                      )}
                    </motion.button>
                  );
                })}
              </div>

              <hr className={`border-0 border-t ${borderClass} my-2`} />

              {/* Intelligent Notes Section */}
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                   <h3 className="text-[12px] font-bold tracking-[4px] uppercase flex items-center gap-2" style={{ color: accent }}>
                     <Tag size={12} /> Agenda Notes
                   </h3>
                   {spanDays > 0 && (
                     <span className={`text-[11px] font-mono font-medium px-2 py-0.5 rounded-md ${dark ? "bg-zinc-800 text-zinc-300" : "bg-zinc-100 text-zinc-600"}`}>
                       {spanDays} day{spanDays !== 1 && 's'} selected
                     </span>
                   )}
                </div>
                
                <p className="text-[13px] font-mono leading-relaxed truncate" style={{ color: dark ? "#888" : "#666" }}>
                  {!rangeStart
                    ? "No primary dates selected."
                    : !rangeEnd || isSameDay(rangeStart, rangeEnd)
                    ? format(rangeStart, "MMMM d, yyyy")
                    : `${format(rangeStart, "MMM d")}  —  ${format(rangeEnd, "MMM d, yyyy")}`}
                </p>

                {/* Input Area */}
                <div className="flex flex-col gap-3 relative">
                  <textarea
                    value={noteText}
                    onChange={(e) => setNoteText(e.target.value)}
                    disabled={!rangeStart}
                    placeholder={rangeStart ? "Document events, plans, or critical reminders..." : "Select dates to unlock note capture..."}
                    className={`w-full p-4 text-sm rounded-xl border outline-none bg-transparent transition-all focus:shadow-md resize-y min-h-[90px] ${
                      dark ? "border-zinc-700 text-zinc-200" : "border-zinc-300 text-zinc-900 focus:border-zinc-400"
                    } ${!rangeStart && "opacity-40"}`}
                    style={{
                      outlineColor: accent,
                    }}
                  />
                  
                  {/* Tag Selector & Save */}
                  <div className={`flex items-center justify-between transition-opacity ${!rangeStart ? 'opacity-40 pointer-events-none' : 'opacity-100'}`}>
                    <div className="flex gap-2">
                       {(["Work", "Personal", "Urgent"] as NoteTag[]).map(tag => (
                         <button
                           key={tag}
                           onClick={() => setSelectedTag(tag)}
                           className={`text-[10px] uppercase font-bold tracking-wider px-3 py-1.5 rounded-full border transition-all ${
                             selectedTag === tag 
                             ? TAG_STYLES[tag] 
                             : (dark ? 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:text-zinc-200' : 'bg-zinc-50 border-zinc-200 text-zinc-500 hover:text-zinc-700')
                           }`}
                         >
                           {tag}
                         </button>
                       ))}
                    </div>
                    <button
                      onClick={saveNote}
                      disabled={!rangeStart || !noteText.trim()}
                      className="px-6 py-2 rounded-full text-[13px] font-bold text-white transition-all transform hover:scale-105 active:scale-95 disabled:hover:scale-100 disabled:opacity-30 shadow-md"
                      style={{ backgroundColor: accent }}
                    >
                      Save to Core
                    </button>
                  </div>
                </div>

                {/* Persisted Notes Render */}
                <AnimatePresence>
                  {notes.length > 0 && (
                    <div className="flex flex-col gap-3 mt-4">
                      {notes.map((n, i) => (
                         <motion.div
                          key={i}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          className={`relative flex flex-col gap-2 p-4 rounded-xl border ${dark ? "bg-zinc-800/50 border-zinc-700/50" : "bg-zinc-50 border-zinc-100 hover:border-zinc-200"} transition-colors group`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className={`text-[9px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-md ${TAG_STYLES[n.tag]}`}>
                                {n.tag}
                              </span>
                              <p className="text-[11px] font-mono text-zinc-400 mb-0">
                                {n.start === n.end ? format(new Date(n.start), "MMM d, yyyy") : `${format(new Date(n.start), "MMM d")} → ${format(new Date(n.end), "MMM d, yyyy")}`}
                              </p>
                            </div>
                            <button
                              onClick={() => deleteNote(i)}
                              className="text-zinc-400 hover:text-red-500 transition-colors p-1 opacity-0 group-hover:opacity-100 focus:opacity-100"
                            >
                              <X size={16} />
                            </button>
                          </div>
                          <p className={`text-sm whitespace-pre-wrap leading-relaxed ${dark ? 'text-zinc-300' : 'text-zinc-700'}`}>
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

        <p className="text-center mt-8 text-[11px] font-medium tracking-wide text-zinc-500 uppercase">
          Production Grade Interactive Planning Tool · Client-Side Operation
        </p>
      </div>
    </div>
  );
}
