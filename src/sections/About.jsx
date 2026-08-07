import { useEffect, useRef } from "react";
import * as THREE from "three";
import Reveal from "./Reveal";

// ─── Design tokens ───────────────────────────────────────────────
const T = {
  bg:      "#080b10",
  card:    "#0d1420",
  border:  "#1e2d3d",
  border2: "#243447",
  txt:     "#e8f4f8",
  txt2:    "#7a9bb5",
  txt3:    "#3d566e",
  teal:    "#00d4b8",
  tealDim: "#00d4b822",
  tealMid: "#00d4b855",
  violet:  "#6c63ff",
};

// ─── Data ────────────────────────────────────────────────────────
const JOURNEY = [
  {
    icon: "🔨", title: "The Builder", color: T.teal,
    text: "Started with C/C++ and HTML — got hooked on how code becomes something real. Never stopped building since.",
  },
  {
    icon: "🚀", title: "The Full-Stack Dev", color: T.violet,
    text: "Shipped production MERN apps — from a clothing exchange platform to an institutional CSC website used by real students.",
  },
  {
    icon: "🛡️", title: "The Club Head", color: "#0ea5e9",
    text: "Leading NIT Jalandhar's Cyber Security Club — running CTFs, workshops, and managing the official web platform.",
  },
  {
    icon: "🤖", title: "The AI Builder", color: "#10b981",
    text: "Diving deep into LangChain, RAG, and local LLMs — built a privacy-first AI code assistant using Ollama and FAISS.",
  },
];

const STACK = [
  "React.js", "Node.js", "Express", "MongoDB", "Python",
  "LangChain", "FastAPI", "C/C++", "SQL", "TailwindCSS", "Git", "JWT",
];

const STATS = [
  { num: "8.63",  label: "CGPA at NIT Jalandhar",   color: T.teal   },
  { num: "5+",   label: "Projects shipped",          color: T.violet },
  { num: "200+", label: "Students reached via CSC",  color: "#0ea5e9" },
  { num: "∞",    label: "Things still to learn",     color: "#10b981" },
];

// ═══════════════════════════════════════════════════════════════
//  FULL-SCREEN 3-D DESK HERO
// ═══════════════════════════════════════════════════════════════
function DeskHero() {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    let W = el.clientWidth, H = el.clientHeight;
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(W, H);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.08;
    el.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#080b10");
    scene.fog = new THREE.FogExp2("#080b10", 0.045);

    const camera = new THREE.PerspectiveCamera(42, W / H, 0.1, 60);
    camera.position.set(5, 4, 6);
    camera.lookAt(0, 1.5, 0);

    scene.add(new THREE.AmbientLight("#ffe8c0", 0.9));
    const sun = new THREE.DirectionalLight("#fff8e8", 3.2);
    sun.position.set(6, 10, 7); sun.castShadow = true;
    sun.shadow.mapSize.set(1024, 1024); sun.shadow.bias = -0.002; scene.add(sun);
    const lamp = new THREE.PointLight("#00d4b8", 7, 7);
    lamp.position.set(-1.4, 4.1, -0.9); lamp.castShadow = true; scene.add(lamp);
    const screenLight = new THREE.PointLight("#9de4f8", 3.5, 5);
    screenLight.position.set(0, 3.2, -0.8); scene.add(screenLight);
    const led = new THREE.PointLight("#6c63ff", 2.5, 5);
    led.position.set(0, 2.1, -1.5); scene.add(led);

    const mat = c => new THREE.MeshStandardMaterial({ color: c, roughness: 0.72, metalness: 0.06 });
    const bx = (w, h, d, c, x, y, z, rx = 0, ry = 0, rz = 0) => {
      const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat(c));
      m.position.set(x, y, z); m.rotation.set(rx, ry, rz);
      m.castShadow = true; m.receiveShadow = true; scene.add(m); return m;
    };
    const cy = (rt, rb, h, c, x, y, z, seg = 18) => {
      const m = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg), mat(c));
      m.position.set(x, y, z); m.castShadow = true; m.receiveShadow = true; scene.add(m); return m;
    };

    // Floor & wall
    bx(20, 0.12, 20, "#0a0e14", 0, -0.06, 0);
    bx(20, 14, 0.2, "#080b10", 0, 7, -5.5);
    // Desk
    bx(6, 0.18, 2.8, "#1a2535", 0, 1.82, 0);
    [[-2.6, -1.1], [-2.6, 1.1], [2.6, -1.1], [2.6, 1.1]].forEach(([x, z]) =>
      bx(0.14, 1.82, 0.14, "#0f1a28", x, 0.91, z));
    // Bookshelf
    bx(1.3, 1.6, 2.5, "#0f1a28", 2.5, 1.0, 0);
    // Monitor
    bx(3.0, 1.85, 0.1, "#0a0e14", 0, 3.72, -1.25);
    bx(2.78, 1.65, 0.06, "#9de4f8", 0, 3.72, -1.21);
    bx(0.12, 0.65, 0.12, "#1e2d3d", 0, 2.64, -1.25);
    bx(0.85, 0.07, 0.5, "#1e2d3d", 0, 2.35, -1.25);
    // Code lines on screen
    ["#00d4b8", "#6c63ff", "#4ade80", "#f59e0b", "#94a3b8"].forEach((c, i) =>
      bx(0.4 + i * 0.18, 0.05, 0.02, c, -0.75 + i * 0.48, 3.82 - i * 0.22, -1.19));
    // Side monitor
    bx(1.8, 1.1, 0.08, "#0a0e14", -1.75, 3.15, -1.22, 0, 0.18, 0);
    bx(1.62, 0.96, 0.05, "#9de4f8", -1.75, 3.15, -1.19, 0, 0.18, 0);
    // Keyboard
    bx(2.0, 0.07, 0.72, "#0d1420", 0, 2.22, -0.65);
    for (let i = -4; i <= 4; i++) for (let j = -1; j <= 1; j++)
      bx(0.18, 0.05, 0.18, "#1e2d3d", i * 0.22, 2.255, -0.65 + j * 0.18);
    // Mouse
    bx(0.36, 0.1, 0.55, "#0d1420", 1.85, 2.24, -0.45);
    // LED strip
    bx(6, 0.05, 0.06, T.teal, 0, 2.23, -1.6);
    // Lamp
    cy(0.06, 0.06, 1.4, "#7a9bb5", -1.95, 2.93, -1.35);
    bx(0.06, 0.52, 0.06, "#7a9bb5", -1.95, 3.77, -1.35, 0.44, 0, 0);
    cy(0.2, 0.28, 0.42, "#00d4b8", -1.72, 4.04, -1.14, 8);
    cy(0.2, 0.2, 0.06, "#7a9bb5", -1.95, 2.26, -1.35);
    // Plant pot
    cy(0.19, 0.15, 0.38, "#1e3a2f", -2.6, 2.2, -1.35);
    cy(0.15, 0.13, 0.32, "#2d1f4a", -2.6, 2.37, -1.35);
    bx(0.08, 0.2, 0.08, "#1e3a2f", -2.38, 2.12, -1.35);
    // Small plant
    cy(0.14, 0.12, 0.28, "#1a2820", -3.1, 2.2, -1.45);
    cy(0.04, 0.04, 0.38, "#10b981", -3.1, 2.53, -1.45);
    bx(0.3, 0.06, 0.3, "#10b981", -3.1, 2.77, -1.45);
    bx(0.2, 0.06, 0.2, "#10b981", -2.92, 2.67, -1.35, 0, 0, 0.3);
    bx(0.2, 0.06, 0.2, "#10b981", -3.28, 2.65, -1.35, 0, 0, -0.3);
    // Chair
    [[-0.7, 1.5], [-0.7, 3.3], [1.7, 1.5], [1.7, 3.3]].forEach(([x, z]) =>
      bx(0.12, 1.55, 0.12, "#0f1a28", x, 0.77, z));
    bx(1.75, 0.15, 1.75, "#0d1420", 0.5, 1.61, 2.4);
    bx(1.62, 0.13, 1.62, T.teal, 0.5, 1.74, 2.4);
    bx(1.75, 1.5, 0.14, "#0d1420", 0.5, 2.5, 1.5);
    bx(1.62, 1.38, 0.08, T.teal, 0.5, 2.46, 1.49);
    // Books
    [["#00d4b8", 0], ["#6c63ff", 0.14], ["#10b981", 0.28]].forEach(([c, dy]) =>
      bx(0.65, 0.13, 2.0, c, 1.6 + dy * 0.5, 2.5 + dy, 0));
    // Sticky notes
    bx(0.3, 0.28, 0.04, "#fbbf24", -0.8, 2.22, -1.42);
    bx(0.28, 0.26, 0.04, "#6c63ff", -0.48, 2.22, -1.42);
    // Rug
    bx(6, 0.03, 4.5, "#0d1420", 0, 0.01, 1.5);

    let t = 0, mouseX = 0, mouseY = 0;
    const onMM = e => {
      mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
      mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener("mousemove", onMM);

    const raf = { id: null };
    const loop = () => {
      raf.id = requestAnimationFrame(loop);
      t += 0.005;
      const r = 7.5, base = t;
      const tx = Math.sin(base) * r + mouseX * 0.4;
      const ty = 4.2 + mouseY * 0.3;
      const tz = Math.cos(base) * r;
      camera.position.x += (tx - camera.position.x) * 0.025;
      camera.position.y += (ty - camera.position.y) * 0.025;
      camera.position.z += (tz - camera.position.z) * 0.025;
      camera.lookAt(0, 1.6, 0);
      lamp.intensity = 6 + Math.sin(t * 3) * 0.5;
      renderer.render(scene, camera);
    };
    loop();

    const onResize = () => {
      W = el.clientWidth; H = el.clientHeight;
      camera.aspect = W / H; camera.updateProjectionMatrix();
      renderer.setSize(W, H);
    };
    window.addEventListener("resize", onResize);
    return () => {
      cancelAnimationFrame(raf.id);
      window.removeEventListener("mousemove", onMM);
      window.removeEventListener("resize", onResize);
      renderer.dispose();
      if (el.contains(renderer.domElement)) el.removeChild(renderer.domElement);
    };
  }, []);
  return <div ref={ref} style={{ width: "100%", height: "100%" }} />;
}

// ═══════════════════════════════════════════════════════════════
//  ABOUT PAGE
// ═══════════════════════════════════════════════════════════════
export default function About() {
  return (
    <div style={{ fontFamily: "'Inter',system-ui,sans-serif", background: T.bg, minHeight: "100vh", color: T.txt }}>
      <style>{`
        @keyframes fadeUp  { from{opacity:0;transform:translateY(22px)} to{opacity:1;transform:translateY(0)} }
        @keyframes pulse   { 0%,100%{opacity:0.4} 50%{opacity:1} }
        @keyframes blink   { 0%,100%{opacity:1} 50%{opacity:0} }
      `}</style>

      {/* ── HERO ──────────────────────────────── */}
      <div style={{ position: "relative", height: "100vh", minHeight: 560, overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0 }}><DeskHero /></div>
        <div style={{
          position: "absolute", inset: 0,
          background: `linear-gradient(to bottom, rgba(8,11,16,0.1) 0%, rgba(8,11,16,0) 40%, rgba(8,11,16,0.8) 85%, rgba(8,11,16,1) 100%)`,
          pointerEvents: "none",
        }} />
        <div style={{
          position: "absolute", bottom: 60, left: 0, right: 0,
          textAlign: "center", animation: "fadeUp 0.8s ease both", pointerEvents: "none",
        }}>
          <span style={{
            fontSize: "0.68rem", fontWeight: 600, letterSpacing: "0.2em",
            textTransform: "uppercase", color: T.teal, display: "block", marginBottom: "0.5rem",
          }}>Portfolio · About</span>
          <h1 style={{
            color: "rgba(232,244,248,0.95)",
            fontSize: "clamp(2.2rem,5vw,3.8rem)", fontWeight: 800,
            letterSpacing: "-0.04em", margin: "0 0 0.5rem",
          }}>
            Hi, I'm Kritika
          </h1>
          <p style={{ color: `${T.txt2}88`, fontSize: "1rem", margin: 0, letterSpacing: "0.04em" }}>
            Full-Stack Developer · Cyber Security Club Head · AI Builder
          </p>
        </div>
        {/* Scroll hint */}
        <div style={{
          position: "absolute", bottom: 22, left: "50%", transform: "translateX(-50%)",
          display: "flex", flexDirection: "column", alignItems: "center", gap: 5,
          animation: "pulse 2s ease infinite",
        }}>
          <div style={{ width: 1, height: 28, background: `${T.teal}55` }} />
          <span style={{ color: `${T.teal}55`, fontSize: "0.65rem", letterSpacing: "0.18em", textTransform: "uppercase" }}>scroll</span>
        </div>
      </div>

      {/* ── WHO I AM ──────────────────────────── */}
      <div style={{ background: T.bg, padding: "5rem 2.5rem", borderTop: `1px solid ${T.border}` }}>
        <div style={{ maxWidth: "68rem", margin: "0 auto" }}>
          <Reveal delay={0}>
            <div style={{ display: "grid", gap: "2.5rem", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", alignItems: "start" }}>
              {/* Bio text */}
              <div>
                <span style={{
                  fontSize: "0.68rem", fontWeight: 600, letterSpacing: "0.2em",
                  textTransform: "uppercase", color: T.teal, display: "block", marginBottom: "0.75rem",
                }}>Who I Am</span>
                <h2 style={{
                  fontSize: "clamp(1.8rem,3.5vw,2.6rem)", fontWeight: 800,
                  color: "#f0f9ff", letterSpacing: "-0.03em", margin: "0 0 1.25rem", lineHeight: 1.15,
                }}>
                  Developer, Leader<br />& AI Enthusiast
                </h2>
                <p style={{ color: T.txt2, lineHeight: 1.85, fontSize: "0.95rem", marginBottom: "1rem" }}>
                  I'm Kritika — a B.Tech DSE student at NIT Jalandhar with a CGPA of 8.7. I build full-stack web apps,
                  lead the Cyber Security Club, and explore AI systems that solve real problems.
                </p>
                <p style={{ color: T.txt2, lineHeight: 1.85, fontSize: "0.95rem", marginBottom: "1.75rem" }}>
                  From MERN-stack platforms to LangChain-powered RAG tools — I enjoy turning ideas into working
                  products and growing the tech community around me.
                </p>
                {/* Stack pills */}
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.45rem" }}>
                  {STACK.map(s => (
                    <span key={s} style={{
                      background: T.card, color: T.txt2,
                      border: `1px solid ${T.border2}`, borderRadius: 999,
                      padding: "4px 13px", fontSize: "0.78rem", fontWeight: 500,
                      fontFamily: "'JetBrains Mono',monospace",
                    }}>{s}</span>
                  ))}
                </div>
              </div>

              {/* Stat cards */}
              <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
                {STATS.map(s => (
                  <div key={s.label} style={{
                    background: T.card, borderRadius: "12px",
                    padding: "1.1rem 1.4rem",
                    border: `1px solid ${T.border}`,
                    borderLeft: `3px solid ${s.color}`,
                    display: "flex", alignItems: "center", gap: "1.25rem",
                    transition: "border-color .25s, transform .25s",
                  }}
                    onMouseEnter={e => { e.currentTarget.style.transform = "translateX(4px)"; e.currentTarget.style.borderColor = s.color; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.borderColor = T.border; }}
                  >
                    <span style={{
                      fontSize: "2rem", fontWeight: 800, color: s.color,
                      letterSpacing: "-0.04em", minWidth: 52, lineHeight: 1,
                    }}>{s.num}</span>
                    <span style={{ color: T.txt2, fontSize: "0.88rem", fontWeight: 500 }}>{s.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </div>

      {/* ── JOURNEY ──────────────────────────── */}
      <div style={{ background: "#060810", padding: "5rem 2.5rem", borderTop: `1px solid ${T.border}` }}>
        <div style={{ maxWidth: "68rem", margin: "0 auto" }}>
          <Reveal delay={0}>
            <span style={{
              fontSize: "0.68rem", fontWeight: 600, letterSpacing: "0.2em",
              textTransform: "uppercase", color: T.teal, display: "block", marginBottom: "0.5rem",
            }}>My Journey</span>
            <h2 style={{
              fontSize: "clamp(1.8rem,3.5vw,2.6rem)", fontWeight: 800,
              color: "#f0f9ff", letterSpacing: "-0.03em", margin: "0 0 3rem",
            }}>How I got here</h2>
          </Reveal>
          <div style={{ display: "grid", gap: "1.1rem", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))" }}>
            {JOURNEY.map((item, i) => (
              <Reveal key={item.title} delay={0.08 + i * 0.1}>
                <div
                  style={{
                    background: T.card, border: `1px solid ${T.border}`,
                    borderTop: `2px solid ${item.color}`,
                    borderRadius: "12px", padding: "1.6rem",
                    transition: "transform .28s, box-shadow .28s, border-color .28s",
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.transform = "translateY(-6px)";
                    e.currentTarget.style.boxShadow = `0 16px 40px ${item.color}18`;
                    e.currentTarget.style.borderColor = item.color;
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.transform = "";
                    e.currentTarget.style.boxShadow = "";
                    e.currentTarget.style.borderColor = T.border;
                  }}
                >
                  <div style={{ fontSize: "1.8rem", marginBottom: "0.9rem" }}>{item.icon}</div>
                  <h3 style={{ fontSize: "1rem", fontWeight: 700, color: item.color, marginBottom: "0.55rem" }}>{item.title}</h3>
                  <p style={{ color: T.txt2, lineHeight: 1.75, fontSize: "0.88rem", margin: 0 }}>{item.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>

      {/* ── TERMINAL BIO ─────────────────────── */}
      <div style={{ background: T.bg, padding: "5rem 2.5rem", borderTop: `1px solid ${T.border}` }}>
        <div style={{ maxWidth: "56rem", margin: "0 auto" }}>
          <Reveal delay={0}>
            <span style={{
              fontSize: "0.68rem", fontWeight: 600, letterSpacing: "0.2em",
              textTransform: "uppercase", color: T.teal, display: "block", marginBottom: "0.5rem",
            }}>Currently</span>
            <h2 style={{
              fontSize: "clamp(1.6rem,3vw,2.2rem)", fontWeight: 800,
              color: "#f0f9ff", letterSpacing: "-0.03em", margin: "0 0 2rem",
            }}>What I'm up to</h2>
            {/* Terminal */}
            <div style={{ borderRadius: "12px", overflow: "hidden", border: `1px solid ${T.border2}` }}>
              <div style={{
                background: T.card, padding: "10px 16px",
                display: "flex", alignItems: "center", gap: 6,
                borderBottom: `1px solid ${T.border}`,
              }}>
                {["#ff5f57", "#febc2e", "#28c840"].map(c => (
                  <span key={c} style={{ width: 10, height: 10, borderRadius: "50%", background: c, display: "inline-block" }} />
                ))}
                <span style={{ marginLeft: 8, color: T.txt3, fontSize: "11px", fontFamily: "monospace" }}>
                  kritika@nitj ~
                </span>
              </div>
              <div style={{
                background: "#060a10", padding: "1.75rem 2rem",
                fontFamily: "'JetBrains Mono','Fira Code',monospace",
                fontSize: "0.88rem", lineHeight: 2.1,
                display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: "0 3rem",
              }}>
                <div>
                  <p style={{ color: T.teal, margin: 0 }}>&gt; current_role</p>
                  <p style={{ color: "#4ade80", margin: "0.2rem 0 1rem" }}>Cyber Security Club Head — NITJ</p>
                  <p style={{ color: T.teal, margin: 0 }}>&gt; building_now</p>
                  <p style={{ color: "#4ade80", margin: "0.2rem 0 1rem" }}>
                    TPO Portal · AI Code Assistant
                    <span style={{ animation: "blink 1s step-end infinite" }}>_</span>
                  </p>
                </div>
                <div>
                  <p style={{ color: T.teal, margin: 0 }}>&gt; learning</p>
                  <p style={{ color: "#4ade80", margin: "0.2rem 0 1rem" }}>LangChain · RAG · Ollama · FAISS</p>
                  <p style={{ color: T.teal, margin: 0 }}>&gt; goal</p>
                  <p style={{ color: T.txt, margin: "0.2rem 0 1rem" }}>AI tools that actually help people.</p>
                  <p style={{ color: T.txt3, margin: 0 }}>// always building</p>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </div>
  );
}
