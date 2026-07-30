'use client';
import { useEffect, useRef } from 'react';

export default function PresentationSection() {
  const innerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = innerRef.current;
    if (!el) return;
    
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        el.style.opacity = '1';
        el.style.transform = 'translateY(0)';
        el.style.filter = 'blur(0)';
        observer.unobserve(el);
      }
    }, { threshold: 0.15 });
    
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section className="relative min-h-screen flex items-end justify-center px-10 pb-32 z-10">
      <div 
        ref={innerRef} 
        className="relative z-10 flex flex-col items-center text-center opacity-0 translate-y-8 blur-sm transition-all duration-1000 ease-out"
      >
        <p className="text-gray-300 text-base md:text-lg mb-3">Presenting</p>
        <h2 className="text-4xl md:text-[4.5rem] font-bold text-white">Excel.Draw</h2>
      </div>
    </section>
  );
}
