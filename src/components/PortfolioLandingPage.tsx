/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { motion } from 'framer-motion';
import { 
  ArrowUpRight, 
  ArrowRight, 
  Linkedin, 
  Github, 
  Youtube, 
  Mail, 
  Bot, 
  Sparkles,
  Radio
} from 'lucide-react';
import { ScrollControlledVideoSection } from './ScrollControlledVideoSection';

gsap.registerPlugin(ScrollTrigger);

const HLS_SOURCE_URL = 'https://stream.mux.com/Aa02T7oM1wH5Mk5EEVDYhbZ1ChcdhRsS2m1NYyx4Ua1g.m3u8';
const HERO_ROLES = ["Founder", "Designer", "Fullstack", "Animator"];

interface PortfolioLandingPageProps {
  isVisible?: boolean;
}

export const PortfolioLandingPage: React.FC<PortfolioLandingPageProps> = ({ isVisible = true }) => {
  const [roleIndex, setRoleIndex] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeNav, setActiveNav] = useState<'Home' | 'Work'>('Home');

  const heroVideoRef = useRef<HTMLVideoElement>(null);
  const footerVideoRef = useRef<HTMLVideoElement>(null);
  const heroContentRef = useRef<HTMLDivElement>(null);
  const marqueeTrackRef = useRef<HTMLDivElement>(null);

  // Cycle hero roles every 2s
  useEffect(() => {
    const interval = setInterval(() => {
      setRoleIndex((prev) => (prev + 1) % HERO_ROLES.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  // Track window scroll for navbar shadow
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Setup HLS video streams for Hero and Footer
  useEffect(() => {
    const setupHls = (videoElement: HTMLVideoElement | null) => {
      if (!videoElement) return null;

      if (Hls.isSupported()) {
        const hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true,
        });
        hls.loadSource(HLS_SOURCE_URL);
        hls.attachMedia(videoElement);
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          videoElement.play().catch(() => {});
        });
        return hls;
      } else if (videoElement.canPlayType('application/vnd.apple.mpegurl')) {
        videoElement.src = HLS_SOURCE_URL;
        videoElement.addEventListener('loadedmetadata', () => {
          videoElement.play().catch(() => {});
        });
      }
      return null;
    };

    const heroHls = setupHls(heroVideoRef.current);
    const footerHls = setupHls(footerVideoRef.current);

    return () => {
      heroHls?.destroy();
      footerHls?.destroy();
    };
  }, []);

  // GSAP Entrance animation for Hero Content & ScrollTrigger setup
  useEffect(() => {
    const ctx = gsap.context(() => {
      // Hero entrance timeline
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      tl.fromTo(
        ".name-reveal",
        { opacity: 0, y: 50 },
        { opacity: 1, y: 0, duration: 1.2, delay: 0.1 }
      );

      tl.fromTo(
        ".blur-in",
        { opacity: 0, filter: "blur(10px)", y: 20 },
        { opacity: 1, filter: "blur(0px)", y: 0, duration: 1, stagger: 0.1 },
        "-=0.8"
      );

      // GSAP Marquee in Contact section
      if (marqueeTrackRef.current) {
        gsap.to(marqueeTrackRef.current, {
          xPercent: -50,
          duration: 35,
          ease: "none",
          repeat: -1,
        });
      }
    });

    return () => ctx.revert();
  }, []);

  const projects = [
    {
      id: 'ai-products',
      title: 'AI Products',
      category: 'AI & Machine Learning Systems',
      span: 'md:col-span-5',
      aspect: 'aspect-square md:aspect-[4/3]',
      mediaType: 'video' as const,
      media: 'https://res.cloudinary.com/yxbd933e/video/upload/v1787586710/traf__pindown.io_1787586346_jduhuz.mp4',
      resolution: '1080 × 1080',
      description: 'End-to-end intelligent AI application design, LLM workflows, conversational interfaces, and bespoke product systems.',
    },
    {
      id: 'website-landing-page',
      title: 'Website / Landing Page',
      category: 'Web Design & Fullstack',
      span: 'md:col-span-7',
      aspect: 'aspect-[16/10]',
      mediaType: 'video' as const,
      media: 'https://res.cloudinary.com/yxbd933e/video/upload/v1787586709/roy660ba_pindown.io_1787586452_lkls5z.mp4',
      resolution: '1920 × 1080',
      description: 'High-conversion interactive landing pages, WebGL kinetic experiences, and responsive digital brand platforms.',
    },
    {
      id: 'character-animation',
      title: 'Character Animation',
      category: '3D Character & Motion Design',
      span: 'md:col-span-5',
      aspect: 'aspect-[4/5] md:aspect-[4/3]',
      mediaType: 'video' as const,
      media: 'https://res.cloudinary.com/yxbd933e/video/upload/v1787586739/scene3_fnxcih.mp4',
      resolution: '1080 × 1920',
      description: 'Expressive 3D character rigging, stylized cinematic animations, dynamic choreography, and spacetime physics simulations.',
    },
    {
      id: 'product-advertisement',
      title: 'Product Advertisement',
      category: 'Commercial 3D & Brand VFX',
      span: 'md:col-span-7',
      aspect: 'aspect-[16/10]',
      mediaType: 'image' as const,
      media: 'https://res.cloudinary.com/yxbd933e/image/upload/v1787586815/0360_bpgtjg.png',
      resolution: '1080 × 1080',
      description: 'Ultra-photorealistic commercial rendering, studio lighting composition, tactile material physics, and ad campaigns.',
    },
  ];

  const primaryStats = [
    { value: '1+', label: 'Year of Experience' },
    { value: '50+', label: 'Projects Done' },
    { value: '300%', label: 'Satisfied Clients' },
  ];

  const reachStats = [
    { value: '100k', label: 'Impressions on LinkedIn in 1 year' },
    { value: '20k', label: 'Views on YouTube (Character animation)' },
  ];

  const socialLinks = [
    {
      id: 'linkedin',
      name: 'LinkedIn',
      handle: 'in/andrewrohith',
      subtext: 'Professional Network & Insights',
      url: 'https://www.linkedin.com/in/andrewrohith/',
      accentColor: '#0A66C2',
      glowShadow: 'hover:shadow-[0_0_35px_rgba(10,102,194,0.4)]',
      borderHover: 'hover:border-[#0A66C2]/80',
      badge: 'Connect',
      iconType: 'linkedin' as const,
    },
    {
      id: 'x',
      name: 'X (Twitter)',
      handle: '@andrew_roh98483',
      subtext: 'Real-time Thoughts & Drops',
      url: 'https://x.com/andrew_roh98483',
      accentColor: '#FFFFFF',
      glowShadow: 'hover:shadow-[0_0_35px_rgba(255,255,255,0.25)]',
      borderHover: 'hover:border-white/80',
      badge: 'Follow',
      iconType: 'x' as const,
    },
    {
      id: 'github',
      name: 'GitHub',
      handle: 'ANDREW777777777777',
      subtext: 'Open-Source & Repositories',
      url: 'https://github.com/ANDREW777777777777',
      accentColor: '#A371F7',
      glowShadow: 'hover:shadow-[0_0_35px_rgba(163,113,247,0.4)]',
      borderHover: 'hover:border-[#A371F7]/80',
      badge: 'Codebase',
      iconType: 'github' as const,
    },
    {
      id: 'huggingface',
      name: 'Hugging Face',
      handle: 'AndrewAgents7',
      subtext: 'AI Models & Neural Spaces',
      url: 'https://huggingface.co/AndrewAgents7',
      accentColor: '#FFD21E',
      glowShadow: 'hover:shadow-[0_0_35px_rgba(255,210,30,0.4)]',
      borderHover: 'hover:border-[#FFD21E]/80',
      badge: 'AI Models',
      iconType: 'huggingface' as const,
    },
    {
      id: 'youtube',
      name: 'YouTube',
      handle: '@DrewDimension7',
      subtext: 'Character Animation & VFX',
      url: 'https://www.youtube.com/@DrewDimension7',
      accentColor: '#FF0000',
      glowShadow: 'hover:shadow-[0_0_35px_rgba(255,0,0,0.4)]',
      borderHover: 'hover:border-[#FF0000]/80',
      badge: 'Subscribe',
      iconType: 'youtube' as const,
    },
    {
      id: 'gmail',
      name: 'Gmail',
      handle: 'zephyran3d@gmail.com',
      subtext: 'Direct Inquiries & Bookings',
      url: 'https://mail.google.com/mail/?view=cm&fs=1&to=zephyran3d@gmail.com',
      accentColor: '#EA4335',
      glowShadow: 'hover:shadow-[0_0_35px_rgba(234,67,53,0.4)]',
      borderHover: 'hover:border-[#EA4335]/80',
      badge: 'Email Me',
      iconType: 'gmail' as const,
    },
  ];

  return (
    <div className="relative w-full bg-bg text-text-primary min-h-screen selection:bg-[#89AACC] selection:text-black font-body overflow-x-hidden">
      
      {/* ================= FLOATING FIXED NAVBAR ================= */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 flex justify-center pt-4 md:pt-6 px-4 transition-all duration-500 ease-out ${
          isVisible ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 -translate-y-8 pointer-events-none'
        }`}
      >
        <nav
          className={`inline-flex items-center rounded-full backdrop-blur-md border border-white/10 bg-surface px-2 py-2 transition-all duration-300 ${
            isScrolled ? 'shadow-md shadow-black/40 border-white/15' : ''
          }`}
        >
          {/* Logo Circle with Accent Gradient Border */}
          <a
            href="#hero"
            aria-label="Back to Top"
            className="group relative w-9 h-9 rounded-full flex items-center justify-center p-[2px] cursor-pointer hover:scale-110 transition-transform duration-300"
          >
            <div className="absolute inset-0 rounded-full accent-gradient group-hover:rotate-180 transition-transform duration-700" />
            <div className="relative w-full h-full rounded-full bg-bg flex items-center justify-center">
              <span className="font-display italic text-[13px] text-text-primary font-normal">
                A
              </span>
            </div>
          </a>

          {/* Divider */}
          <div className="w-px h-5 bg-stroke mx-1 hidden sm:block" />

          {/* Nav links */}
          <div className="flex items-center gap-1">
            {(['Home', 'Work'] as const).map((item) => (
              <a
                key={item}
                href={item === 'Home' ? '#hero' : '#work'}
                onClick={() => setActiveNav(item)}
                className={`text-xs sm:text-sm rounded-full px-3.5 sm:px-4 py-1.5 sm:py-2 transition-all duration-200 ${
                  activeNav === item
                    ? 'text-text-primary bg-stroke/50 font-medium'
                    : 'text-muted hover:text-text-primary hover:bg-stroke/50'
                }`}
              >
                {item}
              </a>
            ))}
          </div>
        </nav>
      </header>

      {/* ================= SECTION 2: HERO ================= */}
      <section
        id="hero"
        className="relative w-full min-h-screen flex items-center justify-center overflow-hidden pt-24 pb-16 px-6 sm:px-10"
      >
        {/* Background HLS Video */}
        <div className="absolute inset-0 w-full h-full overflow-hidden z-0">
          <video
            ref={heroVideoRef}
            autoPlay
            muted
            loop
            playsInline
            className="absolute top-1/2 left-1/2 min-w-full min-h-full w-auto h-auto object-cover -translate-x-1/2 -translate-y-1/2 z-0"
          />
          {/* Dark Overlay */}
          <div className="absolute inset-0 bg-black/20 z-10 pointer-events-none" />
          {/* Bottom Fade */}
          <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-bg to-transparent z-10 pointer-events-none" />
        </div>

        {/* Hero Centered Content */}
        <div
          ref={heroContentRef}
          className="relative z-20 max-w-4xl mx-auto text-center flex flex-col items-center"
        >
          {/* Eyebrow */}
          <div className="blur-in text-xs text-muted uppercase tracking-[0.3em] mb-8 font-mono">
            COLLECTION &apos;26
          </div>

          {/* Name Reveal */}
          <h1 className="name-reveal text-6xl sm:text-8xl md:text-9xl font-display italic leading-[0.9] tracking-tight text-text-primary mb-6">
            Andrew
          </h1>

          {/* Role line */}
          <div className="blur-in text-lg sm:text-2xl text-text-primary/90 font-light mb-6 flex items-center justify-center flex-wrap gap-2">
            <span>A</span>
            <span
              key={roleIndex}
              className="font-display italic text-text-primary animate-role-fade-in inline-block border-b border-[#89AACC]/40 px-1"
            >
              {HERO_ROLES[roleIndex]}
            </span>
            <span>lives in Chennai.</span>
          </div>

          {/* Description */}
          <p className="blur-in text-sm md:text-base text-muted max-w-md mb-12 leading-relaxed font-normal">
            Designing seamless digital interactions by focusing on the unique nuances which bring systems to life.
          </p>

          {/* CTA Buttons */}
          <div className="blur-in inline-flex items-center gap-4 flex-wrap justify-center">
            {/* "See Works" Solid Button */}
            <a
              href="#work"
              className="group relative rounded-full text-sm px-7 py-3.5 bg-text-primary text-bg font-medium hover:scale-105 transition-all duration-300 cursor-pointer shadow-lg"
            >
              <span className="absolute -inset-[2px] rounded-full accent-gradient opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10" />
              <span className="group-hover:text-text-primary transition-colors duration-300">
                See Works
              </span>
            </a>

            {/* "Reach out..." Outlined Button */}
            <a
              href="#contact"
              className="group relative rounded-full text-sm px-7 py-3.5 border-2 border-stroke bg-bg text-text-primary font-medium hover:scale-105 transition-all duration-300 cursor-pointer"
            >
              <span className="absolute -inset-[2px] rounded-full accent-gradient opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10" />
              <span>Reach out...</span>
            </a>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-3 pointer-events-none">
          <span className="text-[10px] sm:text-xs text-muted uppercase tracking-[0.2em] font-mono">
            SCROLL
          </span>
          <div className="relative w-px h-10 bg-stroke overflow-hidden">
            <div className="w-full h-1/2 accent-gradient animate-scroll-down" />
          </div>
        </div>
      </section>

      {/* ================= SECTION 2.5: SCROLL-CONTROLLED 7s BACKGROUND VIDEO ================= */}
      <ScrollControlledVideoSection />

      {/* ================= SECTION 3: SELECTED WORKS / SERVICES ================= */}
      <section id="work" className="relative z-20 bg-bg py-16 md:py-24 shadow-[0_-40px_80px_rgba(0,0,0,0.95)]">
        <div className="max-w-[1200px] mx-auto px-6 md:px-10 lg:px-16">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1, ease: [0.25, 0.1, 0.25, 1] }}
            className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 md:mb-16 border-b border-stroke pb-8"
          >
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-px bg-stroke" />
                <span className="text-xs text-muted uppercase tracking-[0.3em] font-mono">
                  Services I Offer
                </span>
              </div>
              <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-text-primary">
                Featured <span className="font-display italic font-normal">services</span>
              </h2>
              <p className="text-sm md:text-base text-muted max-w-md leading-relaxed">
                Specialized creative &amp; technical services — from intelligent AI products to interactive web platforms, character motion, and commercial VFX.
              </p>
            </div>

            {/* "View all work" Button (Desktop Only) */}
            <a
              href="#contact"
              className="hidden md:inline-flex group relative items-center gap-2 px-6 py-3 rounded-full bg-surface border border-stroke text-sm text-text-primary transition-all duration-300 hover:scale-105"
            >
              <span className="absolute -inset-[2px] rounded-full accent-gradient opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10" />
              <span>Get in touch</span>
              <ArrowRight className="w-4 h-4 text-muted group-hover:text-text-primary group-hover:translate-x-1 transition-all" />
            </a>
          </motion.div>

          {/* Bento Grid */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5 md:gap-6">
            {projects.map((project) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className={`group relative bg-surface border border-stroke rounded-3xl overflow-hidden cursor-pointer ${project.span} ${project.aspect}`}
              >
                {/* Background Media (Video or Image) */}
                {project.mediaType === 'video' ? (
                  <video
                    src={project.media}
                    autoPlay
                    loop
                    muted
                    playsInline
                    preload="auto"
                    crossOrigin="anonymous"
                    tabIndex={-1}
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                  />
                ) : (
                  <img
                    src={project.media}
                    alt={project.title}
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                  />
                )}

                {/* Subtle Gradient & Halftone Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />
                <div
                  className="absolute inset-0 pointer-events-none opacity-20 mix-blend-multiply"
                  style={{
                    backgroundImage: 'radial-gradient(circle, #000 1px, transparent 1px)',
                    backgroundSize: '4px 4px',
                  }}
                />

                {/* Static Meta (Bottom Left) */}
                <div className="absolute bottom-6 left-6 right-6 z-10 pointer-events-none">
                  <div className="text-[11px] font-mono text-[#89AACC] uppercase tracking-wider mb-1">
                    {project.category}
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                    {project.title}
                  </h3>
                </div>

                {/* Hover Backdrop Overlay */}
                <div className="absolute inset-0 bg-bg/75 backdrop-blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20 flex flex-col justify-end p-8">
                  <div className="space-y-2">
                    <span className="font-mono text-xs text-[#89AACC] uppercase tracking-wider font-semibold block">
                      {project.category}
                    </span>
                    <h3 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                      {project.title}
                    </h3>
                    <p className="text-sm sm:text-base text-text-primary/90 leading-relaxed max-w-md pt-1">
                      {project.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= SECTION 4: STATS & MILESTONES ================= */}
      <section className="bg-bg py-16 md:py-24 border-t border-stroke">
        <div className="max-w-[1200px] mx-auto px-6 md:px-10 lg:px-16 space-y-16 md:space-y-20">
          
          {/* Row 1: Core Performance Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 divide-y md:divide-y-0 md:divide-x divide-stroke">
            {primaryStats.map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: i * 0.15 }}
                className={`pt-6 md:pt-0 ${i !== 0 ? 'md:pl-12' : ''} space-y-2`}
              >
                <div className="text-5xl sm:text-6xl md:text-7xl font-display italic text-text-primary tracking-tight">
                  {stat.value}
                </div>
                <div className="text-sm text-muted uppercase tracking-[0.2em] font-mono">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Row 2: Digital Reach & Impact */}
          <div className="pt-10 border-t border-stroke/60">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 divide-y md:divide-y-0 md:divide-x divide-stroke">
              {reachStats.map((stat, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: 0.2 + i * 0.15 }}
                  className={`pt-6 md:pt-0 ${i !== 0 ? 'md:pl-12' : ''} space-y-2`}
                >
                  <div className="text-5xl sm:text-6xl md:text-7xl font-display italic text-text-primary tracking-tight">
                    {stat.value}
                  </div>
                  <div className="text-sm text-muted uppercase tracking-[0.18em] font-mono">
                    {stat.label}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Row 3: Centered Agency Vision Statement */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.35 }}
            className="pt-6 flex justify-center text-center"
          >
            <div className="relative inline-flex flex-col sm:flex-row items-center justify-center gap-3 px-8 py-5 rounded-3xl bg-surface/40 border border-stroke backdrop-blur-md">
              <span className="w-2.5 h-2.5 rounded-full bg-[#89AACC] animate-pulse shrink-0" />
              <p className="text-base sm:text-lg md:text-xl font-medium tracking-tight text-text-primary">
                Building <span className="font-display italic text-[#89AACC] font-normal text-xl sm:text-2xl px-1">@Zephyranstudio</span> to become a registered agency by <span className="font-mono text-white/90 font-semibold">2028</span>
              </p>
            </div>
          </motion.div>

        </div>
      </section>

      {/* ================= SECTION 7: CONTACT / FOOTER ================= */}
      <footer
        id="contact"
        className="relative bg-bg pt-16 md:pt-24 pb-12 overflow-hidden border-t border-stroke"
      >
        {/* Background HLS Video (Vertically Flipped) */}
        <div className="absolute inset-0 w-full h-full overflow-hidden z-0 pointer-events-none">
          <video
            ref={footerVideoRef}
            autoPlay
            muted
            loop
            playsInline
            className="absolute top-1/2 left-1/2 min-w-full min-h-full w-auto h-auto object-cover -translate-x-1/2 -translate-y-1/2 scale-y-[-1] opacity-60 z-0"
          />
          <div className="absolute inset-0 bg-black/60 z-10" />
        </div>

        {/* GSAP Marquee */}
        <div className="relative z-20 w-full overflow-hidden py-6 border-y border-stroke/40 mb-16 select-none">
          <div
            ref={marqueeTrackRef}
            className="whitespace-nowrap flex items-center font-display italic text-3xl sm:text-5xl md:text-6xl text-text-primary/70 tracking-wide"
          >
            {Array.from({ length: 10 }).map((_, i) => (
              <span key={i} className="inline-block mx-4">
                BUILDING THE FUTURE •
              </span>
            ))}
          </div>
        </div>

        {/* Contact CTA Center */}
        <div className="relative z-20 max-w-5xl mx-auto px-6 text-center space-y-10">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-surface/80 border border-stroke text-[11px] text-muted uppercase tracking-[0.3em] font-mono backdrop-blur-md">
              <Radio className="w-3 h-3 text-[#89AACC] animate-pulse" />
              <span>GET IN TOUCH &amp; CONNECT</span>
            </div>

            <h2 className="text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight text-text-primary">
              Let&apos;s create something <span className="font-display italic font-normal text-[#89AACC]">exceptional.</span>
            </h2>

            <p className="text-sm sm:text-base text-muted max-w-lg mx-auto leading-relaxed">
              Available for bespoke AI systems, high-conversion web platforms, 3D character motion, and commercial VFX collaborations.
            </p>
          </div>

          {/* Primary Quick Email Action */}
          <div className="pt-2">
            <a
              href="https://mail.google.com/mail/?view=cm&fs=1&to=zephyran3d@gmail.com"
              target="_blank"
              rel="noopener noreferrer"
              className="group relative inline-flex items-center gap-3 px-8 sm:px-10 py-4 rounded-full bg-white text-black font-bold text-xs sm:text-sm tracking-wider uppercase transition-all duration-300 hover:scale-105 cursor-pointer shadow-[0_0_35px_rgba(255,255,255,0.2)]"
            >
              <span className="absolute -inset-[2px] rounded-full accent-gradient opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10" />
              <Mail className="w-4 h-4 text-black group-hover:rotate-12 transition-transform duration-300" />
              <span>zephyran3d@gmail.com</span>
              <ArrowUpRight className="w-4 h-4 text-black group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </a>
          </div>

          {/* Interactive Motion Graphic Social Links Matrix */}
          <div className="pt-8">
            <div className="text-left mb-6 flex items-center justify-between border-b border-stroke/60 pb-3">
              <span className="text-xs font-mono uppercase tracking-[0.25em] text-muted flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-[#89AACC]" />
                Direct Channels &amp; Platforms
              </span>
              <span className="text-[11px] font-mono text-muted/80">
                [6 ACTIVE HUBS]
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 text-left">
              {socialLinks.map((link, idx) => (
                <motion.a
                  key={link.id}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  initial={{ opacity: 0, y: 25 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: idx * 0.08 }}
                  whileHover={{ y: -6, scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`group relative flex flex-col justify-between p-5 sm:p-6 rounded-3xl bg-surface/50 hover:bg-surface/90 border border-stroke backdrop-blur-xl transition-all duration-300 cursor-pointer overflow-hidden ${link.borderHover} ${link.glowShadow}`}
                >
                  {/* Kinetic Ambient Glow Blob on Hover */}
                  <div
                    className="absolute -right-12 -top-12 w-32 h-32 rounded-full opacity-0 group-hover:opacity-20 blur-2xl transition-opacity duration-500 pointer-events-none"
                    style={{ backgroundColor: link.accentColor }}
                  />

                  {/* Animated Light Sweep / Laser Scanline */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out pointer-events-none" />

                  {/* Top Bar: Icon & Badge */}
                  <div className="flex items-center justify-between mb-4 relative z-10">
                    <div
                      className="w-11 h-11 rounded-2xl bg-black/40 border border-white/10 flex items-center justify-center text-white group-hover:scale-110 transition-transform duration-300 shadow-inner"
                      style={{ color: link.accentColor }}
                    >
                      {link.iconType === 'linkedin' && <Linkedin className="w-5 h-5" />}
                      {link.iconType === 'x' && (
                        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                        </svg>
                      )}
                      {link.iconType === 'github' && <Github className="w-5 h-5" />}
                      {link.iconType === 'huggingface' && (
                        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                          <path d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.604-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.53 1.03 1.53 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.163 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
                        </svg>
                      )}
                      {link.iconType === 'youtube' && <Youtube className="w-5 h-5" />}
                      {link.iconType === 'gmail' && <Mail className="w-5 h-5" />}
                    </div>

                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/40 border border-white/10 text-[10px] font-mono uppercase tracking-wider text-muted group-hover:text-white transition-colors">
                      <span
                        className="w-1.5 h-1.5 rounded-full animate-ping"
                        style={{ backgroundColor: link.accentColor }}
                      />
                      {link.badge}
                    </span>
                  </div>

                  {/* Channel Details */}
                  <div className="space-y-1 relative z-10">
                    <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-1.5">
                      <span>{link.name}</span>
                      <ArrowUpRight className="w-4 h-4 text-muted group-hover:text-white group-hover:translate-x-1 group-hover:-translate-y-1 transition-all duration-300" />
                    </h3>
                    <div className="font-mono text-xs text-[#89AACC] truncate">
                      {link.handle}
                    </div>
                    <p className="text-xs text-muted leading-relaxed pt-1 line-clamp-1">
                      {link.subtext}
                    </p>
                  </div>

                  {/* Bottom Kinetic Active Line */}
                  <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[10px] font-mono text-muted/70 group-hover:text-muted transition-colors relative z-10">
                    <span>STATUS: LIVE</span>
                    <span className="group-hover:translate-x-0.5 transition-transform">
                      EXPLORE ↗
                    </span>
                  </div>
                </motion.a>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Bottom Bar */}
        <div className="relative z-20 max-w-[1200px] mx-auto px-6 md:px-10 lg:px-16 mt-20 pt-8 border-t border-stroke flex flex-col sm:flex-row items-center justify-between gap-6 font-mono text-xs text-muted">
          <div className="flex flex-wrap items-center gap-6">
            <a href="https://www.linkedin.com/in/andrewrohith/" target="_blank" rel="noopener noreferrer" className="hover:text-text-primary transition-colors">
              LinkedIn
            </a>
            <a href="https://x.com/andrew_roh98483" target="_blank" rel="noopener noreferrer" className="hover:text-text-primary transition-colors">
              X.com
            </a>
            <a href="https://github.com/ANDREW777777777777" target="_blank" rel="noopener noreferrer" className="hover:text-text-primary transition-colors">
              GitHub
            </a>
            <a href="https://huggingface.co/AndrewAgents7" target="_blank" rel="noopener noreferrer" className="hover:text-text-primary transition-colors">
              Hugging Face
            </a>
            <a href="https://www.youtube.com/@DrewDimension7" target="_blank" rel="noopener noreferrer" className="hover:text-text-primary transition-colors">
              YouTube
            </a>
          </div>

          <div className="flex items-center gap-2 text-text-primary">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Available for projects</span>
          </div>

          <div>
            © 2026 ANDREW. ALL RIGHTS RESERVED.
          </div>
        </div>
      </footer>
    </div>
  );
};
