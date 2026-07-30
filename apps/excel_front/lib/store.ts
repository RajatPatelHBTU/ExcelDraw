import { create } from 'zustand';

interface CanvasState {
  tool: string;
  color: string;
  zoom: number;
  position: { x: number; y: number };
  setTool: (tool: string) => void;
  setColor: (color: string) => void;
  setZoom: (zoom: number) => void;
  setPosition: (position: { x: number; y: number }) => void;
}

export const useCanvasStore = create<CanvasState>((set) => ({
  tool: 'select',
  color: '#52B7FF',
  zoom: 100,
  position: { x: 0, y: 0 },
  setTool: (tool) => set({ tool }),
  setColor: (color) => set({ color }),
  setZoom: (zoom) => set({ zoom }),
  setPosition: (position) => set({ position }),
}));