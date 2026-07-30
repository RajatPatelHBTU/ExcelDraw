'use client';
import { useEffect, useRef } from 'react';

export default function ScrollCards() {
  const containerRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    const grid = gridRef.current;
    if (!container || !grid) return;

    let animationFrameId: number;
    const trigger = document.getElementById('cards-trigger');

    function tickCards() {
      if (!trigger || !container || !grid) return;
      const rect = trigger.getBoundingClientRect();
      const triggerTop = rect.top + window.scrollY;
      const triggerHeight = rect.height;
      const scrollY = window.scrollY;
      const vh = window.innerHeight;

      const start = triggerTop - vh * 0.5;
      const end = triggerTop + triggerHeight - vh * 0.3;
      const range = end - start;

      let progress = range > 0 ? (scrollY - start) / range : 0;
      progress = Math.max(0, Math.min(1, progress));

      const isActive = scrollY >= start - vh * 0.2 && scrollY <= end + vh * 0.3;
      const fadeIn = Math.min(1, Math.max(0, (scrollY - (start - vh * 0.2)) / (vh * 0.2)));
      const fadeOut = Math.min(1, Math.max(0, (end + vh * 0.3 - scrollY) / (vh * 0.3)));
      const containerOpacity = isActive ? Math.min(fadeIn, fadeOut) : 0;

      container.style.opacity = containerOpacity.toString();
      container.style.pointerEvents = containerOpacity > 0.1 ? 'auto' : 'none';

      const isMobile = window.innerWidth < 768;
      const revealPct = progress * 130;
      
      const maskStr = isMobile 
        ? `linear-gradient(to bottom, black ${revealPct}%, transparent ${revealPct + 20}%)`
        : `linear-gradient(to right, black ${revealPct}%, transparent ${revealPct + 15}%)`;
      
      grid.style.setProperty('mask-image', maskStr);
      grid.style.setProperty('-webkit-mask-image', maskStr);

      animationFrameId = requestAnimationFrame(tickCards);
    }

    animationFrameId = requestAnimationFrame(tickCards);
    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  return (
    <>
      <div id="cards-trigger" style={{ height: '200vh' }} />
      <div ref={containerRef} className="fixed bottom-0 left-0 right-0 z-[4] px-4 py-8 md:p-10 opacity-0 pointer-events-none transition-opacity duration-300">
        <div ref={gridRef} className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-10">
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-colors">
            <h3 className="text-xl font-bold text-white mb-4">Expressive tools</h3>
            <p className="text-gray-300 text-sm leading-relaxed">Pencil, shapes, arrows and freehand strokes with neon-grade styling — built for thinking out loud.</p>
          </div>
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-colors">
            <h3 className="text-xl font-bold text-white mb-4">Real-time co-draw</h3>
            <p className="text-gray-300 text-sm leading-relaxed">Every stroke streams to your room over WebSockets. Draw together, instantly, from anywhere.</p>
          </div>
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-colors">
            <h3 className="text-xl font-bold text-white mb-4">Infinite canvas</h3>
            <p className="text-gray-300 text-sm leading-relaxed">Pan and zoom across an endless grid. Your ideas never run out of room to grow.</p>
          </div>
        </div>
      </div>
    </>
  );
}
