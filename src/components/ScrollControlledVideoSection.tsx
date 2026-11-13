/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion } from 'framer-motion';

interface ScrollControlledVideoSectionProps {
  videoUrl?: string;
}

const DEFAULT_VIDEO_URL = 'https://res.cloudinary.com/yxbd933e/video/upload/v1787467233/download_tyn7bs.mp4';
const TOTAL_STEPS = 7; // Exactly 7 scrolls from start (0s) to finish (7s)
const MIN_TIME = 0;
const MAX_TIME = 7;
const SCROLL_COOLDOWN_MS = 320; // Cooldown to ensure 1 scroll action = 1 discrete second

export const ScrollControlledVideoSection: React.FC<ScrollControlledVideoSectionProps> = ({
  videoUrl = DEFAULT_VIDEO_URL,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const [isVideoReady, setIsVideoReady] = useState(false);
  const currentStepRef = useRef(0); // 0 to 7
  const lastScrollTimeRef = useRef(0);
  const touchStartYRef = useRef(0);
  const isTransitioningRef = useRef(false);
  const animFrameRef = useRef<number | null>(null);

  // Jump smoothly to the Featured Work section
  const transitionToFeaturedWork = useCallback(() => {
    if (isTransitioningRef.current) return;
    isTransitioningRef.current = true;
    const workSection = document.getElementById('work');
    if (workSection) {
      workSection.scrollIntoView({ behavior: 'smooth' });
    }
    setTimeout(() => {
      isTransitioningRef.current = false;
    }, 1200);
  }, []);

  // Smoothly interpolate video playback to exact target second (e.g. from 2.0s -> 3.0s over ~300ms)
  const animateToTargetTime = useCallback((targetTime: number) => {
    const video = videoRef.current;
    if (!video) return;

    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
    }

    const startTime = video.currentTime;
    const duration = 280; // ms
    const startTimestamp = performance.now();

    const stepAnimation = (now: number) => {
      const elapsed = now - startTimestamp;
      const progress = Math.min(1, elapsed / duration);
      
      // Smooth ease-out curve
      const ease = 1 - Math.pow(1 - progress, 3);
      const currentTime = startTime + (targetTime - startTime) * ease;
      
      try {
        video.currentTime = Math.max(MIN_TIME, Math.min(currentTime, MAX_TIME));
      } catch {
        // ignore
      }

      if (progress < 1) {
        animFrameRef.current = requestAnimationFrame(stepAnimation);
      } else {
        try {
          video.currentTime = targetTime;
        } catch {
          // ignore
        }
      }
    };

    animFrameRef.current = requestAnimationFrame(stepAnimation);
  }, []);

  // Video Initial Loading
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = true;
    video.playsInline = true;
    video.preload = 'auto';

    const markReady = () => {
      setIsVideoReady(true);
      try {
        if (video.currentTime === 0) {
          video.currentTime = 0.001; // Force immediate frame decode
        }
      } catch {
        // ignore
      }
    };

    const onLoadedMetadata = () => markReady();
    const onLoadedData = () => markReady();
    const onCanPlay = () => markReady();

    video.addEventListener('loadedmetadata', onLoadedMetadata);
    video.addEventListener('loadeddata', onLoadedData);
    video.addEventListener('canplay', onCanPlay);

    video.load();

    if (video.readyState >= 1) {
      markReady();
    }

    return () => {
      video.removeEventListener('loadedmetadata', onLoadedMetadata);
      video.removeEventListener('loadeddata', onLoadedData);
      video.removeEventListener('canplay', onCanPlay);
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, []);

  // Step-based scroll handler:
  // Exactly 7 scrolls forward (0s -> 7s) and 7 scrolls backward (7s -> 0s)
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleStepScroll = (direction: 'down' | 'up') => {
      const now = performance.now();
      if (now - lastScrollTimeRef.current < SCROLL_COOLDOWN_MS) {
        return;
      }
      lastScrollTimeRef.current = now;

      if (direction === 'down') {
        if (currentStepRef.current < TOTAL_STEPS) {
          // Advance exactly 1 step (1 second)
          currentStepRef.current += 1;
          const targetTime = currentStepRef.current; // 1s, 2s, ... 7s
          animateToTargetTime(targetTime);
        } else {
          // Already at 7s -> trigger smooth jump to Featured Work
          transitionToFeaturedWork();
        }
      } else {
        // Scrolling up
        if (currentStepRef.current > 0) {
          // Go back exactly 1 step (1 second)
          currentStepRef.current -= 1;
          const targetTime = currentStepRef.current; // 6s, 5s, ... 0s
          animateToTargetTime(targetTime);
        }
      }
    };

    const handleWheel = (e: WheelEvent) => {
      const rect = container.getBoundingClientRect();
      const inView = rect.top <= 100 && rect.bottom >= window.innerHeight - 100;
      if (!inView) return;

      const isAtStart = currentStepRef.current === 0;

      // When scrolling down while inside the section
      if (e.deltaY > 0) {
        e.preventDefault();
        handleStepScroll('down');
        return;
      }

      // When scrolling up and not yet back at step 0 (0s)
      if (e.deltaY < 0 && !isAtStart) {
        e.preventDefault();
        handleStepScroll('up');
        return;
      }

      // If at step 0 (0s) and scrolling up, allow normal page scroll back up to previous section
    };

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        touchStartYRef.current = e.touches[0].clientY;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      const rect = container.getBoundingClientRect();
      const inView = rect.top <= 100 && rect.bottom >= window.innerHeight - 100;
      if (!inView || e.touches.length === 0) return;

      const touchY = e.touches[0].clientY;
      const deltaY = touchStartYRef.current - touchY;

      // Threshold for mobile swipe
      if (Math.abs(deltaY) < 30) return;
      touchStartYRef.current = touchY;

      const isAtStart = currentStepRef.current === 0;

      if (deltaY > 0) {
        e.preventDefault();
        handleStepScroll('down');
        return;
      }

      if (deltaY < 0 && !isAtStart) {
        e.preventDefault();
        handleStepScroll('up');
        return;
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: false });
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: false });

    return () => {
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
    };
  }, [animateToTargetTime, transitionToFeaturedWork]);

  return (
    <div
      id="scroll-video-timeline-wrapper"
      ref={containerRef}
      className="relative w-full h-screen bg-bg overflow-hidden flex flex-col justify-center items-center p-6 sm:p-10 select-none"
    >
      {/* Centered Background Scrub Video (Always stays static in viewport) */}
      <div className="absolute inset-0 w-full h-full overflow-hidden bg-bg z-0 pointer-events-none">
        <video
          ref={videoRef}
          src={videoUrl}
          muted
          playsInline
          preload="auto"
          crossOrigin="anonymous"
          tabIndex={-1}
          aria-hidden="true"
          className={`absolute top-1/2 left-1/2 min-w-full min-h-full w-auto h-auto object-cover -translate-x-1/2 -translate-y-1/2 opacity-95 transition-opacity duration-500 ease-out ${
            isVideoReady ? 'opacity-100' : 'opacity-0'
          }`}
        />
        {/* Cinematic Vignette */}
        <div className="absolute inset-0 bg-black/35 pointer-events-none" />
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-bg/90 to-transparent pointer-events-none" />
        <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-bg/90 to-transparent pointer-events-none" />
      </div>

      {/* Center Minimalist Typography Overlay */}
      <div className="relative z-20 max-w-2xl mx-auto text-center pointer-events-none space-y-3">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-[11px] font-mono text-white/70 uppercase tracking-[0.3em]"
        >
          CINEMATIC TRANSLATION
        </motion.div>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="text-3xl sm:text-5xl md:text-6xl font-display italic text-white tracking-tight"
        >
          Dimension &amp; Motion
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-xs sm:text-sm text-white/70 font-mono max-w-md mx-auto"
        >
          Scroll to manipulate real-time spacetime kinetic trajectory.
        </motion.p>
      </div>
    </div>
  );
};
