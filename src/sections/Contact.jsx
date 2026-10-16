import { useState, useEffect, useRef } from "react";

// ── THEME ───────────────────────────────────────────────────────
const T = {
  bg:     "#faf7f2",
  card:   "#ffffff",
  border: "#e6ddd0",
  txt:    "#241c14",
  txt2:   "#6b6155",
  txt3:   "#9c9184",
  teal:   "#b8621a",
  violet: "#8b4a2a",
  blue:   "#d4a24c",
};

// ── PLACE THE TWO VIDEO FILES HERE IN YOUR PROJECT ──────────────
// public/videos/reach.mp4
// public/videos/hand-flip.mp4
const REACH_SRC = "/videos/reach.mp4";
const FLIP_SRC = "/videos/Hand-flip.mp4";

const EMAIL_ADDR = "kritikaj.ds.24@nitj.ac.in";

// ── PLACE THE LOGO IMAGES HERE IN YOUR PROJECT ───────────────────
// public/icons/github-logo.png
// public/icons/linkedin-logo.png
// public/icons/gmail-logo.png
const GITHUB_LOGO = "/icons/github-logo.png";
const LINKEDIN_LOGO = "/icons/linkedin-logo.png";
const GMAIL_LOGO = "/icons/gmail-logo.png";

const CHAPTERS = [
  { label: "GitHub",   value: "@kritika8006",       href: "https://github.com/kritika8006",                accent:T.violet,   logo: GITHUB_LOGO,   kind: "link" },
  { label: "LinkedIn", value: "kritika-joshi-nitj", href: "https://www.linkedin.com/in/kritika-joshi-nitj", accent: T.violet, logo: LINKEDIN_LOGO, kind: "link" },
  { label: "Email",    value: EMAIL_ADDR,           href: `mailto:${EMAIL_ADDR}`,                          accent: T.violet,   logo: GMAIL_LOGO,    kind: "email" },
];

const prefersReducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// The flip video's native pixel size — needed to correctly map a point
// measured on the raw video frame onto the screen once objectFit:"cover"
// has scaled/cropped it to fill the (differently-shaped) viewport.
const VIDEO_W = 1280;
const VIDEO_H = 720;

// Coordinates below were measured directly against the flip video's final,
// settled frame (as fractions of the 1280×720 source, NOT of the screen).
// Left page - logo
const LOGO_FRAC = {
  x: 0.345,
  y: 0.405,
};

// Right page - text
const TEXT_FRAC = {
  x: 0.605,
  y: 0.315,
};

// Converts a fraction-of-the-source-video point into a CSS left/top
// percentage of the on-screen container, accounting for how objectFit:
// "cover" scales and crops the video.
function coverFractionToPercent(frac, containerW, containerH) {
  if (!containerW || !containerH) return { left: `${frac.x * 100}%`, top: `${frac.y * 100}%` };
  const scale = Math.max(containerW / VIDEO_W, containerH / VIDEO_H);
  const renderedW = VIDEO_W * scale;
  const renderedH = VIDEO_H * scale;
  const offsetX = (containerW - renderedW) / 2;
  const offsetY = (containerH - renderedH) / 2;
  const screenX = offsetX + frac.x * VIDEO_W * scale;
  const screenY = offsetY + frac.y * VIDEO_H * scale;
  return { left: `${(screenX / containerW) * 100}%`, top: `${(screenY / containerH) * 100}%` };
}

export default function Contact() {
  const containerRef = useRef(null);
  const stickyRef = useRef(null);
  const reachRef = useRef(null);
  const flipRef = useRef(null);
  const markersRef = useRef([]);       // invisible scroll targets, one per chapter
  const lastScrollStep = useRef(0);    // the chapter the scroll position last pointed at
  const navLock = useRef(false);       // true while a dot-click scroll is animating
  const [step, setStep] = useState(0);
  const [phase, setPhase] = useState("reach"); // reach | flip | reveal
  const [emailState, setEmailState] = useState("idle");
  const [stageSize, setStageSize] = useState({ w: 0, h: 0 });
  const timers = useRef([]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  // keep the measured stage size in sync with the actual rendered box
  useEffect(() => {
    const el = stickyRef.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const update = () => {
      const rect = el.getBoundingClientRect();
      setStageSize({ w: rect.width, h: rect.height });
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    window.addEventListener("orientationchange", update);
    return () => {
      ro.disconnect();
      window.removeEventListener("orientationchange", update);
    };
  }, []);

  // scroll → which chapter is active
  useEffect(() => {
    const onScroll = () => {
      const el = containerRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const total = rect.height - window.innerHeight;
      const scrolled = -rect.top;
      const progress = total > 0 ? Math.min(1, Math.max(0, scrolled / total)) : 0;
      let s = Math.floor(progress * CHAPTERS.length);
      if (s >= CHAPTERS.length) s = CHAPTERS.length - 1;
      if (s !== lastScrollStep.current) {
        lastScrollStep.current = s;
        if (!navLock.current) setStep(s);
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // whenever the active chapter changes — replay reach/flip → reveal
  useEffect(() => {
    const reach = reachRef.current;
    const flip = flipRef.current;
    if (!reach || !flip) return;

    if (prefersReducedMotion()) {
      setPhase("reveal");
      return;
    }

    const fallbacks = [];
    const timeupdateCleanups = [];

    const revealNearEnd = (video) => {
      const trigger = () => setPhase("reveal");

      const onTimeUpdate = () => {
        if (video.duration && isFinite(video.duration) && video.currentTime / video.duration > 0.88) {
          video.removeEventListener("timeupdate", onTimeUpdate);
          trigger();
        }
      };
      video.addEventListener("timeupdate", onTimeUpdate);
      timeupdateCleanups.push(() => video.removeEventListener("timeupdate", onTimeUpdate));

      const estSeconds = video.duration && isFinite(video.duration) ? video.duration / video.playbackRate : 4.545;
      fallbacks.push(setTimeout(trigger, estSeconds * 0.92 * 1000));
    };

    if (step === 0) {
      setPhase("reach");
      reach.currentTime = 0;
      reach.playbackRate = 2.2;
      reach.play().catch(() => {});
      flip.pause();
      flip.currentTime = 0;
      flip.playbackRate = 2.2;

      const onReachEnded = () => {
        setPhase("flip");
        flip.currentTime = 0;
        flip.play().catch(() => {});
        revealNearEnd(flip);
      };

      reach.addEventListener("ended", onReachEnded);
      fallbacks.push(setTimeout(() => setPhase((p) => (p === "reach" ? "flip" : p)), 4500));
      fallbacks.push(setTimeout(() => setPhase("reveal"), 9500));

      return () => {
        reach.removeEventListener("ended", onReachEnded);
        fallbacks.forEach(clearTimeout);
        timeupdateCleanups.forEach((fn) => fn());
      };
    }

    // subsequent chapters — the book's already open, just flip to a new page
    reach.pause();
    setPhase("flip");
    flip.currentTime = 0;
    flip.playbackRate = 2.2;
    flip.play().catch(() => {});
    revealNearEnd(flip);
    fallbacks.push(setTimeout(() => setPhase("reveal"), 5200));

    return () => {
      fallbacks.forEach(clearTimeout);
      timeupdateCleanups.forEach((fn) => fn());
    };
  }, [step]);

  const chapter = CHAPTERS[step];
  const isEmail = chapter.kind === "email";

  // ── Responsive layout ────────────────────────────────────────────
  // Portrait screens switch to a "stacked" layout: the video sits in an uncropped
  // 16:9 box and everything else renders in a column underneath it.
  const stacked = stageSize.w > 0 && stageSize.w / stageSize.h < 0.95;
  const vidH = (stageSize.w * 9) / 16;
  const vidTop = Math.max(140, Math.min(170, stageSize.h * 0.15));

  const videoBox = stacked
    ? { position: "absolute", left: 0, top: vidTop, width: "100%", height: vidH, objectFit: "cover" }
    : { position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" };

  // On-book overlay sizes scale with the rendered video.
  const scale = Math.max(stageSize.w / VIDEO_W, stageSize.h / VIDEO_H) || 1;
  const px = (base, min, max) => Math.round(Math.min(max, Math.max(min, base * scale)));
  const logoW   = px(190, 80, 290);
  const textW   = px(225, 150, 340);
  const labelFs = px(21, 16, 38);
  const valueFs = px(12.5, 11, 20);
  const linkFs  = px(14.5, 12, 24);

  const logoPos = coverFractionToPercent(LOGO_FRAC, stageSize.w, stageSize.h);
  const textPos = coverFractionToPercent(TEXT_FRAC, stageSize.w, stageSize.h);

  const handleEmailAction = (e) => {
    e.preventDefault();
    window.location.href = `mailto:${EMAIL_ADDR}`;
    setEmailState("sent");
    timers.current.push(setTimeout(() => setEmailState("idle"), 3000));
  };

  const goTo = (i) => {
    navLock.current = true;
    timers.current.push(setTimeout(() => { navLock.current = false; }, 1200));
    setStep(i);
    markersRef.current[i]?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // jump straight to the revealed book
  const skipIntro = () => {
    const reach = reachRef.current;
    const flip = flipRef.current;
    reach?.pause();
    if (flip) {
      flip.pause();
      if (flip.duration && isFinite(flip.duration)) {
        flip.currentTime = Math.max(0, flip.duration - 0.05);
      }
    }
    setPhase("reveal");
  };

  // ← NEW: big, obvious skip button (shown only while the videos play)
  const skipButton = (
    <button
      type="button"
      onClick={skipIntro}
      className="skip-btn"
      style={{
        alignSelf: "center",
        padding: "13px 30px", borderRadius: 999, border: "none", cursor: "pointer",
        background: "#f97316", color: "#fff",
        fontSize: "1rem", fontWeight: 700, letterSpacing: "0.03em",
        display: "inline-flex", alignItems: "center", gap: 10,
        animation: "fadeOnly .5s ease both .4s, pulseRing 2s ease-out infinite 1s",
      }}
    >
      <span style={{ fontSize: "1.1rem" }}>⏭</span> Skip video
    </button>
  );

  // ← NEW: three big cards — logo + name + handle. The whole card is a link.
  const linkCards = (
    <div style={{
      display: "flex", gap: stacked ? 10 : 16, justifyContent: "center",
      flexWrap: "wrap", width: "100%",
    }}>
      {CHAPTERS.map((c, i) => {
        const email = c.kind === "email";
        const active = i === step;
        return (
          <a
            key={c.label}
            href={c.href}
            target={email ? undefined : "_blank"}
            rel="noreferrer"
            onClick={email ? handleEmailAction : undefined}
            className="link-card"
            style={{
              display: "flex",
              flexDirection: stacked ? "column" : "row",
              alignItems: "center",
              gap: stacked ? 8 : 14,
              flex: stacked ? "1 1 0" : "0 1 auto",
              minWidth: stacked ? 0 : 230,
              boxSizing: "border-box",
              padding: stacked ? "14px 6px" : "14px 24px",
              borderRadius: 16,
              background: "rgba(245,241,232,0.97)",
              border: `2px solid ${active ? "#f97316" : "transparent"}`,
              boxShadow: "0 8px 24px rgba(0,0,0,0.35)",
              textDecoration: "none",
              textAlign: stacked ? "center" : "left",
              animation: `fadeOnly .5s ease both ${i * 0.1}s`,
            }}
          >
            <img
              src={c.logo}
              alt={`${c.label} logo`}
              style={{ width: stacked ? 40 : 52, height: stacked ? 40 : 52, objectFit: "contain", flexShrink: 0 }}
            />
            <span style={{ minWidth: 0 }}>
              <span style={{ display: "block", color: "#1f1710", fontWeight: 700, fontSize: stacked ? "0.95rem" : "1.1rem", fontFamily: "Georgia, serif" }}>
                {c.label}
              </span>
              <span style={{ display: "block", color: "#4a3f2e", fontSize: stacked ? "0.72rem" : "0.82rem", fontFamily: "Georgia, serif", marginTop: 2, overflowWrap: "anywhere" }}>
                {email && emailState === "sent"
                  ? "Sent ✓"
                  : stacked
                    ? "Tap to open →"
                    : c.value}
              </span>
            </span>
          </a>
        );
      })}
    </div>
  );

  return (
<div style={{ fontFamily: "'Inter',system-ui,sans-serif", background: T.bg, color: T.txt2 }}>
       <style>{`
  @keyframes fadeUp {
    from { opacity:0; transform:translateY(16px); }
    to { opacity:1; transform:translateY(0); }
  }

  @keyframes cardIn {
    from { opacity:0; transform:translateY(14px) scale(.97); }
    to { opacity:1; transform:translateY(0) scale(1); }
  }

  @keyframes fadeOnly {
    from { opacity:0; }
    to { opacity:1; }
  }

  /* ← NEW: soft pulsing ring so the skip button is easy to notice */
  @keyframes pulseRing {
    0%   { box-shadow: 0 0 0 0 rgba(249,115,22,0.6), 0 6px 18px rgba(0,0,0,0.35); }
    70%  { box-shadow: 0 0 0 14px rgba(249,115,22,0), 0 6px 18px rgba(0,0,0,0.35); }
    100% { box-shadow: 0 0 0 0 rgba(249,115,22,0), 0 6px 18px rgba(0,0,0,0.35); }
  }

  @keyframes inkReveal {
    from {
      clip-path: inset(0 100% 0 0);
      opacity: 0;
      filter: blur(3px);
    }

    50% {
      opacity: 1;
      filter: blur(1px);
    }

    to {
      clip-path: inset(0 0 0 0);
      opacity: 1;
      filter: blur(0);
    }
  }

  .ink-title {
    display: inline-block;
    overflow: hidden;
    white-space: nowrap;
    animation: inkReveal 2.8s cubic-bezier(.22,1,.36,1) forwards;
  }

  /* the long heading can't stay on one line on narrow screens */
  @media (max-width: 720px) {
    .ink-title { white-space: normal; }
  }

  @media (prefers-reduced-motion: reduce) {
    * {
      transition-duration: .01ms !important;
      animation: none !important;
    }
  }

  .cta-link {
    transition: opacity .2s ease, text-decoration-thickness .2s ease;
  }

  .cta-link:hover {
    opacity: .75;
    text-decoration-thickness: 3px;
  }

  .skip-btn {
    transition: transform .2s ease, background .2s ease;
  }
  .skip-btn:hover {
    background: #ea580c !important;
    transform: translateY(-2px);
  }

  .link-card {
    transition: transform .2s ease, border-color .2s ease;
  }
  .link-card:hover {
    transform: translateY(-4px);
    border-color: #f97316 !important;
  }
`}</style>

      <div ref={containerRef} style={{ height: "300vh", position: "relative" }}>
        {/* invisible scroll targets, one per chapter */}
        {CHAPTERS.map((c, i) => (
          <div
            key={c.label}
            ref={(el) => (markersRef.current[i] = el)}
            aria-hidden="true"
            style={{
              position: "absolute", left: 0, width: 1, height: 1,
              top: `${(200 * (i + 0.5)) / CHAPTERS.length}vh`,
              pointerEvents: "none",
            }}
          />
        ))}

        <div ref={stickyRef} style={{
          position: "sticky", top: 0, height: "100vh", width: "100%", overflow: "hidden",
          background: stacked ? "#14100a" : undefined,
        }}>

          <video
            ref={reachRef}
            src={REACH_SRC}
            poster="/videos/reach-poster.jpg"
            preload="auto"
            muted
            playsInline
            style={{
              ...videoBox,
              opacity: phase === "reach" ? 1 : 0, transition: "opacity .6s ease",
            }}
          />
          <video
            ref={flipRef}
            src={FLIP_SRC}
            poster="/videos/flip-poster.jpg"
            preload="auto"
            muted
            playsInline
            style={{
              ...videoBox,
              opacity: phase === "flip" || phase === "reveal" ? 1 : 0, transition: "opacity .6s ease",
            }}
          />

          {/* subtle scrim behind the heading so it stays legible over any frame */}
          <div style={{
            position: "absolute", inset: 0,
            background: "linear-gradient(180deg, rgba(10,7,3,0.28) 0%, rgba(10,7,3,0.08) 18%, transparent 38%, transparent 72%, rgba(20,14,6,0.35) 100%)",
            pointerEvents: "none",
          }} />

<div
  style={{
    position: "relative",
    zIndex: 1,
    textAlign: "center",
    padding: stacked ? "1.25rem 1rem 0.5rem" : "0.6rem 2rem 1rem",
    animation: "fadeUp .7s ease both",
    pointerEvents: "none",
  }}
>
  <span
    style={{
      display: "block",
      marginBottom: "0.5rem",
      transform: "translateY(-10px)",

      fontSize: "clamp(0.7rem, 2.4vw, 0.95rem)",
      fontWeight: 800,
      letterSpacing: "0.22em",
      textTransform: "uppercase",
      color: stacked ? "#c9b48a" : "#8b7355",
      fontFamily: "'Poppins', sans-serif",

      textShadow: `
        0 1px 1px rgba(255,255,255,.55),
        0 3px 10px rgba(139,90,43,.35)
      `,
    }}
  >
    Portfolio · Contact
  </span>

  <h1
    key={phase}
    className={phase === "reveal" ? "ink-title" : ""}
    style={{
      display: "inline-block",
      maxWidth: "100%",

      color: "#F5F1E8",
      fontSize: "clamp(1.7rem,4.8vw,3.6rem)",
      fontWeight: 900,
      fontFamily: "'Playfair Display', serif",
      letterSpacing: "-0.03em",
      lineHeight: 1.15,

      margin: stacked ? "-0.6rem auto 0" : "-1.4rem auto 0",

      textShadow: `
  0 1px 1px rgba(255,255,255,.08),
  0 4px 10px rgba(0,0,0,.35)
`,
    }}
  >
    A book for every way to reach me
  </h1>
</div>

          {/* ── Desktop / landscape: details drawn ON the book pages ── */}
          {phase === "reveal" && !stacked && (
            <div key={step}>
              {/* left page — the logo */}
              <div style={{
                position: "absolute", left: logoPos.left, top: logoPos.top, transform: "translate(-50%,-50%)",
                zIndex: 2, animation: "cardIn .6s cubic-bezier(.16,1,.3,1) both",
              }}>
                <img
                  src={chapter.logo}
                  alt={`${chapter.label} logo`}
                  style={{ width: logoW, height: "auto", display: "block", mixBlendMode: "multiply", opacity: 0.9 }}
                />
              </div>

              {/* right page — name/label + link */}
              <div style={{
                position: "absolute", left: textPos.left, top: textPos.top, transform: "translate(-50%,-50%)",
                zIndex: 2, textAlign: "center", animation: "cardIn .6s cubic-bezier(.16,1,.3,1) .1s both",
                width: textW,
              }}>
                <div style={{ color: "#1f1710", fontWeight: 600, fontSize: labelFs, marginBottom: 6, fontFamily: "Georgia, serif", letterSpacing: "0.01em", mixBlendMode: "multiply" }}>
                  {chapter.label}
                </div>
                <div style={{ color: "#4a3f2e", fontSize: valueFs, marginBottom: 12, fontFamily: "Georgia, serif", mixBlendMode: "multiply", overflowWrap: "anywhere" }}>
                  {isEmail && emailState === "sent" ? "Sent ✓ — check your mail app" : chapter.value}
                </div>
                <a
                  href={chapter.href}
                  target={isEmail ? undefined : "_blank"}
                  rel="noreferrer"
                  onClick={isEmail ? handleEmailAction : undefined}
                  className="cta-link"
                  style={{
                    fontSize: linkFs, fontWeight: 700, color: chapter.accent,
                    textDecoration: "underline", textUnderlineOffset: 5, textDecorationThickness: 2,
                  }}
                >
                  {isEmail ? "Send an email" : `Open ${chapter.label} →`}
                </a>
              </div>
            </div>
          )}

          {/* ← NEW: Desktop slot — skip button during the intro, cards after it.
              Both live in the same spot, just above the dots, so they never overlap. */}
          {!stacked && (
            <div style={{
              position: "absolute", left: 0, right: 0, bottom: 76, zIndex: 10,
              display: "flex", justifyContent: "center", padding: "0 1.5rem",
            }}>
              {phase === "reveal" ? linkCards : skipButton}
            </div>
          )}

          {/* ← NEW: Stacked (portrait) slot — one column under the video,
              pinned between the video and the dots. */}
          {stacked && (
            <div style={{
              position: "absolute",
              left: "50%", transform: "translateX(-50%)",
              top: vidTop + vidH + 20,
              bottom: 76,
              width: "min(94%, 480px)",
              zIndex: 10,
              display: "flex", flexDirection: "column", justifyContent: "flex-start",
            }}>
              {phase === "reveal" ? linkCards : skipButton}
            </div>
          )}

          {/* dots */}
          <div style={{
            position: "absolute", left: 0, right: 0, bottom: "4%", zIndex: 10,
            display: "flex", justifyContent: "center",
          }}>
            <div style={{ display: "flex", gap: 12, background: "rgba(20,14,6,0.45)", borderRadius: 999, padding: "0.55rem 0.9rem" }}>
              {CHAPTERS.map((c, i) => (
                <button
                  key={c.label}
                  type="button"
                  onClick={() => goTo(i)}
                  aria-label={`Go to ${c.label}`}
                  title={c.label}
                  style={{
                    width: 14, height: 14, borderRadius: "50%", border: "none", cursor: "pointer", padding: 0,
                    background: i === step ? "#f97316" : "rgba(255,255,255,0.65)",
                    transform: i === step ? "scale(1.25)" : "scale(1)",
                    transition: "background .3s ease, transform .3s ease",
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* the strip below the book also holds the links */}
      <div style={{ textAlign: "center", padding: "1.75rem", borderTop: `1px solid ${T.border}` }}>
        <div style={{ display: "flex", justifyContent: "center", gap: 18, flexWrap: "wrap" }}>
          {CHAPTERS.map((c) => (
            <a
              key={c.label}
              href={c.href}
              target={c.kind === "email" ? undefined : "_blank"}
              rel="noreferrer"
              style={{ color: T.teal, fontSize: "0.85rem", fontWeight: 600, textDecoration: "none" }}
            >
              {c.label}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}