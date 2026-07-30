"use client";

import {
  MousePointer2,
  Hand,
  Square,
  Diamond,
  Circle,
  Minus,
  Pencil,
  Eraser,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Tool } from "../Canvas";

export interface DrawingToolbarProps {
  selectedTool: Tool;
  setSelectedTool: (tool: Tool) => void;
  strokeColor: string;
  setStrokeColor: (color: string) => void;
  strokeWidth: number;
  setStrokeWidth: (width: number) => void;
  onDeleteSelected?: () => void;
}

const tools: { id: Tool; icon: typeof Square; label: string; shortcut: string }[] = [
  { id: "select", icon: MousePointer2, label: "Select", shortcut: "V" },
  { id: "hand", icon: Hand, label: "Pan", shortcut: "H" },
  { id: "rect", icon: Square, label: "Rectangle", shortcut: "R" },
  { id: "rhombus", icon: Diamond, label: "Diamond", shortcut: "D" },
  { id: "circle", icon: Circle, label: "Ellipse", shortcut: "O" },
  { id: "line", icon: Minus, label: "Line", shortcut: "L" },
  { id: "pencil", icon: Pencil, label: "Draw", shortcut: "P" },
  { id: "eraser", icon: Eraser, label: "Eraser", shortcut: "E" },
];

const palette = ["#e3e3e8", "#ff8383", "#7cf5a0", "#7cb8ff", "#ffd166", "#c792ff"];
const widths = [
  { value: 2, label: "Thin" },
  { value: 4, label: "Bold" },
  { value: 7, label: "Extra" },
];

export function DrawingToolbar({
  selectedTool,
  setSelectedTool,
  strokeColor,
  setStrokeColor,
  strokeWidth,
  setStrokeWidth,
  onDeleteSelected,
}: DrawingToolbarProps) {
  return (
    <div className="pointer-events-none fixed inset-x-0 top-4 z-50 flex justify-center px-4">
      <div className="pointer-events-auto flex items-center gap-1 rounded-2xl border border-white/10 bg-zinc-900/70 p-1.5 shadow-2xl shadow-black/40 backdrop-blur-xl">
        {/* Tools */}
        {tools.map(({ id, icon: Icon, label, shortcut }) => (
          <button
            key={id}
            onClick={() => setSelectedTool(id)}
            title={`${label} — ${shortcut}`}
            aria-label={label}
            aria-pressed={selectedTool === id}
            className={cn(
              "group relative flex h-10 w-10 items-center justify-center rounded-xl transition-colors",
              selectedTool === id
                ? "bg-[#7c5cff] text-white shadow-lg shadow-[#7c5cff]/30"
                : "text-zinc-300 hover:bg-white/10 hover:text-white"
            )}
          >
            <Icon className="h-[18px] w-[18px]" />
            <span className="pointer-events-none absolute -bottom-1 right-1 text-[9px] font-medium opacity-40">
              {shortcut}
            </span>
          </button>
        ))}

        <div className="mx-1 h-7 w-px bg-white/10" />

        {/* Color palette */}
        <div className="flex items-center gap-1 px-1">
          {palette.map((c) => (
            <button
              key={c}
              onClick={() => setStrokeColor(c)}
              title={c}
              aria-label={`Color ${c}`}
              className={cn(
                "h-6 w-6 rounded-full border transition-transform hover:scale-110",
                strokeColor.toLowerCase() === c.toLowerCase()
                  ? "border-white ring-2 ring-white/60"
                  : "border-white/20"
              )}
              style={{ backgroundColor: c }}
            />
          ))}
          <label
            className="relative h-6 w-6 cursor-pointer overflow-hidden rounded-full border border-white/20"
            title="Custom color"
          >
            <span
              className="block h-full w-full"
              style={{
                background:
                  "conic-gradient(red, orange, yellow, lime, cyan, blue, magenta, red)",
              }}
            />
            <input
              type="color"
              value={strokeColor}
              onChange={(e) => setStrokeColor(e.target.value)}
              className="absolute inset-0 cursor-pointer opacity-0"
            />
          </label>
        </div>

        <div className="mx-1 h-7 w-px bg-white/10" />

        {/* Stroke width */}
        <div className="flex items-center gap-1 px-1">
          {widths.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => setStrokeWidth(value)}
              title={`${label} stroke`}
              aria-label={`${label} stroke`}
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-lg transition-colors",
                strokeWidth === value ? "bg-white/15" : "hover:bg-white/10"
              )}
            >
              <span
                className="rounded-full bg-current text-zinc-200"
                style={{ width: 18, height: value }}
              />
            </button>
          ))}
        </div>

        {selectedTool === "select" && onDeleteSelected && (
          <>
            <div className="mx-1 h-7 w-px bg-white/10" />
            <button
              onClick={onDeleteSelected}
              title="Delete selected — Del"
              aria-label="Delete selected"
              className="flex h-10 w-10 items-center justify-center rounded-xl text-zinc-300 transition-colors hover:bg-red-500/20 hover:text-red-300"
            >
              <Trash2 className="h-[18px] w-[18px]" />
            </button>
          </>
        )}
      </div>
    </div>
  );
}
