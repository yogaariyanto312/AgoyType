"use client";

import { useEffect, useRef } from "react";
import { useConfigStore } from "@/store/config-store";
import { getTheme } from "@/lib/themes";

/**
 * Lightweight, zero-dependency "constellation" particle background rendered on a
 * single full-screen canvas behind all content. Colours follow the active theme
 * (the `--tt-main` accent), it pauses when the tab is hidden, and it renders a
 * single static frame when the user prefers reduced motion.
 *
 * The canvas is transparent (only dots + links are drawn) so the page's themed
 * background shows through, and it sits at `-z-10` with `pointer-events: none`
 * so it never interferes with typing or clicks.
 */
export function ParticleBackground() {
  const themeId = useConfigStore((s) => s.themeId);
  const enabled = useConfigStore((s) => s.particlesBg);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // HSL triple of the accent colour, e.g. "32 95% 55%"
  const colorRef = useRef<string>(getTheme(themeId).colors.ttMain);

  // keep the particle colour in sync with the selected theme
  useEffect(() => {
    colorRef.current = getTheme(themeId).colors.ttMain;
  }, [themeId]);

  useEffect(() => {
    const el = canvasRef.current;
    if (!el) return;
    const context = el.getContext("2d");
    if (!context) return;
    // narrowed, non-null aliases so the closures below keep the type
    const canvas = el;
    const ctx = context;

    if (!enabled) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      return;
    }

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const LINK_DIST = 130;

    let width = 0;
    let height = 0;
    let particles: { x: number; y: number; vx: number; vy: number }[] = [];
    let raf = 0;
    let running = true;

    function seed() {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // particle count scales with viewport area, capped for performance
      const count = Math.min(90, Math.max(24, Math.floor((width * height) / 16000)));
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
      }));
    }

    function draw() {
      ctx.clearRect(0, 0, width, height);
      const hsl = colorRef.current;

      // move + draw the dots
      for (const p of particles) {
        if (!reduceMotion) {
          p.x += p.vx;
          p.y += p.vy;
          if (p.x <= 0 || p.x >= width) p.vx *= -1;
          if (p.y <= 0 || p.y >= height) p.vy *= -1;
        }
        ctx.beginPath();
        ctx.arc(p.x, p.y, 1.5, 0, Math.PI * 2);
        ctx.fillStyle = `hsl(${hsl} / 0.45)`;
        ctx.fill();
      }

      // link nearby dots; fade the line with distance
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const a = particles[i];
          const b = particles[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.hypot(dx, dy);
          if (dist < LINK_DIST) {
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = `hsl(${hsl} / ${0.12 * (1 - dist / LINK_DIST)})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      }

      if (running && !reduceMotion) raf = requestAnimationFrame(draw);
    }

    function onResize() {
      seed();
      if (reduceMotion) draw();
    }

    function onVisibility() {
      if (document.hidden) {
        running = false;
        cancelAnimationFrame(raf);
      } else if (!reduceMotion && !running) {
        running = true;
        raf = requestAnimationFrame(draw);
      }
    }

    seed();
    window.addEventListener("resize", onResize);
    document.addEventListener("visibilitychange", onVisibility);

    if (reduceMotion) draw();
    else raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [enabled]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10"
    />
  );
}
