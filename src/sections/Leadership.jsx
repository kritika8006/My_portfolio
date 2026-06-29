import { useEffect, useRef } from "react";
import Reveal from "./Reveal";

const T = {
  bg: "#080b10", card: "#0d1420", border: "#1e2d3d", border2: "#243447",
  txt: "#e8f4f8", txt2: "#7a9bb5", txt3: "#3d566e",
  teal: "#00d4b8", violet: "#6c63ff", blue: "#0ea5e9", green: "#10b981",
};

const ROLES = [
  {
    color: T.teal, year: "2026 – Present",
    role: "Head, Cyber Security Club", org: "NIT Jalandhar",
    tags: ["Club Leadership", "CTF Events", "Workshops", "Web Infrastructure", "Team Management"],
    pts: [
      "Leading the Cyber Security Club — organising technical workshops, CTF competitions, and awareness drives on campus.",
      "Managing the official NIT Jalandhar CSC web platform as Full-Stack Developer and Infrastructure Lead.",
      "Leading a student development team for institutional web infrastructure using React, Node, and MongoDB.",
      "Coordinating with faculty, external speakers, and peer clubs to grow the campus tech community.",
    ],
  },
  {
    color: T.violet, year: "2025 – Present",
    role: "Event Management and Outreach", org: "NIT Jalandhar",
    tags: ["Half-Marathon", "Health Campaigns", "Logistics", "Cross-team Coordination", "Campus Events"],
    pts: [
      "Organised the NITJ Half-Marathon 2.0 — handling registrations, logistics, and on-ground coordination end-to-end.",
      "Led 5+ health-focused campus events, managing multi-team coordination and real-world execution.",
      "Developed strong event planning, communication, and team collaboration skills through high-stakes campus initiatives.",
      "Maintained robust Git-based collaboration workflows across institutional repositories and cross-functional teams.",
    ],
  },
  {
    color: T.blue, year: "Ongoing",
    role: "TPO Portal Collaborator", org: "NIT Jalandhar Training and Placement Office",
    tags: ["MERN Stack", "Institutional Platform", "Placement Infrastructure", "Team Dev"],
    pts: [
      "Collaborating on the official MERN-based Training and Placement Office portal for NIT Jalandhar.",
      "Contributing to the architecture and development of placement management features used by the entire campus.",
      "Working alongside faculty and fellow developers to ensure reliability and security of institutional infrastructure.",
    ],
  },
];

const IMPACT = [
  { num: "1", lbl: "Club headed", color: T.teal },
  { num: "5+", lbl: "CTF and campus events", color: T.violet },
  { num: "200+", lbl: "Students reached", color: T.blue },
  { num: "3", lbl: "Institutional platforms", color: T.green },
];

// ── NEURAL NETWORK VORTEX HERO ──────────────────────────────────
function VortexHero() {
  const ref = useRef(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas.getContext("2d");
    let W, H;

    const resize = () => {
      W = window.innerWidth;
      H = document.documentElement.scrollHeight;
      const dpr = Math.min(devicePixelRatio, 2);
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      canvas.style.width = W + "px";
      canvas.style.height = H + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const N = 420;
    const pts = Array.from({ length: N }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      size: Math.random() * 1.9 + 0.4,
      col: Math.random() < 0.55 ? T.teal : T.violet,
    }));

    let animId;
    const loop = () => {
      animId = requestAnimationFrame(loop);
      ctx.clearRect(0, 0, W, H);

      pts.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > W) p.vx *= -1;
        if (p.y < 0 || p.y > H) p.vy *= -1;
      });

      for (let i = 0; i < N; i++) {
        for (let j = i + 1; j < N; j++) {
          const dx = pts[i].x - pts[j].x, dy = pts[i].y - pts[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 95) {
            ctx.beginPath();
            ctx.moveTo(pts[i].x, pts[i].y);
            ctx.lineTo(pts[j].x, pts[j].y);
            ctx.strokeStyle = `rgba(0,212,184,${(0.13 * (1 - dist / 95)).toFixed(3)})`;
            ctx.lineWidth = 0.7;
            ctx.stroke();
          }
        }
      }
      pts.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.col;
        ctx.fill();
      });
    };
    loop();
    return () => { cancelAnimationFrame(animId); window.removeEventListener("resize", resize); };
  }, []);

  return (
    <canvas
      ref={ref}
      style={{
        position: "fixed",
        inset: 0,
        width: "100vw",
        height: "100vh",
        display: "block",
        pointerEvents: "none",
        zIndex: 0,
      }}
    />
  );
}

// ── TIMELINE ITEM ───────────────────────────────────────────────
function TimelineItem({ role, isLast }) {
  const { color, year, role: title, org, tags, pts } = role;
  return (
    <div style={{ position: "relative", paddingLeft: "2rem", paddingBottom: isLast ? 0 : "2.5rem" }}>
      {!isLast && <div style={{ position: "absolute", left: 0, top: 14, bottom: 0, width: 1, background: `linear-gradient(to bottom, ${color}88, ${color}11)` }} />}
      <div style={{ position: "absolute", left: 0, top: 4, width: 11, height: 11, borderRadius: "50%", border: `2px solid ${color}`, background: T.bg, transform: "translateX(-5px)", boxShadow: `0 0 8px ${color}77` }} />
      <div style={{ fontSize: "0.72rem", fontFamily: "monospace", color: T.txt3, fontWeight: 600, marginBottom: "0.35rem" }}>{year}</div>
      <div style={{ fontSize: "1.05rem", fontWeight: 700, color: "#f0f9ff", marginBottom: "0.2rem" }}>{title}</div>
      <div style={{ fontSize: "0.8rem", color: T.txt2, fontWeight: 500, marginBottom: "0.85rem" }}>{org}</div>
      <ul style={{ listStyle: "none", padding: 0 }}>
        {pts.map((p, i) => <li key={i} style={{ display: "flex", gap: "0.5rem", marginBottom: "0.5rem" }}><span style={{ color }}>▸</span><span style={{ color: T.txt2, fontSize: "0.84rem" }}>{p}</span></li>)}
      </ul>
    </div>
  );
}

// ── PAGE ─────────────────────────────────────────────────────────
// ... (VortexHero aur baki components same rahenge)

// ── PAGE ─────────────────────────────────────────────────────────
export default function Leadership() {
  return (
    <div style={{ fontFamily: "'Inter',system-ui,sans-serif", background: T.bg, minHeight: "100vh", color: T.txt, position: "relative" }}>
      <VortexHero />
      <style>{`@keyframes fadeUp { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} } @keyframes pulse { 0%,100%{opacity:0.35} 50%{opacity:1} }`}</style>

      {/* ── HERO ── */}
      <div style={{ 
        position: "relative", 
        zIndex: 1, 
        height: "100vh", 
        minHeight: 560, 
        overflow: "hidden",
        display: "flex", 
        flexDirection: "column", 
        alignItems: "center", 
        justifyContent: "center" // Yeh content ko center mein le aayega
      }}>
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none", background: `radial-gradient(ellipse 70% 60% at 50% 50%, transparent 28%, ${T.bg}99 100%)` }} />
        
        <div style={{ textAlign: "center", animation: "fadeUp 0.85s ease both" }}>
          <span style={{ fontSize: "0.68rem", fontWeight: 600, letterSpacing: "0.2em", textTransform: "uppercase", color: T.teal, marginBottom: "1rem", display: "block" }}>Portfolio · Leadership</span>
          <h1 style={{ color: "#f0f9ff", fontSize: "clamp(3rem, 7vw, 5rem)", fontWeight: 800, margin: "0" }}>Leadership</h1>
          <p style={{ color: `${T.txt2}99`, fontSize: "1rem", marginTop: "1rem" }}>Building community · shipping platforms · leading teams</p>
        </div>
      </div>

      {/* ── ROLES ── */}
      <div style={{ position: "relative", zIndex: 1, padding: "5rem 2.5rem", borderTop: `1px solid ${T.border}`, background: "transparent" }}>
        <div style={{ maxWidth: "68rem", margin: "0 auto" }}>
          {ROLES.map((r, i) => <TimelineItem key={r.role} role={r} isLast={i === ROLES.length - 1} />)}
        </div>
      </div>

      {/* ── IMPACT ── */}
      <div style={{ position: "relative", zIndex: 1, background: "transparent", padding: "5rem 2.5rem", borderTop: `1px solid ${T.border}` }}>
        <div style={{ maxWidth: "68rem", margin: "0 auto", display: "grid", gap: "0.75rem", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))" }}>
          {IMPACT.map((s, i) => (
            <div key={s.lbl} style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 12, padding: "1.75rem 1rem", textAlign: "center" }}>
              <div style={{ fontSize: "2.6rem", fontWeight: 800, color: s.color, marginBottom: "0.45rem" }}>{s.num}</div>
              <div style={{ color: T.txt2, fontSize: "0.78rem" }}>{s.lbl}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}