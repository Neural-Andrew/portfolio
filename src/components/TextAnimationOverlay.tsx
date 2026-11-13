/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  TextPlaceholderConfig,
  calculatePlaceholderAnimation,
  DEFAULT_TEXT_PLACEHOLDERS,
} from '../types';

interface TextAnimationOverlayProps {
  progress: number;
  placeholders?: TextPlaceholderConfig[];
}

export const TextAnimationOverlay: React.FC<TextAnimationOverlayProps> = ({
  progress,
  placeholders = DEFAULT_TEXT_PLACEHOLDERS,
}) => {
  return (
    <div
      id="text-animation-overlay-layer"
      className="absolute inset-0 pointer-events-none z-30 overflow-hidden"
      aria-hidden="true"
    >
      {placeholders.map((config) => {
        const anim = calculatePlaceholderAnimation(progress, config);

        if (!anim.visible && anim.opacity === 0) {
          return null;
        }

        const isRight = config.position === 'right-center';
        const positionClass = isRight
          ? 'top-1/2 right-6 sm:right-10 md:right-16 lg:right-20 -translate-y-1/2 text-right items-end'
          : 'top-1/2 left-6 sm:left-10 md:left-16 lg:left-20 -translate-y-1/2 text-left items-start';

        return (
          <div
            key={config.id}
            id={`text-placeholder-${config.id}`}
            className={`absolute flex flex-col pointer-events-none transition-[filter] duration-75 will-change-transform ${positionClass} ${config.className || ''}`}
            style={{
              opacity: anim.opacity,
              transform: `translate3d(${anim.translateX.toFixed(2)}px, ${anim.translateY.toFixed(2)}px, 0) scale(${anim.scale.toFixed(3)})`,
              filter: `blur(${anim.blur.toFixed(2)}px)`,
            }}
          >
            {/* Category / Indicator Badge */}
            <span
              className={`inline-block text-[10px] sm:text-xs font-mono font-bold uppercase tracking-[0.25em] px-3.5 py-1 rounded-full mb-3 backdrop-blur-md shadow-md border ${
                config.badgeClass
                  ? config.badgeClass
                  : isRight
                  ? 'text-black bg-white/90 border-black/10'
                  : 'text-[#ffa51f] bg-black/60 border-white/15'
              }`}
            >
              {config.label}
            </span>

            {/* Render Multiline or Single Text */}
            {config.lines && config.lines.length > 0 ? (
              <div className="flex flex-col gap-1.5 sm:gap-2.5 max-w-md lg:max-w-xl">
                {config.lines.map((line, idx) => (
                  <div
                    key={idx}
                    className={`flex items-center gap-2.5 sm:gap-3 ${isRight ? 'justify-end' : 'justify-start'}`}
                  >
                    {!isRight && (
                      <span className="w-2.5 h-2.5 rounded-full bg-[#ffa51f] shrink-0 inline-block shadow-sm" />
                    )}
                    <span
                      className={`font-geist font-black text-2xl sm:text-4xl md:text-5xl lg:text-6xl uppercase tracking-tight leading-[0.95] ${
                        config.textClass
                          ? config.textClass
                          : isRight
                          ? 'text-black drop-shadow-sm'
                          : 'text-white drop-shadow-2xl'
                      }`}
                    >
                      {line}
                    </span>
                    {isRight && (
                      <span className="w-2.5 h-2.5 rounded-full bg-black shrink-0 inline-block shadow-sm" />
                    )}
                  </div>
                ))}
              </div>
            ) : config.linkUrl ? (
              <div className="max-w-[300px] sm:max-w-[360px] md:max-w-[400px] lg:max-w-[440px] flex flex-col items-end gap-2.5 sm:gap-3 text-right">
                <p className="font-geist font-black text-lg sm:text-2xl md:text-3xl uppercase tracking-tight text-black leading-snug drop-shadow-xs">
                  Wanna check out my works scroll below or visit at
                </p>
                <a
                  href={config.linkUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="pointer-events-auto inline-flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-full bg-black text-white hover:bg-black/80 active:scale-95 transition-all font-geist text-xs sm:text-sm font-bold uppercase tracking-wider shadow-lg group"
                >
                  <span>({config.linkText || 'www.zephyranstudio.com'})</span>
                  <span className="text-[#ffa51f] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform">↗</span>
                </a>
              </div>
            ) : (
              <p
                className={`font-geist font-black text-4xl sm:text-6xl md:text-7xl lg:text-8xl uppercase tracking-tight leading-tight max-w-xl ${
                  config.textClass
                    ? config.textClass
                    : isRight
                    ? 'text-black drop-shadow-sm'
                    : 'text-white drop-shadow-2xl'
                }`}
              >
                {config.text}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
};
