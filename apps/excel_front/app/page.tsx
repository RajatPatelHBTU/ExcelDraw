'use client';
import Link from 'next/link';
import { useEffect } from 'react';
import ParticleBackground from '@/components/cinematic/ParticleBackground';
import ScrollVideoBackground from '@/components/cinematic/ScrollVideoBackground';
import ScrollCards from '@/components/cinematic/ScrollCards';
import PresentationSection from '@/components/cinematic/PresentationSection';
import { PenTool } from 'lucide-react';

export default function Home() {
  const VIDEO_URL = 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260616_212935_bbf608da-62d1-4f25-9be4-c346e4d09cc8.mp4';

  useEffect(() => {
    const updateHeroOpacity = () => {
      const hero = document.getElementById('hero');
      if (hero) {
        const fade = Math.max(0, 1 - window.scrollY / (window.innerHeight * 0.3));
        hero.style.opacity = fade.toString();
      }
    };
    window.addEventListener('scroll', updateHeroOpacity, { passive: true });
    return () => window.removeEventListener('scroll', updateHeroOpacity);
  }, []);

  return (
    <div className="relative min-h-screen font-sans bg-[#010101] text-white selection:bg-blue-500/30 overflow-x-hidden">
      <ScrollVideoBackground videoUrl={VIDEO_URL} />
      <ParticleBackground />
      
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-5 md:px-10">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white">
            <PenTool className="h-4 w-4 text-black" />
          </span>
          <span className="text-xl font-bold tracking-tight">exceldraw</span>
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/auth" className="text-sm text-gray-300 hover:text-white transition-colors">Sign In</Link>
          <Link href="/auth" className="text-sm bg-white text-black px-4 py-2 rounded-full font-medium hover:bg-gray-200 transition-colors">
            Launch App
          </Link>
        </div>
      </nav>

      {/* Main Content */}
      <div className="relative z-[2]">
        {/* Hero */}
        <section id="hero" className="relative h-screen w-full flex flex-col">
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
          <div className="relative z-10 flex-1 flex flex-col items-center justify-end text-center px-6 pb-24">
            <p className="text-sm text-gray-400 mb-4 tracking-wider uppercase">Our Purpose:</p>
            <h1 className="text-4xl md:text-6xl lg:text-[3.75rem] font-semibold leading-[1.15] max-w-4xl">
              Instantly craft collaborative
              <span className="relative inline-block mx-3">
                <span className="absolute bottom-2 left-0 w-full h-2.5 bg-blue-600 rounded-sm" />
                <span className="relative">diagrams</span>
              </span>
              on the web.
            </h1>
            <div className="flex flex-col sm:flex-row items-center gap-4 mt-10 justify-center">
              <div className="flex items-center gap-2 bg-[#1a1a1a] border border-gray-700/50 rounded-lg px-8 py-3.5">
                <span className="text-blue-500 font-mono text-sm">&gt;</span>
                <code className="text-gray-200 font-mono text-sm">Draw at the speed of thought</code>
              </div>
              <Link href="/auth" className="inline-flex items-center gap-2 bg-blue-600 text-white font-medium rounded-lg px-8 py-3.5 text-sm transition hover:bg-blue-500">
                Get Started <span className="text-lg leading-none">&rarr;</span>
              </Link>
            </div>
          </div>
          <div className="relative z-10 flex justify-center pb-8 animate-bounce">
            <svg className="w-6 h-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>
        </section>

        {/* First Content Section */}
        <div style={{ height: '150vh' }} className="flex flex-col items-center justify-center pointer-events-none relative z-10 px-6">
          <div className="max-w-3xl text-center bg-black/40 p-8 md:p-12 rounded-3xl backdrop-blur-xl border border-white/10 shadow-2xl transition-all">
            <h2 className="text-3xl md:text-5xl font-bold mb-6 text-white">A Canvas Without Limits</h2>
            <p className="text-lg text-gray-300 leading-relaxed">Experience true freedom with an infinite, zooming workspace where every idea fits perfectly. Your diagrams blossom and come to life seamlessly as you explore.</p>
          </div>
        </div>

        {/* Sticky Cards Trigger & Content */}
        <ScrollCards />

        {/* Second Content Section */}
        <div style={{ height: '100vh' }} className="flex flex-col items-center justify-center pointer-events-none relative z-10 px-6">
          <div className="max-w-3xl text-center bg-black/40 p-8 md:p-12 rounded-3xl backdrop-blur-xl border border-white/10 shadow-2xl transition-all">
            <h2 className="text-3xl md:text-5xl font-bold mb-6 text-white">Built for Teams</h2>
            <p className="text-lg text-gray-300 leading-relaxed">Share a link and watch as your entire team collaborates in real-time. Everything is synced instantly with WebSockets, keeping everyone on the same page.</p>
          </div>
        </div>

        {/* Final Presentation */}
        <PresentationSection />
      </div>
    </div>
  );
}
