/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface TextPlaceholderConfig {
  id: number | string;
  label: string;
  text: string;
  lines?: string[];
  linkUrl?: string;
  linkText?: string;
  start: number;      // Progress (0 to 1) when entering starts
  enterEnd: number;   // Progress when fully entered (visible)
  exitStart: number;  // Progress when exiting begins
  end: number;        // Progress when fully exited
  position: 'left-center' | 'right-center';
  enterDirection?: 'left' | 'right' | 'up' | 'down' | 'center';
  exitDirection?: 'left' | 'right' | 'up' | 'down' | 'center';
  className?: string;
  badgeClass?: string;
  textClass?: string;
}

export interface AnimationStyleResult {
  opacity: number;
  translateY: number;
  translateX: number;
  scale: number;
  blur: number;
  visible: boolean;
}

export const VIDEO_DURATION = 5.0; // 5 seconds master timeline
export const VIRTUAL_SCROLL_DISTANCE = 6000; // 6000px virtual scroll distance
export const VIDEO_SOURCE_URL = 'https://res.cloudinary.com/dr9sbyiye/video/upload/v1787326272/download.mp4';

// Helper: clamp a value between min and max (defaults to 0 and 1)
export const clamp = (value: number, min = 0, max = 1): number => {
  return Math.min(max, Math.max(min, value));
};

// Helper: map a value from [start, end] to [outputMin, outputMax] with clamping
export const mapRange = (
  value: number,
  start: number,
  end: number,
  outputMin = 0,
  outputMax = 1
): number => {
  if (end === start) return outputMin;
  const normalized = clamp((value - start) / (end - start), 0, 1);
  return outputMin + normalized * (outputMax - outputMin);
};

// Calculate all animation states for a given placeholder based on timeline progress
export function calculatePlaceholderAnimation(
  progress: number,
  config: TextPlaceholderConfig
): AnimationStyleResult {
  const { start, enterEnd, exitStart, end, exitDirection = 'up', enterDirection = 'down' } = config;

  if (progress < start || progress > end) {
    return {
      opacity: 0,
      translateY: 20,
      translateX: 0,
      scale: 0.96,
      blur: 8,
      visible: false,
    };
  }

  let opacity = 1;
  let translateY = 0;
  let translateX = 0;
  let blur = 0;
  let scale = 1;

  if (progress < enterEnd) {
    // ENTER PHASE
    const t = mapRange(progress, start, enterEnd, 0, 1);
    opacity = t;
    blur = (1 - t) * 6;
    scale = 0.95 + t * 0.05;

    if (enterDirection === 'left') {
      translateX = -(1 - t) * 80;
    } else if (enterDirection === 'right') {
      translateX = (1 - t) * 80;
    } else if (enterDirection === 'up') {
      translateY = -(1 - t) * 30;
    } else {
      translateY = (1 - t) * 24;
    }
  } else if (progress > exitStart) {
    // EXIT PHASE
    const t = mapRange(progress, exitStart, end, 0, 1);
    opacity = 1 - t;
    blur = t * 6;
    scale = 1 + t * 0.03;

    if (exitDirection === 'left') {
      translateX = -t * 120;
    } else if (exitDirection === 'right') {
      translateX = t * 120;
    } else if (exitDirection === 'up') {
      translateY = -t * 28;
    } else if (exitDirection === 'down') {
      translateY = t * 28;
    }
  } else {
    // VISIBLE / IDLE PHASE
    opacity = 1;
    translateY = 0;
    translateX = 0;
    blur = 0;
    scale = 1;
  }

  return {
    opacity,
    translateY,
    translateX,
    scale,
    blur,
    visible: opacity > 0.005,
  };
}

// Configurable independent text animation placeholders
// Line 1: Initial Page 1 hero screen (0.00 -> 0.14)
// 2nd Scroll Sequence:
//   Part A: "WHAT DO" (slides left & fades) + "I DO?" (slides right & fades) (0.13 -> 0.33)
//   Part B (Final Reveal): "I CREATE." (left) + "THE BEST DIGITAL EXPERIENCE" (right) (0.31 -> 0.53)
// Line 3 (Split): Services & Expertise (0.53 -> 0.75)
// Line 4: Call to action / portfolio link (0.75 -> 0.88)
// Shutter: 0.86 -> 1.00
export const DEFAULT_TEXT_PLACEHOLDERS: TextPlaceholderConfig[] = [
  // 2nd Scroll - Part A: The Question
  {
    id: "2-what-do",
    label: "QUESTION",
    text: "WHAT DO",
    start: 0.13,
    enterEnd: 0.19,
    exitStart: 0.25,
    end: 0.33,
    position: "left-center",
    enterDirection: "down",
    exitDirection: "left", // WHAT DO slides left and fades
    badgeClass: "text-[#ffa51f] bg-black/60 border-white/15",
    textClass: "text-white drop-shadow-2xl",
  },
  {
    id: "2-i-do",
    label: "PURPOSE",
    text: "I DO?",
    start: 0.13,
    enterEnd: 0.19,
    exitStart: 0.25,
    end: 0.33,
    position: "right-center",
    enterDirection: "down",
    exitDirection: "right", // I DO? slides right and fades
    badgeClass: "text-black bg-white/90 border-black/10",
    textClass: "text-black drop-shadow-sm",
  },

  // 2nd Scroll - Part B: Final Reveal / The Answer
  {
    id: "2-reveal-left",
    label: "THE MISSION",
    text: "I CREATE.",
    start: 0.31,
    enterEnd: 0.37,
    exitStart: 0.46,
    end: 0.53,
    position: "left-center",
    enterDirection: "left",
    exitDirection: "up",
    badgeClass: "text-[#F28C28] bg-black/70 border-[#F28C28]/30",
    textClass: "text-white drop-shadow-2xl",
  },
  {
    id: "2-reveal-right",
    label: "THE STANDARD",
    text: "THE BEST DIGITAL EXPERIENCE",
    lines: [
      "THE",
      "BEST DIGITAL",
      "EXPERIENCE",
    ],
    start: 0.31,
    enterEnd: 0.37,
    exitStart: 0.46,
    end: 0.53,
    position: "right-center",
    enterDirection: "right",
    exitDirection: "up",
    badgeClass: "text-black bg-white/95 border-black/15 shadow-lg",
    textClass: "text-black drop-shadow-sm",
  },

  // 3rd Scroll - Services & Expertise
  {
    id: "3-left",
    label: "SERVICES",
    text: "Website development\n3D character animation",
    lines: [
      "Website development",
      "3D character animation",
    ],
    start: 0.53,
    enterEnd: 0.59,
    exitStart: 0.69,
    end: 0.75,
    position: "left-center",
    enterDirection: "down",
    exitDirection: "up",
  },
  {
    id: "3-right",
    label: "EXPERTISE",
    text: "Product advertisement\nAI products building",
    lines: [
      "Product advertisement",
      "AI products building",
    ],
    start: 0.53,
    enterEnd: 0.59,
    exitStart: 0.69,
    end: 0.75,
    position: "right-center",
    enterDirection: "down",
    exitDirection: "up",
  },

  // 4th Scroll - Explore / Studio Link
  {
    id: 4,
    label: "EXPLORE & COLLABORATE",
    text: "Wanna check out my works scroll below or visit at (www.zephyranstudio.com)",
    linkUrl: "https://www.zephyranstudio.com",
    linkText: "www.zephyranstudio.com",
    start: 0.75,
    enterEnd: 0.81,
    exitStart: 0.87,
    end: 0.93,
    position: "right-center",
    enterDirection: "down",
    exitDirection: "up",
  },
];

export const SHUTTER_START_PROGRESS = 0.87;
export const SHUTTER_END_PROGRESS = 1.00;
