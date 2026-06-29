import { useState, useEffect, useRef } from "react";
import Reveal from "./Reveal";

// ── THEME ───────────────────────────────────────────────────────
const T = {
  bg:     "#080b10",
  card:   "#0d1420",
  border: "#1e2d3d",
  border2:"#243447",
  txt:    "#e8f4f8",
  txt2:   "#7a9bb5",
  txt3:   "#3d566e",
  teal:   "#00d4b8",
  violet: "#6c63ff",
};

// ── DATA UPDATED WITH CORRECT LINKS ─────────────────────────────
const LINKS = [
  { 
    label: "GitHub", 
    href: "https://github.com/kritika8006", 
    icon: "⌨️", 
    desc: "See my code & repositories", 
    color: T.teal 
  },
  { 
    label: "LinkedIn", 
    href: "https://www.linkedin.com/in/kritika-joshi-nitj", 
    icon: "💼", 
    desc: "Let's connect professionally", 
    color: T.violet 
  },
  { 
    label: "Email", 
    href: "mailto:kritikaj.ds.24@nitj.ac.in", 
    icon: "✉️", 
    desc: "kritikaj.ds.24@nitj.ac.in", 
    color: "#0ea5e9" 
  },
];

// ── CODE PARTICLE HERO ───────────────────────────────────────────
function CodeParticles() {
  const ref = useRef(null);
  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas.getContext("2d");
    let W = canvas.parentElement.clientWidth;
    let H = canvas.parentElement.clientHeight;
    
    canvas.width  = W * Math.min(devicePixelRatio, 2);
    canvas.height = H * Math.min(devicePixelRatio, 2);
    canvas.style.width  = W + "px";
    canvas.style.height = H + "px";
    ctx.scale(Math.min(devicePixelRatio, 2), Math.min(devicePixelRatio, 2));

    const WORDS = [
      "git commit","npm run dev","const x =","=> {}","useState","useEffect",
      "fetch(url)","async/await","PORT=3000","JWT_SECRET","MongoDB","LangChain",
      "import {","export default","return (","<Component />","404","200 OK",
      "ssh kritika@","sudo !!","vim .env","ctrl+c","undefined","null","true",
      "ollama run","faiss.search","rag.query","node index.js","python app.py",
      "0x1f","0b1010","{ }","[ ]","../","./src","README.md","package.json",
    ];

    const TEAL   = "0,212,184";
    const VIOLET = "108,99,255";
    const BLUE   = "14,165,233";

    const COUNT = 90;
    const particles = Array.from({ length: COUNT }, () => reset({}));

    function reset(p) {
      p.word  = WORDS[Math.floor(Math.random() * WORDS.length)];
      p.x     = (Math.random() - 0.5) * W * 2.2;
      p.y     = (Math.random() - 0.5) * H * 2.2;
      p.z     = Math.random() * 900 + 100;
      p.speed = 0.4 + Math.random() * 0.5;
      p.col   = Math.random() < 0.6 ? TEAL : Math.random() < 0.5 ? VIOLET : BLUE;
      p.alpha = 0;
      return p;
    }

    let mx = 0, my = 0;
    const onMM = e => { mx = (e.clientX / W - 0.5); my = (e.clientY / H - 0.5); };
    window.addEventListener("mousemove", onMM);

    let animId;
    const FL = 500;

    const loop = () => {
      animId = requestAnimationFrame(loop);
      ctx.fillStyle = `rgba(8,11,16,0.18)`;
      ctx.fillRect(0, 0, W, H);
      const cx = W / 2 + mx * 40;
      const cy = H / 2 + my * 30;

      particles.forEach(p => {
        p.z -= p.speed * 1.8;
        const scale = FL / p.z;
        const sx = cx + p.x * scale;
        const sy = cy + p.y * scale;

        if (p.z < 80) p.alpha = Math.max(0, p.alpha - 0.06);
        else if (p.z < 300) p.alpha = Math.min(1, p.alpha + 0.04);
        else p.alpha = Math.min(0.75, p.alpha + 0.02);

        if (p.z <= 0 || sx < -200 || sx > W + 200 || sy < -200 || sy > H + 200) {
          reset(p); p.z = 900 + Math.random() * 100; p.alpha = 0; return;
        }

        const fontSize = Math.max(8, scale * 11);
        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.font = `${fontSize}px 'JetBrains Mono','Fira Code',monospace`;
        ctx.shadowColor = `rgb(${p.col})`;
        ctx.shadowBlur  = scale > 0.6 ? 8 : 4;
        ctx.fillStyle = `rgba(${p.col},${0.55 + scale * 0.35})`;
        ctx.fillText(p.word, sx, sy);
        ctx.restore();
      });
    };
    loop();

    return () => { cancelAnimationFrame(animId); window.removeEventListener("mousemove", onMM); };
  }, []);

  return <canvas ref={ref} style={{ position:"absolute", inset:0, width:"100%", height:"100%", background:T.bg, display:"block" }} />;
}

// ── MAIN CONTACT COMPONENT ──────────────────────────────────────
export default function Contact() {
  return (
    <div style={{ fontFamily: "'Inter',system-ui,sans-serif", background: T.bg, minHeight: "100vh", color: T.txt }}>
      <style>{`
        @keyframes fadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes pulse  { 0%,100%{opacity:0.4} 50%{opacity:1} }
      `}</style>

      {/* HERO SECTION */}
      <div style={{ position: "relative", height: "100vh", minHeight: 560, overflow: "hidden" }}>
        <CodeParticles />
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none", background: `radial-gradient(ellipse at center, transparent 30%, ${T.bg}bb 100%)` }} />
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none", background: `linear-gradient(to bottom,${T.bg}22 0%,transparent 25%,transparent 65%,${T.bg}ee 90%,${T.bg} 100%)` }} />

        <div style={{ position: "absolute", bottom: 60, left: 0, right: 0, textAlign: "center", animation: "fadeUp 0.8s ease both", pointerEvents: "none" }}>
          <span style={{ fontSize: "0.68rem", fontWeight: 600, letterSpacing: "0.2em", textTransform: "uppercase", color: T.teal, display: "block", marginBottom: "0.5rem" }}>Portfolio · Contact</span>
          <h1 style={{ color: "#f0f9ff", fontSize: "clamp(2.2rem,5vw,3.8rem)", fontWeight: 800, letterSpacing: "-0.04em", margin: "0 0 0.5rem" }}>Let's Talk</h1>
          <p style={{ color: `${T.txt2}88`, fontSize: "0.95rem", margin: 0 }}>Every connection starts with a message</p>
        </div>
      </div>

      {/* LINKS SECTION */}
      <div style={{ background: T.bg, padding: "5rem 2.5rem", borderTop: `1px solid ${T.border}` }}>
        <div style={{ maxWidth: "52rem", margin: "0 auto" }}>
          <Reveal delay={0}>
            <span style={{ fontSize: "0.68rem", fontWeight: 600, letterSpacing: "0.2em", textTransform: "uppercase", color: T.teal, display: "block", marginBottom: "0.5rem" }}>Get in touch</span>
            <h2 style={{ fontSize: "clamp(1.8rem,3.5vw,2.6rem)", fontWeight: 800, color: "#f0f9ff", letterSpacing: "-0.03em", margin: "0 0 0.6rem", lineHeight: 1.2 }}>
              I'm always open to<br />something new
            </h2>
            <p style={{ color: T.txt2, marginBottom: "3rem", fontSize: "0.92rem", maxWidth: "34rem", lineHeight: 1.75 }}>
              Whether it's a project, collaboration, internship, or just a conversation about tech — feel free to reach out.
            </p>
          </Reveal>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem", marginBottom: "2.5rem" }}>
            {LINKS.map((l, i) => (
              <Reveal key={l.label} delay={0.1 + i * 0.1}>
                <a href={l.href} target="_blank" rel="noreferrer"
                  style={{ display: "flex", alignItems: "center", gap: "1.25rem", background: T.card, borderRadius: "12px", padding: "1.25rem 1.5rem", border: `1px solid ${T.border}`, borderLeft: `3px solid ${l.color}`, textDecoration: "none", transition: "all .28s ease" }}
                  onMouseEnter={e => { e.currentTarget.style.transform = "translateX(6px)"; e.currentTarget.style.borderColor = l.color; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.borderColor = T.border; }}>
                  <div style={{ width: 48, height: 48, borderRadius: "10px", background: `${l.color}15`, border: `1px solid ${l.color}33`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.4rem", flexShrink: 0 }}>{l.icon}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, color: "#f0f9ff", fontSize: "1rem" }}>{l.label}</div>
                    <div style={{ color: T.txt2, fontSize: "0.83rem", marginTop: 2 }}>{l.desc}</div>
                  </div>
                  <div style={{ color: l.color, fontSize: "1.2rem", fontWeight: 700 }}>→</div>
                </a>
              </Reveal>
            ))}
          </div>

          <div style={{ textAlign: "center", padding: "1.75rem", background: T.card, borderRadius: "12px", border: `1px solid ${T.border}` }}>
            <p style={{ color: T.txt3, fontSize: "0.8rem", margin: 0 }}>{"// made with ♥ by Kritika Joshi · 2026"}</p>
          </div>
        </div>
      </div>
    </div>
  );
}