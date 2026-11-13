/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { ArrowUpRight, ChevronDown } from 'lucide-react';
import { motion } from 'framer-motion';
import { useScrollVideoTimeline } from './hooks/useScrollVideoTimeline';
import { TextAnimationOverlay } from './components/TextAnimationOverlay';
import { PortfolioLandingPage } from './components/PortfolioLandingPage';
import { LoadingScreen } from './components/LoadingScreen';
import {
  VIDEO_SOURCE_URL,
  VIRTUAL_SCROLL_DISTANCE,
  SHUTTER_START_PROGRESS,
  SHUTTER_END_PROGRESS,
  clamp,
  mapRange,
} from './types';

export default function App() {
  const [isLoading, setIsLoading] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Scroll-controlled 5-second video timeline controller
  const { progress, isVideoReady } = useScrollVideoTimeline(videoRef);

  // Shutter transition progress: 0 (video hero active) -> 1 (old screen scrolled up and completely gone)
  const shutterProgress = clamp(
    mapRange(progress, SHUTTER_START_PROGRESS, SHUTTER_END_PROGRESS, 0, 1),
    0,
    1
  );

  // Collaboration client avatars
  const clientAvatars = [
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80",
  ];

  // Calculate transition for the initial Page 1 / Line 1 elements
  // Fully active from 0.00 -> 0.06, seamlessly exits from 0.06 -> 0.16 as Line 2 enters (0.14 -> 0.22)
  const getPage1Anim = () => {
    if (progress <= 0.06) {
      return {
        opacity: 1,
        transform: 'translateY(0px)',
        filter: 'blur(0px)',
        pointerEvents: 'auto' as const,
        visible: true,
      };
    }
    if (progress >= 0.16) {
      return {
        opacity: 0,
        transform: 'translateY(-24px)',
        filter: 'blur(8px)',
        pointerEvents: 'none' as const,
        visible: false,
      };
    }
    const t = clamp((progress - 0.06) / (0.16 - 0.06), 0, 1);
    return {
      opacity: 1 - t,
      transform: `translateY(${(-t * 24).toFixed(2)}px)`,
      filter: `blur(${(t * 8).toFixed(2)}px)`,
      pointerEvents: (1 - t > 0.1 ? 'auto' : 'none') as 'auto' | 'none',
      visible: true,
    };
  };

  const page1Anim = getPage1Anim();

  return (
    <div id="master-page-root" className="relative w-full bg-black text-white selection:bg-[#ffa51f] selection:text-black">
      {/* Pinned Video Scrub Section with Virtual Scroll Height */}
      <div
        id="scroll-master-wrapper"
        className="relative w-full"
        style={{ height: `${VIRTUAL_SCROLL_DISTANCE}px` }}
      >
        {/* Sticky 100vh Viewport Screen that slowly shutters / scrolls UP as you scroll past text 4 */}
        <div
          id="root-viewport-page"
          className="sticky top-0 w-full h-screen overflow-hidden selection:bg-[#241812] selection:text-[#ffa51f] z-10 will-change-transform"
          style={{
            transform: `translateY(-${(shutterProgress * 100).toFixed(2)}%)`,
            pointerEvents: shutterProgress >= 0.98 ? 'none' : 'auto',
          }}
        >
          {/* ================= FULL SCREEN SCROLL-CONTROLLED 5-SECOND VIDEO BACKGROUND ================= */}
          <div
            id="fullscreen-video-wrapper"
            className="absolute inset-0 w-full h-full z-0 overflow-hidden bg-[#18110e]"
          >
            <motion.div
              initial={{ opacity: 0, scale: 1.04 }}
              animate={{ opacity: isVideoReady ? 1 : 0, scale: 1 }}
              transition={{ duration: 1.2, delay: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
              className="relative w-full h-full flex items-end justify-center"
            >
              <video
                ref={videoRef}
                src={VIDEO_SOURCE_URL}
                muted
                playsInline
                preload="auto"
                tabIndex={-1}
                aria-hidden="true"
                className="w-full h-full object-cover object-center"
              />
            </motion.div>

            {/* Cinematic gradient vignette */}
            <div
              className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/40 via-transparent to-black/30"
            />
          </div>

          {/* ================= PAGE 1 OVERLAY WRAPPER ================= */}
          <div
            className={`relative z-20 w-full h-full transition-[filter] duration-75 will-change-transform ${
              !page1Anim.visible ? 'hidden' : ''
            }`}
            style={{
              opacity: page1Anim.opacity,
              transform: page1Anim.transform,
              filter: page1Anim.filter,
              pointerEvents: page1Anim.pointerEvents,
            }}
          >
            {/* ================= 1. TOP-LEFT BRANDING ================= */}
            <motion.div
              id="brand-logo"
              initial={{ opacity: 0, y: -15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="absolute top-6 left-6 md:top-[72px] md:left-[56px] z-40 flex items-center gap-[10px]"
            >
              {/* 7px x 7px Orange Dot */}
              <span
                className="w-[7px] h-[7px] rounded-full bg-[#F28C28] shadow-[0_0_8px_rgba(242,140,40,0.6)] shrink-0"
              />
              <span className="font-geist text-white text-[18px] sm:text-[19px] md:text-[20px] font-extrabold tracking-[0.02em] uppercase select-none drop-shadow-md">
                ANDREW.
              </span>
            </motion.div>

            {/* ================= 11. TOP-RIGHT SCROLL TO EXPLORE ================= */}
            <motion.div
              id="scroll-instruction-indicator"
              initial={{ opacity: 0, y: -15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="absolute top-6 right-6 md:top-[62px] md:right-[56px] z-40 w-auto md:w-[210px] h-[42px] flex items-center justify-center gap-2.5 px-4 rounded-full bg-white/80 hover:bg-white text-[#1a1a1a] border border-black/10 backdrop-blur-[12px] shadow-lg transition-all duration-300 select-none group cursor-default"
            >
              {/* Animated Mouse Icon with smooth vertical cycle */}
              <div className="relative w-3.5 h-5 rounded-full border-[1.5px] border-[#1a1a1a] flex justify-center p-0.5">
                <motion.span
                  animate={{ y: [0, 3, 0] }}
                  transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
                  className="w-1 h-1.5 bg-[#1a1a1a] rounded-full"
                />
              </div>

              {/* Instruction Label */}
              <span className="text-[10px] font-mono font-bold tracking-[0.25em] uppercase text-[#1a1a1a]">
                SCROLL TO EXPLORE
              </span>

              <ChevronDown className="hidden md:block w-3.5 h-3.5 text-[#1a1a1a]/70 group-hover:translate-y-0.5 transition-transform" />
            </motion.div>

            {/* ================= 2, 3, 4. MAIN "CREATE" HEADING, SUBTITLE & CTA ================= */}
            <div
              id="hero-create-block"
              className="absolute top-[120px] left-6 md:top-[285px] md:left-[56px] z-30 max-w-[90vw] md:max-w-[30vw]"
            >
              {/* 2. Main CREATE Heading */}
              <motion.h1
                id="hero-create-title"
                initial={{ opacity: 0, x: -80 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
                className="font-geist font-black text-white text-[clamp(72px,8.5vw,150px)] tracking-[-0.055em] leading-[0.9] uppercase drop-shadow-2xl select-none"
              >
                CREATE
              </motion.h1>

              {/* 3. Subtitle under CREATE */}
              <motion.div
                id="hero-create-subtext"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
                className="mt-[12px] w-[180px] sm:w-[210px]"
              >
                <p className="font-geist text-white/90 text-[16px] font-medium leading-[1.5] drop-shadow-sm">
                  Designs that inspire.
                </p>
                <p className="font-geist text-white/90 text-[16px] font-medium leading-[1.5] drop-shadow-sm">
                  Ideas that connect.
                </p>
              </motion.div>

              {/* 4. VIEW WORK Pill Button */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
                className="mt-[24px]"
              >
                <a
                  id="view-work-cta"
                  href="#section-works"
                  className="group inline-flex items-center justify-center gap-2.5 w-[164px] h-[48px] rounded-full bg-[#F4F4F2] hover:bg-white text-[#1A1A1A] font-geist font-bold text-[12px] tracking-[0.08em] uppercase shadow-2xl cursor-pointer transition-all duration-[350ms] ease-[cubic-bezier(0.25,1,0.5,1)] hover:-translate-y-[3px] hover:scale-[1.03] active:scale-[0.98]"
                >
                  <span>VIEW WORK</span>
                  <ArrowUpRight className="w-4 h-4 stroke-[2.5] text-[#1A1A1A] transition-transform duration-[350ms] ease-[cubic-bezier(0.25,1,0.5,1)] group-hover:translate-x-1 group-hover:-translate-y-1" />
                </a>
              </motion.div>
            </div>

            {/* ================= 6 & 7. RIGHT-SIDE "AVAILABLE FOR" SERVICES ================= */}
            <motion.div
              id="freelance-availability-block"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
              className="absolute top-[430px] right-6 md:top-[34%] md:right-[9%] z-30 text-left md:text-right"
            >
              {/* Header with 7px orange dot */}
              <div className="flex items-center gap-[6px] text-[10px] font-bold uppercase tracking-[0.28em] text-[#252525] md:justify-end">
                <span>AVAILABLE FOR</span>
                <span className="w-[7px] h-[7px] rounded-full bg-[#F28C28] inline-block shrink-0 shadow-sm animate-pulse" />
              </div>

              {/* Freelance Projects */}
              <div className="mt-2 space-y-0">
                <h2 className="text-[clamp(34px,3vw,52px)] font-extrabold tracking-[-0.04em] text-[#141414] leading-[0.95]">
                  Freelance
                </h2>
                <h2 className="text-[clamp(34px,3vw,52px)] font-extrabold tracking-[-0.04em] text-[#141414] leading-[0.95]">
                  Projects
                </h2>
              </div>

              {/* Web Experiences · 3D · Development */}
              <p className="mt-[16px] text-[12px] font-medium text-[#141414]/55 tracking-wide">
                Web Experiences · 3D · Development
              </p>
            </motion.div>

            {/* ================= 8. BOTTOM-LEFT SOCIAL PROOF / COLLABORATIONS ================= */}
            <motion.div
              id="client-avatars-trust"
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.0, ease: [0.25, 0.1, 0.25, 1] }}
              className="absolute bottom-6 left-6 md:bottom-[55px] md:left-[56px] z-30"
            >
              <div className="flex items-center">
                {clientAvatars.map((src, index) => (
                  <img
                    key={index}
                    src={src}
                    alt={`Collaborator avatar ${index + 1}`}
                    className="w-8 h-8 sm:w-9 sm:h-9 rounded-full object-cover border-2 border-white/80 -ml-2.5 first:ml-0 bg-neutral-800 shadow-md"
                  />
                ))}
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#241812]/90 text-white text-xs font-geist font-bold flex items-center justify-center border-2 border-white/80 -ml-2.5 shadow-md">
                  +12
                </div>
              </div>

              <p className="font-geist text-white text-[12px] font-bold tracking-[0.04em] uppercase mt-2.5 drop-shadow-sm">
                SELECTED COLLABORATIONS
              </p>
            </motion.div>

            {/* ================= 9 & 10. BOTTOM-RIGHT AUTHENTIC LOCATION / DISCOVER CARD ================= */}
            <motion.div
              id="authentic-discover-card"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
              className="hidden sm:block absolute bottom-6 right-6 md:bottom-[48px] md:right-[56px] z-30 w-[305px] p-[24px] md:p-[26px] rounded-[18px] bg-white/75 backdrop-blur-[16px] border border-white/40 shadow-2xl text-black select-none"
            >
              <div className="flex items-center gap-2 text-[10.5px] font-bold uppercase tracking-[0.2em] text-[#252525]">
                <span>BASED IN INDIA</span>
                <span className="w-[6px] h-[6px] rounded-full bg-[#F28C28] inline-block shrink-0 animate-pulse" />
                <span>WORLDWIDE</span>
              </div>

              <p className="mt-2.5 text-[12.5px] leading-relaxed text-[#141414] font-medium">
                Scroll to discover selected work ↓
              </p>
            </motion.div>
          </div>

          {/* ================= REVERSIBLE SCROLL-DRIVEN TEXT ANIMATION PLACEHOLDERS ================= */}
          <TextAnimationOverlay progress={progress} />
        </div>
      </div>

      {/* ================= COMPLETE TRANSITION PORTFOLIO LANDING PAGE ================= */}
      {/* As the user scrolls past the 4th text, the previous screen shutters up and reveals this full dark landing page */}
      <div id="section-works" className="relative z-20 w-full bg-bg shadow-[0_-30px_60px_rgba(0,0,0,0.95)]">
        <PortfolioLandingPage isVisible={shutterProgress >= 0.7} />
      </div>

      {/* Loading Screen Overlay if triggered */}
      {isLoading && <LoadingScreen onComplete={() => setIsLoading(false)} />}
    </div>
  );
}

