"use client";

import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import {
  format, startOfMonth, endOfMonth, eachDayOfInterval,
  addMonths, subMonths, isSameDay, isSameMonth, isWeekend,
  startOfWeek, endOfWeek, differenceInDays,
} from "date-fns";
import {
  ChevronLeft, ChevronRight, Sun, Moon, X, Clock,
  CalendarDays, CalendarSearch, Tag, Copy, Check,
  Keyboard, Download, Trash2, Pencil, Save,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// ─────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────

const DAYS_OF_WEEK = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const MONTH_THEMES = [
  { image: "https://images.unsplash.com/photo-1483921020237-2ff51e8e4b22?w=900&q=80", accent: "#1565c0", label: "Winter"        },
  { image: "https://images.unsplash.com/photo-1518895949257-7621c3c786d7?w=900&q=80", accent: "#ad1457", label: "Cherry Blossom"},
  { image: "https://images.unsplash.com/photo-1426604966848-d7adac402bff?w=900&q=80", accent: "#2e7d32", label: "Spring"        },
  { image: "https://images.unsplash.com/photo-1465189684280-6a8fa9b19a7a?w=900&q=80", accent: "#e65100", label: "Golden Bloom"  },
  { image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=900&q=80", accent: "#00695c", label: "Summer Vista"  },
  { image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=900&q=80", accent: "#0277bd", label: "Ocean Horizon" },
  { image: "https://images.unsplash.com/photo-1501854140801-50d01698950b?w=900&q=80", accent: "#b71c1c", label: "Crimson Sunset"},
  { image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=900&q=80", accent: "#bf360c", label: "Late Summer"   },
  { image: "https://images.unsplash.com/photo-1477414348463-c0eb7f1359b6?w=900&q=80", accent: "#4e342e", label: "Autumn Forest" },
  { image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=900&q=80", accent: "#e65100", label: "Fall Colors"   },
  { image: "https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=900&q=80", accent: "#37474f", label: "Misty November" },
  { image: "https://images.unsplash.com/photo-1418985991508-e47386d96a71?w=900&q=80", accent: "#283593", label: "Winter Frost"  },
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


type NoteTag = "Work" | "Personal" | "Urgent";

const TAG_STYLES: Record<NoteTag, string> = {
  Work:     "bg-blue-100 text-blue-700 border border-blue-200",
  Personal: "bg-emerald-100 text-emerald-700 border border-emerald-200",
  Urgent:   "bg-red-100 text-red-700 border border-red-200",
};

const TAG_STYLES_DARK: Record<NoteTag, string> = {
  Work:     "bg-blue-900/40 text-blue-400 border border-blue-800",
  Personal: "bg-emerald-900/40 text-emerald-400 border border-emerald-800",
  Urgent:   "bg-red-900/40 text-red-400 border border-red-800",
};

interface Note {
  id:    string;
  start: string;
  end:   string;
  text:  string;
  tag:   NoteTag;
}



function uid() {
  return Math.random().toString(36).slice(2);
}


function SpiralBinding({ accent }: { accent: string }) {
  return (
    <div className="flex justify-center gap-1.5 md:gap-2.5 pt-1.5 px-4 md:px-6 pb-0 overflow-hidden select-none">
      {Array.from({ length: 22 }).map((_, i) => (
        <div
          key={i}
          className="w-2.5 md:w-3.5 h-[16px] md:h-[22px] opacity-75"
          style={{
            borderRadius: "50% 50% 40% 40%",
            borderTop:   `2.5px solid ${accent}`,
            borderLeft:  `2.5px solid ${accent}`,
            borderRight: `2.5px solid ${accent}`,
          }}
        />
      ))}
    </div>
  );
}


function HeroPanel({
  monthDate, accent, label, direction,
}: {
  monthDate: Date; accent: string; label: string; direction: number;
}) {
  const { image } = MONTH_THEMES[monthDate.getMonth()];
  return (
    <div className="relative w-full h-full min-h-[220px] md:min-h-[500px] overflow-hidden bg-zinc-900">
      <AnimatePresence initial={false} custom={direction} mode="popLayout">
        <motion.div
          key={monthDate.toISOString()}
          custom={direction}
          variants={{
            enter:  (d: number) => ({ x: d > 0 ? "100%" : "-100%", opacity: 0 }),
            center: { x: 0, opacity: 1 },
            exit:   (d: number) => ({ x: d > 0 ? "-100%" : "100%", opacity: 0 }),
          }}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.38, ease: [0.4, 0, 0.2, 1] }}
          className="absolute inset-0 group"
        >
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
            className="absolute inset-0"
            style={{ background: `linear-gradient(to bottom, transparent 30%, ${accent}e6 100%)` }}
          />
          <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-500" />
          <div className="absolute bottom-4 left-4 md:bottom-6 md:left-6 text-white font-serif tracking-wide select-none drop-shadow-lg">
            <p className="m-0 text-[10px] md:text-xs tracking-[5px] uppercase opacity-90 font-sans font-medium">{label}</p>
            <p className="m-0 mt-1 md:mt-2 text-4xl md:text-5xl font-bold leading-none">{format(monthDate, "MMMM")}</p>
            <p className="m-0 mt-1 text-base md:text-lg font-normal opacity-85 font-sans">{format(monthDate, "yyyy")}</p>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}


function Toast({ message, visible }: { message: string; visible: boolean }) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          role="status"
          aria-live="polite"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 8 }}
          className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-5 py-3 rounded-full bg-zinc-900 text-white text-sm font-semibold shadow-2xl"
        >
          <Check size={15} className="text-emerald-400" aria-hidden />
          {message}
        </motion.div>
      )}
    </AnimatePresence>
  );
}


function ShortcutHints({ dark }: { dark: boolean }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const hints = [
    { key: "←  →", desc: "Prev / next month" },
    { key: "T",    desc: "Jump to today"      },
    { key: "Esc",  desc: "Clear selection"    },
  ];

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Show keyboard shortcuts"
        aria-expanded={open}
        className={`flex items-center gap-1.5 px-3 py-1.5 text-[11px] rounded-lg border transition-all active:scale-95 ${
          dark ? "border-zinc-700 bg-zinc-800 hover:bg-zinc-700 text-zinc-400"
               : "border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-500"
        }`}
      >
        <Keyboard size={12} aria-hidden />
        <span className="hidden sm:inline">Shortcuts</span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            role="tooltip"
            initial={{ opacity: 0, scale: 0.95, y: -4 }}
            animate={{ opacity: 1, scale: 1,    y: 0  }}
            exit={{   opacity: 0, scale: 0.95, y: -4  }}
            className={`absolute left-0 sm:left-auto sm:right-0 top-9 z-20 w-52 rounded-xl border p-3 shadow-xl text-xs ${
              dark ? "bg-zinc-800 border-zinc-700 text-zinc-300"
                   : "bg-white border-zinc-200 text-zinc-700"
            }`}
          >
            {hints.map(({ key, desc }) => (
              <div key={key} className={`flex justify-between py-1.5 border-b last:border-0 ${dark ? "border-zinc-700" : "border-zinc-100"}`}>
                <kbd className={`font-mono font-bold px-1.5 py-0.5 rounded text-[10px] ${dark ? "bg-zinc-700" : "bg-zinc-100"}`}>
                  {key}
                </kbd>
                <span className="opacity-75">{desc}</span>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}


function TagAnalytics({ notes, currentMonth, dark }: { notes: Note[]; currentMonth: Date; dark: boolean }) {
  const stats = useMemo(() => {
    const prefix = format(currentMonth, "yyyy-MM");
    const counts: Record<NoteTag, number> = { Work: 0, Personal: 0, Urgent: 0 };
    notes
      .filter((n) => n.start.startsWith(prefix) || n.end.startsWith(prefix))
      .forEach((n) => counts[n.tag]++);
    return counts;
  }, [notes, currentMonth]);

  if (stats.Work + stats.Personal + stats.Urgent === 0) return null;

  return (
    <div className={`flex flex-wrap gap-2 items-center text-[10px] md:text-[11px] px-3 py-2 rounded-xl ${dark ? "bg-zinc-800/60" : "bg-zinc-50"}`}>
      <span className={`font-bold uppercase tracking-widest ${dark ? "text-zinc-500" : "text-zinc-400"}`}>
        This month:
      </span>
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


function ConfirmClear({
  open, dark, accent, onConfirm, onCancel,
}: {
  open: boolean; dark: boolean; accent: string; onConfirm: () => void; onCancel: () => void;
}) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Confirm clear all notes"
          onClick={(e) => { if (e.target === e.currentTarget) onCancel(); }}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1,   opacity: 1 }}
            exit={{   scale: 0.9, opacity: 0 }}
            className={`w-full max-w-sm rounded-2xl p-6 shadow-2xl border ${
              dark ? "bg-zinc-900 border-zinc-700" : "bg-white border-zinc-200"
            }`}
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-full bg-red-100">
                <Trash2 size={18} className="text-red-600" aria-hidden />
              </div>
              <h3 className="font-semibold text-base">Clear all notes?</h3>
            </div>
            <p className={`text-sm mb-6 leading-relaxed ${dark ? "text-zinc-400" : "text-zinc-500"}`}>
              This will permanently delete all saved notes and cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={onCancel}
                className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all hover:scale-105 active:scale-95 ${
                  dark ? "border-zinc-700 hover:bg-zinc-800" : "border-zinc-200 hover:bg-zinc-50"
                }`}
              >
                Cancel
              </button>
              <button
                onClick={onConfirm}
                className="px-4 py-2 rounded-lg text-sm font-semibold bg-red-600 text-white hover:bg-red-700 transition-all hover:scale-105 active:scale-95"
              >
                Delete All
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}


function NoteCard({
  note, dark, accent, onDelete, onSaveEdit,
}: {
  note: Note; dark: boolean; accent: string;
  onDelete: (id: string) => void;
  onSaveEdit: (id: string, text: string, tag: NoteTag) => void;
}) {
  const [editing, setEditing]   = useState(false);
  const [editText, setEditText] = useState(note.text);
  const [editTag,  setEditTag]  = useState<NoteTag>(note.tag);
  const taRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (editing) taRef.current?.focus();
  }, [editing]);

  function handleSave() {
    const trimmed = editText.trim();
    if (trimmed) onSaveEdit(note.id, trimmed, editTag);
    setEditing(false);
  }

  function handleCancel() {
    setEditText(note.text);
    setEditTag(note.tag);
    setEditing(false);
  }

  const tagStyle = dark ? TAG_STYLES_DARK[editing ? editTag : note.tag] : TAG_STYLES[editing ? editTag : note.tag];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={`relative flex flex-col gap-2 p-3 md:p-4 rounded-xl border transition-colors group ${
        dark ? "bg-zinc-800/50 border-zinc-700/50" : "bg-zinc-50 border-zinc-100 hover:border-zinc-200"
      }`}
    >
      {/* Header row: tag + date + actions */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`text-[8px] md:text-[9px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-md ${tagStyle}`}>
            {editing ? editTag : note.tag}
          </span>
          <span className="text-[10px] md:text-[11px] font-mono text-zinc-400">
            {note.start === note.end
              ? format(new Date(note.start), "MMM d, yyyy")
              : `${format(new Date(note.start), "MMM d")} → ${format(new Date(note.end), "MMM d, yyyy")}`}
          </span>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {!editing && (
            <button
              onClick={() => setEditing(true)}
              aria-label="Edit note"
              className="p-1 text-zinc-400 hover:text-blue-500 transition-colors opacity-100 md:opacity-0 md:group-hover:opacity-100 focus:opacity-100"
            >
              <Pencil size={14} aria-hidden />
            </button>
          )}
          <button
            onClick={() => onDelete(note.id)}
            aria-label="Delete note"
            className="p-1 text-zinc-400 hover:text-red-500 transition-colors opacity-100 md:opacity-0 md:group-hover:opacity-100 focus:opacity-100"
          >
            <X size={16} aria-hidden />
          </button>
        </div>
      </div>

      {editing ? (
        <div className="flex flex-col gap-2">
          <div className="flex gap-2 flex-wrap">
            {(["Work", "Personal", "Urgent"] as NoteTag[]).map((t) => (
              <button
                key={t}
                onClick={() => setEditTag(t)}
                className={`text-[9px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-full border transition-all ${
                  editTag === t
                    ? (dark ? TAG_STYLES_DARK[t] : TAG_STYLES[t])
                    : (dark ? "bg-zinc-700 border-zinc-600 text-zinc-400" : "bg-zinc-100 border-zinc-200 text-zinc-500")
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          <textarea
            ref={taRef}
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            rows={3}
            className={`w-full p-2.5 text-sm rounded-lg border outline-none bg-transparent resize-y ${
              dark ? "border-zinc-600 text-zinc-200" : "border-zinc-300 text-zinc-900"
            }`}
            style={{ outlineColor: accent }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) handleSave();
              if (e.key === "Escape") handleCancel();
            }}
          />

          <div className="flex gap-2 justify-end">
            <button
              onClick={handleCancel}
              className={`px-3 py-1 text-xs rounded-lg border transition-all hover:scale-105 active:scale-95 ${
                dark ? "border-zinc-600 hover:bg-zinc-700" : "border-zinc-200 hover:bg-zinc-100"
              }`}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!editText.trim()}
              className="flex items-center gap-1 px-3 py-1 text-xs font-semibold text-white rounded-lg disabled:opacity-40 transition-all hover:scale-105 active:scale-95"
              style={{ backgroundColor: accent }}
            >
              <Save size={12} aria-hidden /> Save
            </button>
          </div>
        </div>
      ) : (
        <p className={`text-xs md:text-sm whitespace-pre-wrap leading-relaxed ${dark ? "text-zinc-300" : "text-zinc-700"}`}>
          {note.text}
        </p>
      )}
    </motion.div>
  );
}


export default function WallCalendar() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [direction,    setDirection]    = useState(0);   // +1 = forward, -1 = backward
  const [dark,         setDark]         = useState(false);
  const [rangeStart,   setRangeStart]   = useState<Date | null>(null);
  const [rangeEnd,     setRangeEnd]     = useState<Date | null>(null);
  const [hoverDate,    setHoverDate]    = useState<Date | null>(null);
  const [notes,        setNotes]        = useState<Note[]>([]);
  const [noteText,     setNoteText]     = useState("");
  const [selectedTag,  setSelectedTag]  = useState<NoteTag>("Work");
  const [apiHolidays,  setApiHolidays]  = useState<Record<string, string>>({});
  const [toast,        setToast]        = useState({ visible: false, message: "" });
  const [showClear,    setShowClear]    = useState(false);

  const { accent, label } = MONTH_THEMES[currentMonth.getMonth()];

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("wc-notes-v2");
      if (raw) setNotes(JSON.parse(raw));
    } catch (_) {}
  }, []);

  useEffect(() => {
    sessionStorage.setItem("wc-notes-v2", JSON.stringify(notes));
  }, [notes]);

  useEffect(() => {
    fetch(`https://date.nager.at/api/v3/PublicHolidays/${currentMonth.getFullYear()}/IN`)
      .then((r) => { if (!r.ok) throw new Error(); return r.json(); })
      .then((data: { date: string; localName: string; name: string }[]) => {
        const map: Record<string, string> = {};
        data.forEach(({ date, localName, name }) => {
          const [, m, d] = date.split("-");
          map[`${m}-${d}`] = localName || name;
        });
        setApiHolidays(map);
      })
      .catch(() => setApiHolidays({}));
  }, [currentMonth]);

  const ALL_HOLIDAYS = useMemo(
    () => Object.keys(apiHolidays).length > 0 ? apiHolidays : STATIC_HOLIDAYS,
    [apiHolidays]
  );

  const days = useMemo(() => {
    return eachDayOfInterval({
      start: startOfWeek(startOfMonth(currentMonth), { weekStartsOn: 1 }),
      end:   endOfWeek(endOfMonth(currentMonth),     { weekStartsOn: 1 }),
    });
  }, [currentMonth]);

  const effectiveEnd = useMemo(() => {
    if (rangeStart && !rangeEnd && hoverDate && hoverDate >= rangeStart) return hoverDate;
    return rangeEnd;
  }, [rangeStart, rangeEnd, hoverDate]);

  const handlePrevMonth = useCallback(() => {
    setDirection(-1);
    setCurrentMonth((p) => subMonths(p, 1));
  }, []);

  const handleNextMonth = useCallback(() => {
    setDirection(1);
    setCurrentMonth((p) => addMonths(p, 1));
  }, []);

  const handleDayClick = useCallback((date: Date) => {
    if (!isSameMonth(date, currentMonth)) return;
    if (!rangeStart || (rangeStart && rangeEnd)) {
      setRangeStart(date);
      setRangeEnd(null);
    } else {
      if (date < rangeStart) { setRangeEnd(rangeStart); setRangeStart(date); }
      else setRangeEnd(date);
      setHoverDate(null);
    }
  }, [rangeStart, rangeEnd, currentMonth]);

  const applyPreset = useCallback((preset: "today" | "week" | "month") => {
    const t = new Date();
    setCurrentMonth(t);
    if (preset === "today") { setRangeStart(t); setRangeEnd(t); }
    if (preset === "week")  { setRangeStart(startOfWeek(t, { weekStartsOn: 1 })); setRangeEnd(endOfWeek(t, { weekStartsOn: 1 })); }
    if (preset === "month") { setRangeStart(startOfMonth(t)); setRangeEnd(endOfMonth(t)); }
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLInputElement) return;
      if (e.key === "ArrowRight") handleNextMonth();
      if (e.key === "ArrowLeft")  handlePrevMonth();
      if (e.key === "t" || e.key === "T") applyPreset("today");
      if (e.key === "Escape") { setRangeStart(null); setRangeEnd(null); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [handleNextMonth, handlePrevMonth, applyPreset]);

  function showToast(message: string) {
    setToast({ visible: true, message });
    setTimeout(() => setToast({ visible: false, message: "" }), 2400);
  }

  function saveNote() {
    const trimmed = noteText.trim();
    if (!trimmed || !rangeStart) return;
    setNotes((prev) => [
      ...prev,
      {
        id:    uid(),
        start: format(rangeStart, "yyyy-MM-dd"),
        end:   format(rangeEnd ?? rangeStart, "yyyy-MM-dd"),
        text:  trimmed,
        tag:   selectedTag,
      },
    ]);
    setNoteText("");
  }

  function deleteNote(id: string) {
    setNotes((prev) => prev.filter((n) => n.id !== id));
  }

  function saveEdit(id: string, text: string, tag: NoteTag) {
    setNotes((prev) => prev.map((n) => n.id === id ? { ...n, text, tag } : n));
    showToast("Note updated");
  }

  function clearAllNotes() {
    setNotes([]);
    setShowClear(false);
    showToast("All notes cleared");
  }

  function copyAgenda() {
    if (!notes.length) return;
    const lines = notes.map((n) => `[${n.tag}] ${n.start}${n.end !== n.start ? ` → ${n.end}` : ""}: ${n.text}`);
    navigator.clipboard.writeText(`📅 Agenda:\n${lines.join("\n")}`).then(() => showToast("Agenda copied!"));
  }

  function exportNotes() {
    if (!notes.length) return;
    const lines = [
      "Wall Calendar — Agenda Export",
      `Generated: ${format(new Date(), "PPpp")}`,
      "─".repeat(40),
      ...notes.map((n) =>
        `[${n.tag}] ${n.start}${n.end !== n.start ? ` → ${n.end}` : ""}\n${n.text}`
      ),
    ];
    const blob = new Blob([lines.join("\n\n")], { type: "text/plain" });
    const url  = URL.createObjectURL(blob);
    const a    = Object.assign(document.createElement("a"), { href: url, download: `agenda-${format(new Date(), "yyyy-MM-dd")}.txt` });
    a.click();
    URL.revokeObjectURL(url);
    showToast("Notes exported!");
  }

  const spanDays = rangeStart && rangeEnd
    ? Math.abs(differenceInDays(rangeEnd, rangeStart)) + 1
    : rangeStart ? 1 : 0;

  const bg      = dark ? "bg-zinc-950 text-zinc-200" : "bg-[#f4f2ec] text-zinc-900";
  const surface = dark ? "bg-zinc-900 border-zinc-800 shadow-2xl shadow-black/80"
                       : "bg-white border-[#e8e4de] shadow-2xl shadow-black/10";
  const border  = dark ? "border-zinc-800" : "border-[#e0dbd1]";
  const muted   = dark ? "text-zinc-500"   : "text-zinc-400";

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center p-3 sm:p-6 md:p-12 transition-colors duration-500 ${bg}`}>
      <div className="w-full max-w-[1040px]">

        <div className="flex justify-between items-center mb-4 md:mb-6">
          <ShortcutHints dark={dark} />
          <button
            onClick={() => setDark((d) => !d)}
            aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
            className={`flex items-center gap-2 px-4 md:px-5 py-2 rounded-full text-[11px] md:text-xs font-semibold border transition-all active:scale-95 ${
              dark ? "border-zinc-800 bg-zinc-900 hover:bg-zinc-800 text-zinc-300"
                   : "border-zinc-300 bg-white hover:bg-zinc-50 text-zinc-600 shadow-sm"
            }`}
          >
            {dark ? <Sun size={14} aria-hidden /> : <Moon size={14} aria-hidden />}
            {dark ? "Light" : "Dark"}
          </button>
        </div>

        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0,  opacity: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className={`rounded-3xl overflow-hidden border ${surface}`}
        >
          <SpiralBinding accent={accent} />

          <div className="flex flex-col md:grid md:grid-cols-5">

            <div className="md:col-span-2">
              <HeroPanel monthDate={currentMonth} accent={accent} label={label} direction={direction} />
            </div>

            <div className={`p-4 sm:p-6 md:p-10 flex flex-col gap-6 md:gap-8 md:col-span-3 border-t md:border-t-0 md:border-l ${border}`}>

              <div className="flex flex-wrap items-center gap-2 md:gap-3">
                <span className={`text-[10px] font-bold uppercase tracking-widest hidden sm:inline-block ${muted}`}>Presets</span>
                {([
                  ["today", <Clock size={12} aria-hidden />,          "Today"],
                  ["week",  <CalendarDays size={12} aria-hidden />,   "Week" ],
                  ["month", <CalendarSearch size={12} aria-hidden />, "Month"],
                ] as const).map(([p, icon, txt]) => (
                  <button
                    key={p}
                    onClick={() => applyPreset(p)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 text-[11px] md:text-xs rounded-lg transition-all hover:scale-105 active:scale-95 ${
                      dark ? "bg-zinc-800 hover:bg-zinc-700" : "bg-zinc-100 hover:bg-zinc-200"
                    }`}
                  >
                    {icon} {txt}
                  </button>
                ))}
              </div>

              <div className="flex items-center justify-between" role="region" aria-label="Month navigation">
                <button
                  onClick={handlePrevMonth}
                  aria-label="Previous month"
                  className={`p-2.5 rounded-full border transition-all hover:scale-110 active:scale-90 shadow-sm ${
                    dark ? "border-zinc-700 bg-zinc-800 hover:bg-zinc-700" : "border-zinc-200 bg-white hover:bg-zinc-50"
                  }`}
                >
                  <ChevronLeft size={18} className={dark ? "text-zinc-300" : "text-zinc-600"} aria-hidden />
                </button>

                <h2 className="font-serif text-2xl md:text-3xl font-bold select-none tracking-tight" aria-live="polite">
                  {format(currentMonth, "MMMM yyyy")}
                </h2>

                <button
                  onClick={handleNextMonth}
                  aria-label="Next month"
                  className={`p-2.5 rounded-full border transition-all hover:scale-110 active:scale-90 shadow-sm ${
                    dark ? "border-zinc-700 bg-zinc-800 hover:bg-zinc-700" : "border-zinc-200 bg-white hover:bg-zinc-50"
                  }`}
                >
                  <ChevronRight size={18} className={dark ? "text-zinc-300" : "text-zinc-600"} aria-hidden />
                </button>
              </div>

              <div className="grid grid-cols-7 gap-1 md:gap-1.5" role="row">
                {DAYS_OF_WEEK.map((day) => (
                  <div
                    key={day}
                    role="columnheader"
                    className={`text-center text-[10px] md:text-[11px] font-bold uppercase tracking-widest ${
                      day === "Sat" || day === "Sun" ? "" : muted
                    }`}
                    style={{ color: day === "Sat" || day === "Sun" ? accent : undefined }}
                  >
                    {day}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1 md:gap-1.5" role="grid" aria-label="Calendar days">
                {days.map((day) => {
                  const inCurrent = isSameMonth(day, currentMonth);
                  const isToday   = isSameDay(day, new Date());
                  const holiday   = ALL_HOLIDAYS[format(day, "MM-dd")];
                  const weekend   = isWeekend(day);
                  const isStart   = rangeStart   != null && isSameDay(day, rangeStart);
                  const isEnd     = effectiveEnd != null && isSameDay(day, effectiveEnd);
                  const inRange   = rangeStart != null && effectiveEnd != null && day > rangeStart && day < effectiveEnd;
                  const selected  = isStart || isEnd;

                  return (
                    <motion.button
                      key={day.toISOString()}
                      role="gridcell"
                      whileTap={{ scale: 0.88 }}
                      onClick={() => handleDayClick(day)}
                      onMouseEnter={() => setHoverDate(day)}
                      title={holiday}
                      aria-label={`${format(day, "MMMM d")}${holiday ? `, ${holiday}` : ""}${selected ? ", selected" : ""}${isToday ? ", today" : ""}`}
                      aria-pressed={selected}
                      aria-disabled={!inCurrent}
                      disabled={!inCurrent}
                      className={`relative flex flex-col items-center justify-center h-10 sm:h-12 md:h-14 rounded-xl text-xs sm:text-sm select-none transition-all border ${
                        inRange && !selected ? "border-dashed" : "border-solid"
                      } ${!inCurrent ? "opacity-30 cursor-default" : "cursor-pointer active:scale-95"}`}
                      style={{
                        backgroundColor: selected ? accent : inRange ? `${accent}22` : "transparent",
                        color: selected ? "#fff" : weekend && inCurrent ? accent : "inherit",
                        fontWeight: selected || isToday ? 700 : 500,
                        borderColor: selected  ? "transparent"
                                   : inRange   ? `${accent}66`
                                   : isToday   ? accent
                                   : dark      ? "#27272a" : "#f4f4f5",
                        boxShadow: selected ? `0 4px 12px ${accent}66` : undefined,
                      }}
                    >
                      {format(day, "d")}
                      {holiday && (
                        <span
                          aria-hidden
                          className="absolute bottom-1 w-1 md:w-1.5 h-1 md:h-1.5 rounded-full"
                          style={{ backgroundColor: selected ? "#fff" : accent }}
                        />
                      )}
                    </motion.button>
                  );
                })}
              </div>

              <hr className={`border-0 border-t ${border}`} />

              <section aria-label="Agenda notes" className="flex flex-col gap-4">

                <div className="flex items-center justify-between flex-wrap gap-2">
                  <h3
                    className="text-[11px] md:text-[12px] font-bold tracking-[2px] md:tracking-[4px] uppercase flex items-center gap-2"
                    style={{ color: accent }}
                  >
                    <Tag size={12} aria-hidden /> Agenda
                  </h3>

                  <div className="flex items-center gap-2 flex-wrap">
                    {spanDays > 0 && (
                      <span className={`text-[10px] font-mono font-medium px-2 py-0.5 rounded-md ${dark ? "bg-zinc-800 text-zinc-300" : "bg-zinc-100 text-zinc-600"}`}>
                        {spanDays} day{spanDays !== 1 && "s"}
                      </span>
                    )}

                    {notes.length > 0 && (
                      <>
                        <button
                          onClick={copyAgenda}
                          aria-label="Copy all notes to clipboard"
                          className={`flex items-center gap-1 px-2.5 py-1 text-[10px] font-semibold rounded-lg border transition-all hover:scale-105 active:scale-95 ${
                            dark ? "border-zinc-700 bg-zinc-800 hover:bg-zinc-700 text-zinc-300"
                                 : "border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-600 shadow-sm"
                          }`}
                        >
                          <Copy size={11} aria-hidden /> Copy
                        </button>

                        <button
                          onClick={exportNotes}
                          aria-label="Export notes as .txt file"
                          className={`flex items-center gap-1 px-2.5 py-1 text-[10px] font-semibold rounded-lg border transition-all hover:scale-105 active:scale-95 ${
                            dark ? "border-zinc-700 bg-zinc-800 hover:bg-zinc-700 text-zinc-300"
                                 : "border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-600 shadow-sm"
                          }`}
                        >
                          <Download size={11} aria-hidden /> Export
                        </button>

                        <button
                          onClick={() => setShowClear(true)}
                          aria-label="Clear all notes"
                          className="flex items-center gap-1 px-2.5 py-1 text-[10px] font-semibold rounded-lg border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 transition-all hover:scale-105 active:scale-95"
                        >
                          <Trash2 size={11} aria-hidden /> Clear
                        </button>
                      </>
                    )}
                  </div>
                </div>

                <TagAnalytics notes={notes} currentMonth={currentMonth} dark={dark} />

                <p className="text-xs md:text-[13px] font-mono leading-relaxed truncate" style={{ color: dark ? "#888" : "#666" }}>
                  {!rangeStart
                    ? "No dates selected."
                    : !rangeEnd || isSameDay(rangeStart, rangeEnd)
                    ? format(rangeStart, "MMMM d, yyyy")
                    : `${format(rangeStart, "MMM d")}  —  ${format(rangeEnd, "MMM d, yyyy")}`}
                </p>

                <textarea
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  disabled={!rangeStart}
                  placeholder={rangeStart ? "Document events, plans, reminders…" : "Select dates to unlock notes…"}
                  aria-label="New note text"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) saveNote();
                  }}
                  className={`w-full p-3 md:p-4 text-sm rounded-xl border outline-none bg-transparent transition-all focus:shadow-md resize-y min-h-[80px] md:min-h-[90px] ${
                    dark ? "border-zinc-700 text-zinc-200" : "border-zinc-300 text-zinc-900 focus:border-zinc-400"
                  } ${!rangeStart ? "opacity-40" : ""}`}
                  style={{ outlineColor: accent }}
                />

                <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-opacity ${!rangeStart ? "opacity-40 pointer-events-none" : ""}`}>
                  <div className="flex gap-2 flex-wrap" role="group" aria-label="Note category">
                    {(["Work", "Personal", "Urgent"] as NoteTag[]).map((tag) => (
                      <button
                        key={tag}
                        onClick={() => setSelectedTag(tag)}
                        aria-pressed={selectedTag === tag}
                        className={`text-[9px] md:text-[10px] uppercase font-bold tracking-wider px-3 py-1.5 rounded-full border transition-all ${
                          selectedTag === tag
                            ? (dark ? TAG_STYLES_DARK[tag] : TAG_STYLES[tag])
                            : (dark ? "bg-zinc-800 border-zinc-700 text-zinc-400 hover:text-zinc-200"
                                    : "bg-zinc-50 border-zinc-200 text-zinc-500 hover:text-zinc-700")
                        }`}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={saveNote}
                    disabled={!rangeStart || !noteText.trim()}
                    aria-label="Save note (Ctrl+Enter)"
                    className="w-full sm:w-auto px-6 py-2 md:py-2.5 rounded-full text-[12px] md:text-[13px] font-bold text-white transition-all hover:scale-105 active:scale-95 disabled:opacity-30 disabled:hover:scale-100 shadow-md"
                    style={{ backgroundColor: accent }}
                  >
                    Save{" "}
                    <span className="hidden md:inline opacity-60 text-[10px] font-normal">Ctrl+↵</span>
                  </button>
                </div>

                <AnimatePresence mode="popLayout">
                  {notes.map((note) => (
                    <NoteCard
                      key={note.id}
                      note={note}
                      dark={dark}
                      accent={accent}
                      onDelete={deleteNote}
                      onSaveEdit={saveEdit}
                    />
                  ))}
                </AnimatePresence>

              </section>
            </div>
          </div>
        </motion.div>

        <p className="text-center mt-6 md:mt-8 text-[10px] md:text-[11px] font-medium tracking-wide text-zinc-500 uppercase">
          Production Grade Planning Tool
        </p>
      </div>

      <ConfirmClear
        open={showClear}
        dark={dark}
        accent={accent}
        onConfirm={clearAllNotes}
        onCancel={() => setShowClear(false)}
      />

      <Toast message={toast.message} visible={toast.visible} />
    </div>
  );
}