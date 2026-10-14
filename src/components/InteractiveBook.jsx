"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Tiny local class-name joiner — avoids needing the "@/lib/utils" alias.
function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

// Plain inline SVG icons — avoids a lucide-react dependency that was
// conflicting with the bundler's React instance ("dispatcher is null").
function XIcon({ size = 24 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function RefreshIcon({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="1 4 1 10 7 10" />
      <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
    </svg>
  );
}

// A quiet decorative panel for the intentionally-blank left pages —
// a soft color wash, a full ornamental frame with flourished corners,
// and a large faded icon watermark tied to that role. No text, but
// enough visual weight that it doesn't read as an empty afterthought.
function BlankPageOrnament({ color = "#c9a86a", icon }) {
  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden">
      {/* soft color wash */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `radial-gradient(circle at 50% 42%, ${color}14 0%, transparent 68%)`,
        }}
      />

      {/* giant faded watermark icon */}
      {icon && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "7.5rem",
            opacity: 0.1,
            filter: "grayscale(0.3)",
          }}
        >
          {icon}
        </div>
      )}

      <svg viewBox="0 0 300 420" className="absolute inset-0 w-full h-full" style={{ opacity: 0.55 }} preserveAspectRatio="xMidYMid meet">
        {/* double frame */}
        <rect x="18" y="18" width="264" height="384" fill="none" stroke={color} strokeWidth="1" opacity="0.4" />
        <rect x="26" y="26" width="248" height="368" fill="none" stroke={color} strokeWidth="0.5" opacity="0.28" />

        {/* top & bottom rule lines, like a certificate */}
        <line x1="70" y1="70" x2="230" y2="70" stroke={color} strokeWidth="0.75" opacity="0.35" />
        <line x1="70" y1="350" x2="230" y2="350" stroke={color} strokeWidth="0.75" opacity="0.35" />

        {/* small emblem marks flanking the top rule */}
        <circle cx="62" cy="70" r="2.5" fill={color} opacity="0.5" />
        <circle cx="238" cy="70" r="2.5" fill={color} opacity="0.5" />
        <circle cx="62" cy="350" r="2.5" fill={color} opacity="0.5" />
        <circle cx="238" cy="350" r="2.5" fill={color} opacity="0.5" />

        {/* four flourished corners */}
        <path d="M18 46 Q18 18 46 18" fill="none" stroke={color} strokeWidth="1.2" opacity="0.4" />
        <path d="M254 18 Q282 18 282 46" fill="none" stroke={color} strokeWidth="1.2" opacity="0.4" />
        <path d="M18 374 Q18 402 46 402" fill="none" stroke={color} strokeWidth="1.2" opacity="0.4" />
        <path d="M282 374 Q282 402 254 402" fill="none" stroke={color} strokeWidth="1.2" opacity="0.4" />
      </svg>
    </div>
  );
}

// ── Real 3D CSS, applied inline ──────────────────────────────────
// These three properties are the ones that actually matter for a
// book-flip effect. They are NOT default Tailwind utilities
// ("perspective-[...]", "preserve-3d", "backface-hidden", "rotate-y-180"
// don't exist out of the box), which is why faces were bleeding through
// each other. Setting them directly in style={} guarantees they apply
// no matter what the project's tailwind.config looks like.
const faceBaseStyle = { backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden" };

/**
 * InteractiveBook
 *
 * Props:
 *  - coverImage: string (image url or data URI)
 *  - bookTitle, bookAuthor: string
 *  - pages: [{ title, content, pageNumber }]  — content renders on the
 *    single visible (right) page; the left page is always blank paper.
 *  - width, height: number | string
 */
export default function InteractiveBook({
  coverImage,
  bookTitle = "Book Title",
  bookAuthor = "Author Name",
  pages,
  className,
  width = 350,
  height = 500,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentPageIndex, setCurrentPageIndex] = useState(-1);
  const [isHovering, setIsHovering] = useState(false);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  const widthNum = typeof width === "number" ? width : 350;

  // ── Responsive: "compact" mode ─────────────────────────────────
  // An open book is two pages wide (2 × width). If that doesn't fit the screen,
  // we stop shifting the book to centre the spread; instead the right-hand
  // (content) page stays centred and the blank left pages slide off-screen.
  // Prev / Next buttons appear since the left page can't be tapped any more.
  const [viewportW, setViewportW] = useState(
    typeof window !== "undefined" ? window.innerWidth : 1280
  );
  useEffect(() => {
    const on = () => setViewportW(window.innerWidth);
    window.addEventListener("resize", on);
    window.addEventListener("orientationchange", on);
    return () => {
      window.removeEventListener("resize", on);
      window.removeEventListener("orientationchange", on);
    };
  }, []);
  const compact = viewportW < widthNum * 2 + 48;

  const handleCoverMouseMove = (e) => {
    if (isOpen) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width; // 0 → 1
    const py = (e.clientY - rect.top) / rect.height; // 0 → 1
    setTilt({
      y: -12 - px * 10,
      x: (py - 0.5) * 8,
    });
  };

  const BOOK_OPEN_DURATION = 1.5;
  const EASING = [0.25, 0, 0, 1];

  const handleOpenBook = () => setIsOpen(true);

  const handleCloseBook = (e) => {
    e?.stopPropagation();
    setIsOpen(false);
    setCurrentPageIndex(-1);
  };

  const nextPage = (e) => {
    e?.stopPropagation();
    if (currentPageIndex < pages.length - 1) {
      setCurrentPageIndex((prev) => prev + 1);
    }
  };

  const prevPage = (e) => {
    e?.stopPropagation();
    if (currentPageIndex >= 0) {
      setCurrentPageIndex((prev) => prev - 1);
    }
  };

  const restartBook = (e) => {
    e?.stopPropagation();
    setCurrentPageIndex(-1);
  };

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === "ArrowRight") nextPage();
      if (e.key === "ArrowLeft") prevPage();
      if (e.key === "Escape") handleCloseBook();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, currentPageIndex]);

  return (
    <div
      className={cn("relative flex items-center justify-center", className)}
      style={{
        // was width * 3.5 (e.g. 1260px) which overflowed phones and tablets
        width: "100%",
        maxWidth: typeof width === "number" ? width * 3.5 : "100%",
        height: typeof height === "number" ? height + 100 : "auto",
        perspective: "2000px",
        overflow: compact ? "hidden" : "visible",
      }}
    >
      <motion.div
        className="relative"
        style={{ width, height, transformStyle: "preserve-3d" }}
        initial={{ x: 0 }}
        animate={{ x: isOpen && !compact ? widthNum / 2 : 0 }}
        transition={{ duration: BOOK_OPEN_DURATION, ease: EASING }}
      >
        {/* Front Cover */}
        <motion.div
          className="absolute inset-0 w-full h-full origin-left"
          initial={{ rotateY: 0, rotateX: 0, zIndex: 100 }}
          animate={{
            rotateY: isOpen ? -180 : isHovering ? tilt.y : 0,
            rotateX: isOpen ? 0 : isHovering ? tilt.x : 0,
            zIndex: isOpen ? 0 : 100,
          }}
          transition={{
            rotateY: { duration: isHovering && !isOpen ? 0.2 : BOOK_OPEN_DURATION, ease: EASING },
            rotateX: { duration: 0.2, ease: EASING },
            zIndex: { delay: isOpen ? BOOK_OPEN_DURATION * 0.6 : BOOK_OPEN_DURATION * 0.4 },
          }}
          style={{ transformStyle: "preserve-3d" }}
          onClick={!isOpen ? handleOpenBook : undefined}
          onMouseMove={handleCoverMouseMove}
          onHoverStart={() => !isOpen && setIsHovering(true)}
          onHoverEnd={() => setIsHovering(false)}
        >
          {/* Front Face */}
          <div
            className="absolute inset-0 w-full h-full rounded-r-md rounded-l-sm shadow-2xl cursor-pointer overflow-hidden group"
            style={{ ...faceBaseStyle, transform: "translateZ(0.5px)" }}
          >
            <div
              className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
              style={{ backgroundImage: `url(${coverImage})` }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

            <div className="absolute bottom-4 left-3 right-3 text-white text-left">
              <h1 className="text-sm font-serif font-bold tracking-wide mb-1 drop-shadow-md leading-tight">
                {bookTitle}
              </h1>
              <p className="text-[8px] font-sans tracking-widest opacity-90 uppercase border-t border-white/30 pt-1 inline-block">
                {bookAuthor}
              </p>
            </div>
          </div>

          {/* Back Face (Inner Cover) */}
          <div
            className="absolute inset-0 w-full h-full rounded-l-md rounded-r-sm bg-[#fdfbf7] flex flex-col p-8 border-r border-neutral-200 shadow-xl cursor-pointer hover:bg-[#fcfaf5] transition-colors"
            style={{ ...faceBaseStyle, transform: "rotateY(180deg) translateZ(0.5px)" }}
            onClick={(e) => {
              e.stopPropagation();
              prevPage();
            }}
          >
            <div className="flex-1 flex flex-col justify-center items-center text-center opacity-80">
              <h2 className="text-2xl font-serif text-neutral-800 mb-2 tracking-wide">{bookTitle}</h2>
              <div className="w-8 h-[1px] bg-neutral-300 mb-3" />
              <p className="text-xs text-neutral-500 uppercase tracking-widest">Interactive Edition</p>
            </div>
          </div>
        </motion.div>

        {/* Pages Stack */}
        <div className="absolute inset-0 w-full h-full z-0" style={{ transformStyle: "preserve-3d" }}>
          {pages.map((page, index) => {
            const isFlipped = index <= currentPageIndex;
            return (
              <motion.div
                key={index}
                className="absolute inset-0 w-full h-full origin-left bg-[#fdfbf7] rounded-r-md rounded-l-sm shadow-sm border border-neutral-100"
                style={{ transformStyle: "preserve-3d" }}
                initial={{ rotateY: 0, zIndex: pages.length - index }}
                animate={{
                  rotateY: isFlipped ? -180 : 0,
                  zIndex: isFlipped ? index + 1 : pages.length - index,
                }}
                transition={{ duration: 0.6, ease: [0.645, 0.045, 0.355, 1] }}
              >
                {/* Front Face (Right Side) — all content lives here */}
                <div
                  className="absolute inset-0 w-full h-full p-6 flex flex-col bg-[#fdfbf7] cursor-pointer hover:bg-[#fcfaf5] transition-colors overflow-y-auto"
                  style={{ ...faceBaseStyle, transform: "translateZ(0.5px)" }}
                  onClick={(e) => {
                    e.stopPropagation();
                    nextPage();
                  }}
                >
                  <div className="text-xs text-neutral-400 text-right mb-2 font-sans tracking-wider">
                    {page.pageNumber}
                  </div>
                  <div className="flex-1 select-none">{page.content}</div>
                </div>

                {/* Back Face (Left Side) — intentionally blank of text, but decorated */}
                <div
                  className="absolute inset-0 w-full h-full bg-[#fdfbf7] border-r border-neutral-200 overflow-hidden cursor-pointer hover:bg-[#fcfaf5] transition-colors"
                  style={{ ...faceBaseStyle, transform: "rotateY(180deg) translateZ(0.5px)" }}
                  onClick={(e) => {
                    e.stopPropagation();
                    prevPage();
                  }}
                >
                  <BlankPageOrnament color={page.accentColor} icon={page.icon} />
                </div>
              </motion.div>
            );
          })}

          {/* Back Cover (Static) */}
          <div
            className="absolute inset-0 w-full h-full bg-[#fdfbf7] rounded-r-md rounded-l-sm shadow-xl border border-neutral-200"
            style={{ transform: "translateZ(-1px)", zIndex: -1 }}
          >
            <div className="absolute inset-0 p-8 flex flex-col items-center justify-center text-center opacity-40">
              <p className="font-serif text-neutral-500 italic">The End</p>
              <button
                onClick={restartBook}
                className="mt-4 flex items-center gap-2 px-4 py-2 rounded-full bg-neutral-100 hover:bg-neutral-200 transition-colors text-sm text-neutral-600 cursor-pointer"
              >
                <RefreshIcon size={14} /> Read Again
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Prev / Next buttons — compact (small-screen) mode only */}
      {isOpen && compact && (
        <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-3 z-[60]">
          <button
            onClick={prevPage}
            disabled={currentPageIndex < 0}
            className="px-5 py-2 rounded-full bg-white/70 text-sm text-neutral-700 shadow-sm disabled:opacity-40"
          >
            ‹ Prev
          </button>
          <button
            onClick={nextPage}
            disabled={currentPageIndex >= pages.length - 1}
            className="px-5 py-2 rounded-full bg-white/70 text-sm text-neutral-700 shadow-sm disabled:opacity-40"
          >
            Next ›
          </button>
        </div>
      )}

      {/* Close Button */}
      <AnimatePresence>
        {isOpen && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={handleCloseBook}
            className="absolute top-2 right-2 sm:top-8 sm:right-8 p-2 rounded-full bg-white/50 dark:bg-neutral-800/50 hover:bg-white dark:hover:bg-neutral-800 border border-transparent hover:border-neutral-200 dark:hover:border-neutral-700 backdrop-blur-sm text-neutral-800 dark:text-neutral-100 z-[1000] transition-all hover:scale-110 shadow-sm hover:shadow-xl"
          >
            <XIcon size={24} />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Hint */}
      {!isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 1 }}
          className="absolute bottom-4 text-neutral-500 dark:text-neutral-400 text-sm font-medium tracking-widest uppercase cursor-pointer z-50 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors"
          onClick={handleOpenBook}
        >
          {compact ? "Tap to Open" : "Click to Open"}
        </motion.div>
      )}
    </div>
  );
}