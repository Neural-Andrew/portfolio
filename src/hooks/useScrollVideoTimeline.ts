/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import type { RefObject } from 'react';
import {
  VIDEO_DURATION,
  VIRTUAL_SCROLL_DISTANCE,
  SHUTTER_START_PROGRESS,
  clamp,
} from '../types';

export function useScrollVideoTimeline(videoRef: RefObject<HTMLVideoElement | null>) {
  const [progress, setProgress] = useState(0);
  const [isVideoReady, setIsVideoReady] = useState(false);

  // References for high-frequency animation loop
  const targetTimeRef = useRef(0);
  const isSeekingRef = useRef(false);
  const pendingSeekRef = useRef<number | null>(null);
  const videoReadyRef = useRef(false);
  const rafIdRef = useRef<number | null>(null);
  const lastTimeRef = useRef(0);

  // Small epsilon in seconds to avoid micro jitter seeks
  const SEEK_EPSILON = 0.015;

  // Function to execute or queue video seek
  const triggerSeek = (targetSeconds: number) => {
    const video = videoRef.current;
    if (!video || !videoReadyRef.current) return;

    // Clamp timeline precisely between 0 and VIDEO_DURATION
    const clampedTarget = clamp(targetSeconds, 0, VIDEO_DURATION);

    if (Math.abs(video.currentTime - clampedTarget) < SEEK_EPSILON) {
      return;
    }

    if (isSeekingRef.current) {
      // Queue the newest target frame
      pendingSeekRef.current = clampedTarget;
    } else {
      isSeekingRef.current = true;
      try {
        if ('fastSeek' in video && typeof (video as any).fastSeek === 'function') {
          (video as any).fastSeek(clampedTarget);
        } else {
          video.currentTime = clampedTarget;
        }
      } catch {
        video.currentTime = clampedTarget;
      }
    }
  };

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Ensure video properties
    video.muted = true;
    video.playsInline = true;
    video.preload = 'auto';

    const handleLoadedMetadata = () => {
      video.currentTime = 0;
      videoReadyRef.current = true;
      setIsVideoReady(true);
    };

    const handleCanPlay = () => {
      if (!videoReadyRef.current) {
        video.currentTime = 0;
        videoReadyRef.current = true;
        setIsVideoReady(true);
      }
    };

    const handleSeeking = () => {
      isSeekingRef.current = true;
    };

    const handleSeeked = () => {
      isSeekingRef.current = false;
      if (pendingSeekRef.current !== null) {
        const nextTarget = pendingSeekRef.current;
        pendingSeekRef.current = null;
        triggerSeek(nextTarget);
      }
    };

    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('seeking', handleSeeking);
    video.addEventListener('seeked', handleSeeked);

    // Initial check in case video is already cached/loaded
    if (video.readyState >= 2) {
      videoReadyRef.current = true;
      setIsVideoReady(true);
    }

    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('seeking', handleSeeking);
      video.removeEventListener('seeked', handleSeeked);
    };
  }, [videoRef]);

  // Main scroll & RAF animation loop
  useEffect(() => {
    let ticking = false;

    const updateScrollProgress = () => {
      const scrollY = window.scrollY || window.pageYOffset || document.documentElement.scrollTop || 0;
      const rawProgress = VIRTUAL_SCROLL_DISTANCE > 0 ? scrollY / VIRTUAL_SCROLL_DISTANCE : 0;
      const currentProgress = clamp(rawProgress, 0, 1);
      
      // Video timeline scrubs from 0 to 1 over the 0 -> SHUTTER_START_PROGRESS range
      const videoProgress = clamp(currentProgress / SHUTTER_START_PROGRESS, 0, 1);
      const targetTime = videoProgress * VIDEO_DURATION;

      targetTimeRef.current = targetTime;

      // Sync React state for text animations
      setProgress(currentProgress);

      // Trigger video seek to match timeline
      triggerSeek(targetTime);

      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        rafIdRef.current = requestAnimationFrame(updateScrollProgress);
      }
    };

    // Continuous tick to drain any queued seeks during fast gesture inertia
    const continuousLoop = () => {
      if (videoReadyRef.current && videoRef.current) {
        const target = targetTimeRef.current;
        if (!isSeekingRef.current && Math.abs(videoRef.current.currentTime - target) > SEEK_EPSILON) {
          triggerSeek(target);
        }
      }
      rafIdRef.current = requestAnimationFrame(continuousLoop);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });

    // Initial sync
    updateScrollProgress();
    rafIdRef.current = requestAnimationFrame(continuousLoop);

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, [videoRef]);

  return {
    progress,
    isVideoReady,
    videoDuration: VIDEO_DURATION,
    virtualScrollDistance: VIRTUAL_SCROLL_DISTANCE,
  };
}
