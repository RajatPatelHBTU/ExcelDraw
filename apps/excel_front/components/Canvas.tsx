"use client";
import { useEffect, useRef, useState } from "react";
import { Minus, Plus, Maximize } from "lucide-react";
import { DrawingToolbar } from "@/components/canvas/navbar";
import { Game } from "@/draw/Game";
import { useThemeStore } from "@/lib/theme";

// Default stroke per theme so freshly drawn shapes stay visible on either canvas.
const DARK_STROKE = "#e3e3e8";
const LIGHT_STROKE = "#1f1f23";

export type Tool =
  | "select"
  | "hand"
  | "rect"
  | "circle"
  | "line"
  | "rhombus"
  | "pencil"
  | "eraser";

const SHORTCUTS: Record<string, Tool> = {
  v: "select",
  h: "hand",
  r: "rect",
  d: "rhombus",
  o: "circle",
  c: "circle",
  l: "line",
  p: "pencil",
  e: "eraser",
};

const cursorFor = (tool: Tool): string => {
  switch (tool) {
    case "hand":
      return "grab";
    case "select":
      return "default";
    case "eraser":
      return "cell";
    default:
      return "crosshair";
  }
};

export function Canvas({ roomId, socket }: { roomId: string; socket: WebSocket }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [game, setGame] = useState<Game>();
  const [selectedTool, setSelectedTool] = useState<Tool>("pencil");
  const theme = useThemeStore((s) => s.theme);
  const [strokeColor, setStrokeColor] = useState(
    theme === "light" ? LIGHT_STROKE : DARK_STROKE
  );
  const [strokeWidth, setStrokeWidth] = useState(2);
  const [zoom, setZoom] = useState(1);

  // create the engine once the canvas + socket are ready
  useEffect(() => {
    if (!canvasRef.current || !socket) return;
    const g = new Game(canvasRef.current, roomId, socket, theme);
    g.onZoomChange = (z) => setZoom(z);
    setGame(g);
    return () => g.destroy();
    // theme intentionally excluded — re-theming is handled below without
    // recreating the engine (which would wipe the in-progress drawing).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId, socket]);

  // re-theme the engine live, and swap the default stroke so drawing stays
  // visible when the user flips light/dark.
  useEffect(() => {
    game?.setTheme(theme);
    setStrokeColor((c) =>
      c === DARK_STROKE || c === LIGHT_STROKE
        ? theme === "light"
          ? LIGHT_STROKE
          : DARK_STROKE
        : c
    );
  }, [theme, game]);

  // keep the engine in sync with React state
  useEffect(() => {
    game?.setTool(selectedTool);
  }, [selectedTool, game]);

  useEffect(() => {
    game?.setStyle({ color: strokeColor, width: strokeWidth });
  }, [strokeColor, strokeWidth, game]);

  // responsive canvas
  useEffect(() => {
    const onResize = () => game?.resize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [game]);

  // keyboard shortcuts
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA")) return;
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      const tool = SHORTCUTS[e.key.toLowerCase()];
      if (tool) setSelectedTool(tool);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <main className="relative h-screen w-screen overflow-hidden bg-[hsl(var(--canvas-bg))]">
      <DrawingToolbar
        selectedTool={selectedTool}
        setSelectedTool={setSelectedTool}
        strokeColor={strokeColor}
        setStrokeColor={setStrokeColor}
        strokeWidth={strokeWidth}
        setStrokeWidth={setStrokeWidth}
        onDeleteSelected={() => game?.deleteSelected()}
      />

      <canvas
        ref={canvasRef}
        className="absolute inset-0 h-full w-full touch-none"
        style={{ cursor: cursorFor(selectedTool) }}
      />

      {/* Zoom control */}
      <div className="pointer-events-auto fixed bottom-5 left-5 z-50 flex items-center gap-1 rounded-xl border border-white/10 bg-zinc-900/70 p-1 shadow-xl backdrop-blur-xl">
        <button
          onClick={() => game?.zoomOut()}
          aria-label="Zoom out"
          className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-300 hover:bg-white/10 hover:text-white"
        >
          <Minus className="h-4 w-4" />
        </button>
        <button
          onClick={() => game?.resetView()}
          title="Reset view"
          className="min-w-[3.5rem] rounded-lg px-2 py-1 text-center text-xs font-medium text-zinc-200 hover:bg-white/10"
        >
          {Math.round(zoom * 100)}%
        </button>
        <button
          onClick={() => game?.zoomIn()}
          aria-label="Zoom in"
          className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-300 hover:bg-white/10 hover:text-white"
        >
          <Plus className="h-4 w-4" />
        </button>
        <button
          onClick={() => game?.resetView()}
          aria-label="Fit to screen"
          className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-300 hover:bg-white/10 hover:text-white"
        >
          <Maximize className="h-4 w-4" />
        </button>
      </div>
    </main>
  );
}
