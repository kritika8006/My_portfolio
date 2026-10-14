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
// The two blank areas sit at different heights, so these are independent:
//   - left page's blank area centers around (27%, 52%) of the raw frame
//   - right page's drawn placeholder box centers around (66%, 46%)
// Left page - GitHub logo
const LOGO_FRAC = {
  x: 0.345,   // unchanged
  y: 0.405,   // 2 blocks further up
};

// Right page - GitHub text
const TEXT_FRAC = {
  x: 0.605,   // 4 blocks left
  y: 0.315,   // 6 blocks up
};
// Converts a fraction-of-the-source-video point into a CSS left/top
// percentage of the on-screen container, accounting for how objectFit:
// "cover" scales and crops the video to fill a container whose aspect
// ratio generally does NOT match the video's 16:9 native aspect ratio.
// Without this, a flat percentage only lines up by coincidence — it drifts
// as soon as the browser window is a different shape.
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
  const [step, setStep] = useState(0);
  const [phase, setPhase] = useState("reach"); // reach | flip | reveal
  const [emailState, setEmailState] = useState("idle");
  const [stageSize, setStageSize] = useState({ w: 0, h: 0 });
  const timers = useRef([]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  // keep the measured stage size in sync with the actual rendered box the
  // video fills (not just window size — this is robust to layout changes)
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
      setStep(s);
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
    // safety net: if a video ever fails to autoplay/fire 'ended' (slow network,
    // browser autoplay policy, etc.), force the reveal anyway after a max wait —
    // the section should never get permanently stuck.

    // Reveal only once the flip clip has actually settled — measured against
    // the real footage, the page is still visibly turning through ~85-90% of
    // this clip's length, so triggering on a flat short timeout showed the
    // overlay while the hand was still mid-flip. Instead we watch playback
    // progress and reveal near the very end, with a duration-aware fallback
    // in case metadata/timeupdate isn't available.
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

      // duration-aware fallback: ~92% of the clip's real playback time
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

    // subsequent chapters — the book's already open on the table, just flip to a new page
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
  // On portrait screens (phones, portrait tablets) objectFit:"cover" would crop
  // the 16:9 video down to a thin centre strip and push the logo/text overlays
  // off-screen. So below ~0.95 aspect ratio we switch to a "stacked" layout:
  // the video sits in a 16:9 box (no cropping) and the chapter details render
  // in a card underneath instead of on top of the book pages.
  const stacked = stageSize.w > 0 && stageSize.w / stageSize.h < 0.95;
  const vidH = (stageSize.w * 9) / 16;
  const vidTop = Math.max(150, stageSize.h * 0.2);

  const videoBox = stacked
    ? { position: "absolute", left: 0, top: vidTop, width: "100%", height: vidH, objectFit: "cover" }
    : { position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" };

  // Overlay sizing scales with how big the video is actually rendered.
  const scale = Math.max(stageSize.w / VIDEO_W, stageSize.h / VIDEO_H) || 1;
  const logoW = Math.round(Math.min(150, Math.max(56, 110 * scale)));
  const textW = Math.round(Math.min(300, Math.max(120, 240 * scale)));

  const logoPos = coverFractionToPercent(LOGO_FRAC, stageSize.w, stageSize.h);
  const textPos = coverFractionToPercent(TEXT_FRAC, stageSize.w, stageSize.h);

  const handleEmailAction = (e) => {
    e.preventDefault();
    window.location.href = `mailto:${EMAIL_ADDR}`;
    setEmailState("sent");
    timers.current.push(setTimeout(() => setEmailState("idle"), 3000));
  };

  const goTo = (i) => {
    const el = containerRef.current;
    if (!el) return;
    const total = el.getBoundingClientRect().height - window.innerHeight;
    const targetY = window.scrollY + el.getBoundingClientRect().top + (total * (i + 0.5)) / CHAPTERS.length;
    window.scrollTo({ top: targetY, behavior: "smooth" });
  };

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

  /* cardIn above animates transform, which would override the centring
     transform on the stacked card, so it gets its own fade-only animation */
  @keyframes fadeOnly {
    from { opacity:0; }
    to { opacity:1; }
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
`}</style>

      <div ref={containerRef} style={{ height: "300vh", position: "relative" }}>
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

          {phase === "reveal" && !stacked && (
            <div key={step}>
              {/*
                Positions are computed at runtime (see coverFractionToPercent
                above) from LOGO_FRAC / TEXT_FRAC — coordinates measured on
                the raw 1280×720 video frame — mapped through the same
                scale/crop math the browser applies for objectFit:"cover".
                This keeps the logo and text pinned to the actual blank page
                and drawn box regardless of the viewport's aspect ratio.
                The two areas sit at different heights on the page, so their
                positions are independent, not a shared row.
              */}

              {/* left page — the logo, centered in the blank area of the left page */}
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

              {/* right page — name/label + link, centered inside the drawn box on the right page */}
              <div style={{
                position: "absolute", left: textPos.left, top: textPos.top, transform: "translate(-50%,-50%)",
                zIndex: 2, textAlign: "center", animation: "cardIn .6s cubic-bezier(.16,1,.3,1) both .1s",
                width: textW,
              }}>
                <div style={{ color: "#1f1710", fontWeight: 600, fontSize: "clamp(0.95rem,2.2vw,1.6rem)", marginBottom: 4, fontFamily: "Georgia, serif", letterSpacing: "0.01em", mixBlendMode: "multiply" }}>
                  {chapter.label}
                </div>
                <div style={{ color: "#4a3f2e", fontSize: "clamp(0.62rem,1.2vw,0.88rem)", marginBottom: 10, fontFamily: "Georgia, serif", mixBlendMode: "multiply", wordBreak: "break-word" }}>
                  {isEmail && emailState === "sent" ? "Sent ✓ — check your mail app" : chapter.value}
                </div>
                <a
                  href={chapter.href}
                  target={isEmail ? undefined : "_blank"}
                  rel="noreferrer"
                  onClick={isEmail ? handleEmailAction : undefined}
                  className="cta-link"
                  style={{
                    fontSize: "clamp(0.72rem,1.2vw,0.9rem)", fontWeight: 700, color: chapter.accent,
                    textDecoration: "underline", textUnderlineOffset: 4, textDecorationThickness: 2,
                  }}
                >
                  {isEmail ? "Send an email" : `Open ${chapter.label} →`}
                </a>
              </div>
            </div>
          )}

          {/* Stacked (portrait) layout — details card sits below the video */}
          {phase === "reveal" && stacked && (
            <div
              key={step}
              style={{
                position: "absolute",
                left: "50%",
                top: vidTop + vidH + 20,
                transform: "translateX(-50%)",
                width: "min(90%, 380px)",
                boxSizing: "border-box",
                zIndex: 2,
                display: "flex",
                alignItems: "center",
                gap: 16,
                padding: "16px 18px",
                borderRadius: 16,
                background: "rgba(245,241,232,0.96)",
                boxShadow: "0 10px 30px rgba(0,0,0,0.35)",
                animation: "fadeOnly .5s ease both",
              }}
            >
              <img
                src={chapter.logo}
                alt={`${chapter.label} logo`}
                style={{ width: 56, height: 56, objectFit: "contain", flexShrink: 0 }}
              />
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ color: "#1f1710", fontWeight: 600, fontSize: "1.1rem", fontFamily: "Georgia, serif" }}>
                  {chapter.label}
                </div>
                <div style={{ color: "#4a3f2e", fontSize: "0.8rem", fontFamily: "Georgia, serif", margin: "2px 0 8px", overflowWrap: "anywhere" }}>
                  {isEmail && emailState === "sent" ? "Sent ✓ — check your mail app" : chapter.value}
                </div>
                <a
                  href={chapter.href}
                  target={isEmail ? undefined : "_blank"}
                  rel="noreferrer"
                  onClick={isEmail ? handleEmailAction : undefined}
                  className="cta-link"
                  style={{
                    display: "inline-block", padding: "4px 0",
                    fontSize: "0.88rem", fontWeight: 700, color: chapter.accent,
                    textDecoration: "underline", textUnderlineOffset: 4, textDecorationThickness: 2,
                  }}
                >
                  {isEmail ? "Send an email" : `Open ${chapter.label} →`}
                </a>
              </div>
            </div>
          )}

          <div style={{
            position: "absolute", left: 0, right: 0, bottom: "4%", zIndex: 2,
            display: "flex", justifyContent: "center",
          }}>
            <div style={{ display: "flex", gap: 10, background: "rgba(20,14,6,0.45)", borderRadius: 999, padding: "0.5rem 0.8rem" }}>
              {CHAPTERS.map((c, i) => (
                <button
                  key={c.label}
                  type="button"
                  onClick={() => goTo(i)}
                  aria-label={`Go to ${c.label}`}
                  style={{
                    // bigger tap target than the visible dot, for touch screens
                    width: 12, height: 12, borderRadius: "50%", border: "none", cursor: "pointer", padding: 0,
                    background: i === step ? c.accent : "rgba(255,255,255,0.55)",
                    transition: "background .3s ease",
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      <div style={{ textAlign: "center", padding: "1.75rem", borderTop: `1px solid ${T.border}` }}>
        
      </div>
    </div>
  );
}