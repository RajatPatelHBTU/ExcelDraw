import { Tool } from "@/components/Canvas";
import { getExistingShape } from "./http";

/* ------------------------------------------------------------------ */
/*  Shape model                                                        */
/* ------------------------------------------------------------------ */

export type Point = { x: number; y: number };

type StyledShape = {
  /** Stable id used for dedupe, selection, move and erase. */
  id: string;
  strokeColor?: string;
  strokeWidth?: number;
};

type ShapeGeometry =
  | { type: "rect"; x: number; y: number; width: number; height: number }
  | { type: "circle"; centerX: number; centerY: number; radius: number }
  | { type: "line"; startX: number; startY: number; endX: number; endY: number }
  | { type: "rhombus"; x: number; y: number; width: number; height: number }
  | { type: "pencil"; points: Point[] };

export type Shape = StyledShape & ShapeGeometry;

/**
 * Messages exchanged over the (re-used) "chat" channel. A message is either a
 * raw shape (create) or one of these control markers. Because the websocket
 * backend just persists + rebroadcasts the JSON string blindly, erase and move
 * become collaborative AND durable with zero backend changes.
 */
type WireMessage =
  | Shape
  | { type: "delete"; ids: string[] }
  | { type: "update"; shape: Shape };

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const DEFAULT_COLOR = "#e3e3e8";
const DEFAULT_WIDTH = 2;
const SELECT_COLOR = "#7c5cff";
const MIN_SCALE = 0.1;
const MAX_SCALE = 8;
const GRID_SIZE = 40;

export type CanvasTheme = "light" | "dark";
const GRID_COLOR: Record<CanvasTheme, string> = {
  dark: "rgba(160,130,255,0.10)",
  light: "rgba(30,30,45,0.06)",
};

const newId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.floor(Math.random() * 1e9)}`;

/* ------------------------------------------------------------------ */
/*  Game engine                                                        */
/* ------------------------------------------------------------------ */

export class Game {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private shapes: Shape[] = [];
  private roomId: string;
  private socket: WebSocket;

  // interaction state
  private selectedTool: Tool = "pencil";
  private strokeColor = DEFAULT_COLOR;
  private strokeWidth = DEFAULT_WIDTH;
  private clicked = false;
  private startX = 0; // world coords
  private startY = 0;
  private pencilPoints: Point[] = [];
  private erasedIds = new Set<string>();

  // selection / move state
  private selectedId: string | null = null;
  private draggingShape = false;
  private dragOffset: Point = { x: 0, y: 0 };

  // viewport (pan + zoom)
  private scale = 1;
  private offsetX = 0;
  private offsetY = 0;
  private panning = false;
  private panStart: Point = { x: 0, y: 0 };
  private spaceDown = false;
  private dpr = 1;
  private theme: CanvasTheme = "dark";

  // callbacks for React
  onZoomChange?: (zoom: number) => void;

  constructor(
    canvas: HTMLCanvasElement,
    roomId: string,
    socket: WebSocket,
    theme: CanvasTheme = "dark"
  ) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d")!;
    this.roomId = roomId;
    this.socket = socket;
    this.theme = theme;

    this.resize();
    this.initHandlers();
    this.init();
  }

  /* ----------------------------- public API ----------------------- */

  setTheme(theme: CanvasTheme) {
    this.theme = theme;
    this.render();
  }

  setTool(tool: Tool) {
    this.selectedTool = tool;
    if (tool !== "select") this.selectedId = null;
    this.render();
  }

  setStyle(style: { color?: string; width?: number }) {
    if (style.color !== undefined) this.strokeColor = style.color;
    if (style.width !== undefined) this.strokeWidth = style.width;
    // live-apply to the currently selected shape
    if (this.selectedId) {
      const shape = this.shapes.find((s) => s.id === this.selectedId);
      if (shape) {
        if (style.color !== undefined) shape.strokeColor = style.color;
        if (style.width !== undefined) shape.strokeWidth = style.width;
        this.broadcast({ type: "update", shape });
        this.render();
      }
    }
  }

  deleteSelected() {
    if (!this.selectedId) return;
    const id = this.selectedId;
    this.shapes = this.shapes.filter((s) => s.id !== id);
    this.selectedId = null;
    this.broadcast({ type: "delete", ids: [id] });
    this.render();
  }

  zoomIn() {
    this.zoomAt(this.canvas.clientWidth / 2, this.canvas.clientHeight / 2, 1.2);
  }
  zoomOut() {
    this.zoomAt(this.canvas.clientWidth / 2, this.canvas.clientHeight / 2, 1 / 1.2);
  }
  resetView() {
    this.scale = 1;
    this.offsetX = 0;
    this.offsetY = 0;
    this.onZoomChange?.(1);
    this.render();
  }

  resize() {
    this.dpr = window.devicePixelRatio || 1;
    const w = this.canvas.clientWidth || window.innerWidth;
    const h = this.canvas.clientHeight || window.innerHeight;
    this.canvas.width = Math.round(w * this.dpr);
    this.canvas.height = Math.round(h * this.dpr);
    this.render();
  }

  destroy() {
    this.canvas.removeEventListener("mousedown", this.handleMouseDown);
    this.canvas.removeEventListener("mouseup", this.handleMouseUp);
    this.canvas.removeEventListener("mousemove", this.handleMouseMove);
    this.canvas.removeEventListener("wheel", this.handleWheel);
    window.removeEventListener("keydown", this.handleKeyDown);
    window.removeEventListener("keyup", this.handleKeyUp);
  }

  /* ----------------------------- setup ---------------------------- */

  private async init() {
    try {
      const existing = (await getExistingShape(this.roomId)) as WireMessage[];
      existing.forEach((msg) => this.applyMessage(msg));
    } catch (e) {
      console.error("Failed to load existing shapes", e);
    }
    this.render();
  }

  private initHandlers() {
    this.canvas.addEventListener("mousedown", this.handleMouseDown);
    this.canvas.addEventListener("mouseup", this.handleMouseUp);
    this.canvas.addEventListener("mousemove", this.handleMouseMove);
    this.canvas.addEventListener("wheel", this.handleWheel, { passive: false });
    window.addEventListener("keydown", this.handleKeyDown);
    window.addEventListener("keyup", this.handleKeyUp);

    this.socket.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        if (message.type !== "chat") return;
        const parsed = JSON.parse(message.message) as WireMessage;
        this.applyMessage(parsed);
        this.render();
      } catch (e) {
        console.warn("Bad socket message", e);
      }
    };
  }

  /** Fold a wire message into local state. */
  private applyMessage(msg: WireMessage) {
    if ("type" in msg && msg.type === "delete") {
      const ids = new Set(msg.ids);
      this.shapes = this.shapes.filter((s) => !ids.has(s.id));
      return;
    }
    if ("type" in msg && msg.type === "update") {
      const idx = this.shapes.findIndex((s) => s.id === msg.shape.id);
      if (idx >= 0) this.shapes[idx] = msg.shape;
      else this.shapes.push(msg.shape);
      return;
    }
    // otherwise it's a shape (create) — dedupe by id (handles server echo)
    const shape = msg as Shape;
    if (!shape.id) shape.id = newId();
    if (!this.shapes.some((s) => s.id === shape.id)) this.shapes.push(shape);
  }

  private broadcast(msg: WireMessage) {
    if (this.socket.readyState !== WebSocket.OPEN) return;
    this.socket.send(
      JSON.stringify({
        type: "chat",
        message: JSON.stringify(msg),
        roomId: this.roomId,
      })
    );
  }

  /* ------------------------- coordinate math ---------------------- */

  /** Convert a mouse event to canvas-local (screen) pixels. */
  private screenPoint(e: MouseEvent): Point {
    const rect = this.canvas.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }

  /** Convert canvas-local screen pixels to world coordinates. */
  private toWorld(sx: number, sy: number): Point {
    return { x: (sx - this.offsetX) / this.scale, y: (sy - this.offsetY) / this.scale };
  }

  private worldPoint(e: MouseEvent): Point {
    const s = this.screenPoint(e);
    return this.toWorld(s.x, s.y);
  }

  private zoomAt(sx: number, sy: number, factor: number) {
    const newScale = clamp(this.scale * factor, MIN_SCALE, MAX_SCALE);
    const world = this.toWorld(sx, sy);
    this.scale = newScale;
    this.offsetX = sx - world.x * newScale;
    this.offsetY = sy - world.y * newScale;
    this.onZoomChange?.(this.scale);
    this.render();
  }

  /* ----------------------------- input ---------------------------- */

  private handleWheel = (e: WheelEvent) => {
    e.preventDefault();
    const { x, y } = this.screenPoint(e);
    if (e.ctrlKey || e.metaKey) {
      // pinch / ctrl+wheel → zoom
      const factor = e.deltaY < 0 ? 1.1 : 1 / 1.1;
      this.zoomAt(x, y, factor);
    } else {
      // plain wheel → pan
      this.offsetX -= e.deltaX;
      this.offsetY -= e.deltaY;
      this.render();
    }
  };

  private handleMouseDown = (e: MouseEvent) => {
    const screen = this.screenPoint(e);
    const world = this.toWorld(screen.x, screen.y);

    // pan: hand tool, space held, or middle mouse
    if (this.selectedTool === "hand" || this.spaceDown || e.button === 1) {
      this.panning = true;
      this.panStart = { x: e.clientX - this.offsetX, y: e.clientY - this.offsetY };
      return;
    }

    this.startX = world.x;
    this.startY = world.y;
    this.clicked = true;

    if (this.selectedTool === "select") {
      const hit = this.hitTest(world.x, world.y);
      this.selectedId = hit ? hit.id : null;
      if (hit) {
        this.draggingShape = true;
        const b = bounds(hit);
        this.dragOffset = { x: world.x - b.minX, y: world.y - b.minY };
      }
      this.render();
      return;
    }

    if (this.selectedTool === "pencil") {
      this.pencilPoints = [{ x: world.x, y: world.y }];
    }

    if (this.selectedTool === "eraser") {
      this.erasedIds.clear();
      this.eraseAt(world.x, world.y);
    }
  };

  private handleMouseMove = (e: MouseEvent) => {
    if (this.panning) {
      this.offsetX = e.clientX - this.panStart.x;
      this.offsetY = e.clientY - this.panStart.y;
      this.render();
      return;
    }
    if (!this.clicked) return;

    const world = this.worldPoint(e);

    if (this.selectedTool === "select") {
      if (this.draggingShape && this.selectedId) {
        const shape = this.shapes.find((s) => s.id === this.selectedId);
        if (shape) {
          const b = bounds(shape);
          const targetX = world.x - this.dragOffset.x;
          const targetY = world.y - this.dragOffset.y;
          translateShape(shape, targetX - b.minX, targetY - b.minY);
          this.render();
        }
      }
      return;
    }

    if (this.selectedTool === "eraser") {
      this.eraseAt(world.x, world.y);
      return;
    }

    if (this.selectedTool === "pencil") {
      this.pencilPoints.push(world);
      this.render();
      this.drawShape(this.previewShape(world)!, false);
      return;
    }

    // rect / circle / line / rhombus live preview
    this.render();
    const preview = this.previewShape(world);
    if (preview) this.drawShape(preview, false);
  };

  private handleMouseUp = (e: MouseEvent) => {
    if (this.panning) {
      this.panning = false;
      return;
    }
    if (!this.clicked) return;
    this.clicked = false;

    if (this.selectedTool === "select") {
      if (this.draggingShape && this.selectedId) {
        const shape = this.shapes.find((s) => s.id === this.selectedId);
        if (shape) this.broadcast({ type: "update", shape });
      }
      this.draggingShape = false;
      return;
    }

    if (this.selectedTool === "eraser") {
      if (this.erasedIds.size > 0) {
        this.broadcast({ type: "delete", ids: [...this.erasedIds] });
        this.erasedIds.clear();
      }
      return;
    }

    const world = this.worldPoint(e);
    const shape = this.buildShape(world);
    if (shape) {
      this.shapes.push(shape);
      this.broadcast(shape);
    }
    this.pencilPoints = [];
    this.render();
  };

  private handleKeyDown = (e: KeyboardEvent) => {
    if (e.code === "Space") this.spaceDown = true;
    if ((e.key === "Delete" || e.key === "Backspace") && this.selectedId) {
      e.preventDefault();
      this.deleteSelected();
    }
  };

  private handleKeyUp = (e: KeyboardEvent) => {
    if (e.code === "Space") this.spaceDown = false;
  };

  /* ----------------------- shape construction --------------------- */

  /** Shape used for the live in-progress preview. */
  private previewShape(world: Point): Shape | null {
    if (this.selectedTool === "pencil") {
      return this.styled({ type: "pencil", points: this.pencilPoints });
    }
    return this.buildShape(world);
  }

  /** Build a finished shape from the drag start to `world`. */
  private buildShape(world: Point): Shape | null {
    const dx = world.x - this.startX;
    const dy = world.y - this.startY;
    switch (this.selectedTool) {
      case "rect":
        return this.styled({
          type: "rect",
          x: Math.min(this.startX, world.x),
          y: Math.min(this.startY, world.y),
          width: Math.abs(dx),
          height: Math.abs(dy),
        });
      case "circle":
        return this.styled({
          type: "circle",
          centerX: this.startX,
          centerY: this.startY,
          radius: Math.hypot(dx, dy),
        });
      case "line":
        return this.styled({
          type: "line",
          startX: this.startX,
          startY: this.startY,
          endX: world.x,
          endY: world.y,
        });
      case "rhombus":
        return this.styled({
          type: "rhombus",
          x: Math.min(this.startX, world.x),
          y: Math.min(this.startY, world.y),
          width: Math.abs(dx),
          height: Math.abs(dy),
        });
      case "pencil":
        return this.styled({ type: "pencil", points: this.pencilPoints });
      default:
        return null;
    }
  }

  private styled(geometry: ShapeGeometry): Shape {
    return {
      id: newId(),
      strokeColor: this.strokeColor,
      strokeWidth: this.strokeWidth,
      ...geometry,
    };
  }

  /* --------------------------- erasing ---------------------------- */

  private eraseAt(wx: number, wy: number) {
    const threshold = 10 / this.scale;
    let changed = false;
    this.shapes = this.shapes.filter((shape) => {
      if (distanceToShape(shape, wx, wy) <= threshold + (shape.strokeWidth ?? DEFAULT_WIDTH) / 2) {
        this.erasedIds.add(shape.id);
        changed = true;
        return false;
      }
      return true;
    });
    if (changed) this.render();
  }

  /* -------------------------- hit testing ------------------------- */

  private hitTest(wx: number, wy: number): Shape | null {
    const threshold = 8 / this.scale;
    // topmost first
    for (let i = this.shapes.length - 1; i >= 0; i--) {
      const shape = this.shapes[i]!;
      if (distanceToShape(shape, wx, wy) <= threshold) return shape;
      // closed shapes: also hittable inside their body
      if (shape.type === "rect" || shape.type === "rhombus") {
        const b = bounds(shape);
        if (wx >= b.minX && wx <= b.maxX && wy >= b.minY && wy <= b.maxY) return shape;
      }
      if (shape.type === "circle") {
        if (Math.hypot(wx - shape.centerX, wy - shape.centerY) <= shape.radius) return shape;
      }
    }
    return null;
  }

  /* --------------------------- rendering -------------------------- */

  render() {
    const ctx = this.ctx;
    // clear in device space
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // world transform (includes DPR)
    const s = this.scale * this.dpr;
    ctx.setTransform(s, 0, 0, s, this.offsetX * this.dpr, this.offsetY * this.dpr);

    this.drawGrid();

    for (const shape of this.shapes) {
      this.drawShape(shape, shape.id === this.selectedId);
    }
  }

  private drawGrid() {
    const ctx = this.ctx;
    const w = this.canvas.clientWidth;
    const h = this.canvas.clientHeight;
    const topLeft = this.toWorld(0, 0);
    const bottomRight = this.toWorld(w, h);

    ctx.save();
    ctx.lineWidth = 1 / this.scale;
    ctx.strokeStyle = GRID_COLOR[this.theme];
    ctx.beginPath();
    const startX = Math.floor(topLeft.x / GRID_SIZE) * GRID_SIZE;
    const startY = Math.floor(topLeft.y / GRID_SIZE) * GRID_SIZE;
    for (let x = startX; x <= bottomRight.x; x += GRID_SIZE) {
      ctx.moveTo(x, topLeft.y);
      ctx.lineTo(x, bottomRight.y);
    }
    for (let y = startY; y <= bottomRight.y; y += GRID_SIZE) {
      ctx.moveTo(topLeft.x, y);
      ctx.lineTo(bottomRight.x, y);
    }
    ctx.stroke();
    ctx.restore();
  }

  private drawShape(shape: Shape, selected: boolean) {
    const ctx = this.ctx;
    ctx.save();
    const color = shape.strokeColor ?? DEFAULT_COLOR;
    ctx.strokeStyle = color;
    ctx.lineWidth = shape.strokeWidth ?? DEFAULT_WIDTH;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    // Neon glow: in dark mode every stroke gets a soft colored halo.
    if (this.theme === "dark" && !selected) {
      ctx.shadowColor = color;
      ctx.shadowBlur = 8 + (shape.strokeWidth ?? DEFAULT_WIDTH) * 1.5;
    }

    switch (shape.type) {
      case "rect":
        ctx.strokeRect(shape.x, shape.y, shape.width, shape.height);
        break;
      case "circle":
        ctx.beginPath();
        ctx.arc(shape.centerX, shape.centerY, shape.radius, 0, Math.PI * 2);
        ctx.stroke();
        break;
      case "line":
        ctx.beginPath();
        ctx.moveTo(shape.startX, shape.startY);
        ctx.lineTo(shape.endX, shape.endY);
        ctx.stroke();
        break;
      case "rhombus": {
        const cx = shape.x + shape.width / 2;
        const cy = shape.y + shape.height / 2;
        ctx.beginPath();
        ctx.moveTo(cx, shape.y);
        ctx.lineTo(shape.x + shape.width, cy);
        ctx.lineTo(cx, shape.y + shape.height);
        ctx.lineTo(shape.x, cy);
        ctx.closePath();
        ctx.stroke();
        break;
      }
      case "pencil":
        drawSmoothPath(ctx, shape.points);
        break;
    }
    ctx.restore();

    if (selected) this.drawSelection(shape);
  }

  private drawSelection(shape: Shape) {
    const ctx = this.ctx;
    const b = bounds(shape);
    const pad = 6 / this.scale;
    ctx.save();
    ctx.strokeStyle = SELECT_COLOR;
    ctx.lineWidth = 1.5 / this.scale;
    ctx.setLineDash([6 / this.scale, 4 / this.scale]);
    ctx.strokeRect(b.minX - pad, b.minY - pad, b.maxX - b.minX + pad * 2, b.maxY - b.minY + pad * 2);
    ctx.restore();
  }
}

/* ------------------------------------------------------------------ */
/*  Geometry helpers                                                   */
/* ------------------------------------------------------------------ */

function clamp(v: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, v));
}

type Bounds = { minX: number; minY: number; maxX: number; maxY: number };

function bounds(shape: Shape): Bounds {
  switch (shape.type) {
    case "rect":
    case "rhombus":
      return {
        minX: shape.x,
        minY: shape.y,
        maxX: shape.x + shape.width,
        maxY: shape.y + shape.height,
      };
    case "circle":
      return {
        minX: shape.centerX - shape.radius,
        minY: shape.centerY - shape.radius,
        maxX: shape.centerX + shape.radius,
        maxY: shape.centerY + shape.radius,
      };
    case "line":
      return {
        minX: Math.min(shape.startX, shape.endX),
        minY: Math.min(shape.startY, shape.endY),
        maxX: Math.max(shape.startX, shape.endX),
        maxY: Math.max(shape.startY, shape.endY),
      };
    case "pencil": {
      const xs = shape.points.map((p) => p.x);
      const ys = shape.points.map((p) => p.y);
      return {
        minX: Math.min(...xs),
        minY: Math.min(...ys),
        maxX: Math.max(...xs),
        maxY: Math.max(...ys),
      };
    }
  }
}

/** Move a shape in place by (dx, dy). */
function translateShape(shape: Shape, dx: number, dy: number) {
  switch (shape.type) {
    case "rect":
    case "rhombus":
      shape.x += dx;
      shape.y += dy;
      break;
    case "circle":
      shape.centerX += dx;
      shape.centerY += dy;
      break;
    case "line":
      shape.startX += dx;
      shape.startY += dy;
      shape.endX += dx;
      shape.endY += dy;
      break;
    case "pencil":
      shape.points = shape.points.map((p) => ({ x: p.x + dx, y: p.y + dy }));
      break;
  }
}

function distToSegment(px: number, py: number, ax: number, ay: number, bx: number, by: number) {
  const dx = bx - ax;
  const dy = by - ay;
  const lenSq = dx * dx + dy * dy;
  if (lenSq === 0) return Math.hypot(px - ax, py - ay);
  let t = ((px - ax) * dx + (py - ay) * dy) / lenSq;
  t = clamp(t, 0, 1);
  return Math.hypot(px - (ax + t * dx), py - (ay + t * dy));
}

function distToPolyline(px: number, py: number, pts: Point[], closed: boolean) {
  let min = Infinity;
  for (let i = 0; i < pts.length - 1; i++) {
    min = Math.min(min, distToSegment(px, py, pts[i]!.x, pts[i]!.y, pts[i + 1]!.x, pts[i + 1]!.y));
  }
  if (closed && pts.length > 1) {
    const a = pts[pts.length - 1]!;
    const b = pts[0]!;
    min = Math.min(min, distToSegment(px, py, a.x, a.y, b.x, b.y));
  }
  return min;
}

/** Distance from a world point to a shape's outline. */
function distanceToShape(shape: Shape, px: number, py: number): number {
  switch (shape.type) {
    case "rect": {
      const { x, y, width: w, height: h } = shape;
      return distToPolyline(
        px,
        py,
        [
          { x, y },
          { x: x + w, y },
          { x: x + w, y: y + h },
          { x, y: y + h },
        ],
        true
      );
    }
    case "rhombus": {
      const cx = shape.x + shape.width / 2;
      const cy = shape.y + shape.height / 2;
      return distToPolyline(
        px,
        py,
        [
          { x: cx, y: shape.y },
          { x: shape.x + shape.width, y: cy },
          { x: cx, y: shape.y + shape.height },
          { x: shape.x, y: cy },
        ],
        true
      );
    }
    case "circle":
      return Math.abs(Math.hypot(px - shape.centerX, py - shape.centerY) - shape.radius);
    case "line":
      return distToSegment(px, py, shape.startX, shape.startY, shape.endX, shape.endY);
    case "pencil":
      return shape.points.length === 1
        ? Math.hypot(px - shape.points[0]!.x, py - shape.points[0]!.y)
        : distToPolyline(px, py, shape.points, false);
  }
}

/** Smooth a freehand path with quadratic curves through midpoints. */
function drawSmoothPath(ctx: CanvasRenderingContext2D, points: Point[]) {
  if (points.length === 0) return;
  ctx.beginPath();
  if (points.length < 3) {
    ctx.moveTo(points[0]!.x, points[0]!.y);
    for (let i = 1; i < points.length; i++) ctx.lineTo(points[i]!.x, points[i]!.y);
    ctx.stroke();
    return;
  }
  ctx.moveTo(points[0]!.x, points[0]!.y);
  for (let i = 1; i < points.length - 1; i++) {
    const midX = (points[i]!.x + points[i + 1]!.x) / 2;
    const midY = (points[i]!.y + points[i + 1]!.y) / 2;
    ctx.quadraticCurveTo(points[i]!.x, points[i]!.y, midX, midY);
  }
  const last = points[points.length - 1]!;
  ctx.lineTo(last.x, last.y);
  ctx.stroke();
}
