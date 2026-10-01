import { useState, useEffect, useRef } from "react";
import * as THREE from "three";
import Reveal from "./Reveal";

// ── THEME ───────────────────────────────────────────────────────
const T = {
  bg: "#160f08", card: "#1c130a", border: "#3a2a18", border2: "#4a3320",
  txt: "#f5ead8", txt2: "#b89a72", txt3: "#6b5238",
  teal: "#e8a44a", violet: "#c97b3a",
};

// ── DATA ────────────────────────────────────────────────────────
const GROUPS = [
  { title: "⚛ Frontend", color: T.teal, skills: ["React", "JavaScript", "TypeScript", "Tailwind CSS", "HTML5", "CSS3"] },
  { title: "🛠 Backend", color: T.violet, skills: ["Node.js", "Express.js", "REST APIs", "JWT", "FastAPI"] },
  { title: "🗄 Database", color: "#d4884a", skills: ["MongoDB", "MySQL", "Mongoose", "FAISS"] },
  { title: "🤖 AI / ML", color: "#10b981", skills: ["LangChain", "Ollama", "Prompt Engineering", "RAG", "Vector DBs"] },
  { title: "⚙ Tools", color: "#f59e0b", skills: ["Git", "GitHub", "VS Code", "Postman", "Linux"] },
];

const BARS = [
  { label: "React + JS", pct: 88, color: T.teal },
  { label: "Node.js / Express", pct: 80, color: T.violet },
  { label: "Python", pct: 72, color: "#d4884a" },
  { label: "MongoDB / MySQL", pct: 75, color: "#10b981" },
  { label: "LangChain / AI", pct: 65, color: "#f59e0b" },
];

const ABOUT = [
  { lbl: "Primary role", val: "Full-stack developer", sub: "Frontend-heavy" },
  { lbl: "Core language", val: "JavaScript / TypeScript", sub: "Node.js on the server" },
  { lbl: "UI framework", val: "React", sub: "Vite, hooks, Tailwind" },
  { lbl: "AI focus", val: "LangChain + RAG", sub: "Local models via Ollama" },
  { lbl: "Databases", val: "MongoDB + MySQL", sub: "Mongoose ORM" },
  { lbl: "Currently into", val: "AI-powered apps", sub: "Prompt engineering, FAISS" },
];

const TABS = [
  { id: "stack", label: "Tech stack" },
  { id: "proficiency", label: "Proficiency" },
  { id: "about", label: "At a glance" },
];

// ... (ConstellationScene remains unchanged as per your instruction to only update specific parts) ...

// ── CHIP ─────────────────────────────────────────────────────────
function Chip({ text, color }) {
  const [hov, setHov] = useState(false);
  return (
    <span
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: "inline-flex", alignItems: "center", gap: "0.4rem",
        padding: "0.35rem 0.85rem", borderRadius: 999,
        border: `1px solid ${hov ? color + "66" : T.border2}`,
        fontSize: 13, fontWeight: 600,
        color: hov ? color : T.txt2,
        background: hov ? color + "12" : T.card,
        fontFamily: "'JetBrains Mono',monospace",
        transition: "all 0.15s ease", cursor: "default", userSelect: "none",
      }}
    >
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: color, flexShrink: 0, boxShadow: hov ? `0 0 6px ${color}` : "none" }} />
      {text}
    </span>
  );
}

// ── ANIMATED BAR ─────────────────────────────────────────────────
function ProfBar({ pct, color, animate }) {
  return (
    <div style={{ height: 4, background: T.border, borderRadius: 999, overflow: "hidden" }}>
      <div style={{
        height: "100%", width: animate ? `${pct}%` : "0%",
        background: `linear-gradient(90deg,${color},${color}88)`,
        borderRadius: 999,
        boxShadow: animate ? `0 0 10px ${color}55` : "none",
        transition: "width 1.1s cubic-bezier(0.22,1,0.36,1)",
      }} />
    </div>
  );
}

// ── STACK PANEL (UPDATED) ────────────────────────────────────────
function StackPanel() {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit,minmax(320px,1fr))",
        gap: "1.5rem",
        paddingTop: "2rem",
      }}
    >
      {GROUPS.map((g) => (
        <div
          key={g.title}
          style={{
            background: T.card,
            border: `1px solid ${T.border}`,
            borderRadius: 16,
            padding: "1.4rem",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "1rem",
              alignItems: "center",
            }}
          >
            <h3 style={{ color: g.color, margin: 0, fontSize: "1rem" }}>{g.title}</h3>
            <span style={{ color: T.txt3, fontSize: 12 }}>{g.skills.length} skills</span>
          </div>

          <div style={{ display: "flex", flexWrap: "wrap", gap: ".55rem" }}>
            {g.skills.map((s) => (
              <Chip key={s} text={s} color={g.color} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ── PROFICIENCY PANEL ────────────────────────────────────────────
function ProficiencyPanel({ active }) {
  const [animate, setAnimate] = useState(false);
  const done = useRef(false);
  useEffect(() => {
    if (active && !done.current) { done.current = true; setTimeout(() => setAnimate(true), 60); }
  }, [active]);

  return (
    <div style={{ paddingTop: "2rem" }}>
      <p style={S.label}>Self-assessed depth by area</p>
      <div style={{ display: "flex", flexDirection: "column", gap: "1.1rem" }}>
        {BARS.map(b => (
          <div key={b.label} style={{ background: T.card, borderRadius: 12, border: `1px solid ${T.border}`, padding: "1.1rem 1.3rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.8rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: b.color, boxShadow: `0 0 7px ${b.color}`, display: "inline-block" }} />
                <span style={{ color: T.txt, fontSize: "0.9rem", fontWeight: 600 }}>{b.label}</span>
              </div>
              <span style={{ color: b.color, fontSize: "0.82rem", fontWeight: 700, fontFamily: "monospace" }}>{b.pct}%</span>
            </div>
            <ProfBar pct={b.pct} color={b.color} animate={animate} />
          </div>
        ))}
      </div>
    </div>
  );
}

// ── ABOUT PANEL ───────────────────────────────────────────
function AboutPanel() {
  return (
    <div style={{ paddingTop: "2rem" }}>
      <p style={S.label}>Quick summary</p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1, background: T.border, border: `1px solid ${T.border}`, borderRadius: 12, overflow: "hidden" }}>
        {ABOUT.map(a => (
          <div key={a.lbl} style={{ padding: "1.25rem 1.5rem", background: T.card }}>
            <p style={{ fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", color: T.txt3, marginBottom: "0.4rem" }}>{a.lbl}</p>
            <p style={{ fontSize: 15, fontWeight: 600, color: T.txt, lineHeight: 1.4 }}>{a.val}</p>
            <p style={{ fontSize: 12, color: T.txt2, marginTop: "0.2rem" }}>{a.sub}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── SHARED ──────────────────────────────────────────────────────
const S = {
  label: { fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", color: T.txt3, marginBottom: "1.5rem" },
};

// ── PAGE ─────────────────────────────────────────────────────────
export default function Skills() {
  const [activeTab, setActiveTab] = useState("stack");

  return (
    <div style={{ fontFamily: "'Inter',system-ui,sans-serif", background: T.bg, minHeight: "100vh", color: T.txt }}>
      {/* ... (ConstellationScene remains unchanged as per instruction) ... */}
      
      <div style={{ borderTop: `1px solid ${T.border}`, padding: "4rem 2rem 5rem" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          
          <div style={{ marginBottom: "2.5rem" }}>
            <span style={{ fontSize: "0.68rem", fontWeight: 600, letterSpacing: "0.2em", textTransform: "uppercase", color: T.teal, display: "block", marginBottom: "0.5rem" }}>Tech Stack</span>
            <h2 style={{ fontSize: "clamp(1.6rem,3vw,2.2rem)", fontWeight: 800, color: "#f5ead8", letterSpacing: "-0.03em", margin: 0 }}>What I work with</h2>
          </div>

          <nav role="tablist" style={{ display: "flex", borderBottom: `1px solid ${T.border}`, marginBottom: 0, overflowX: "auto" }}>
            {TABS.map(t => {
              const on = activeTab === t.id;
              return (
                <button key={t.id} onClick={() => setActiveTab(t.id)}
                  style={{
                    padding: "0.6rem 1.1rem", fontSize: 13, fontWeight: 600,
                    color: on ? T.teal : T.txt3, border: "none", background: "none", cursor: "pointer",
                    borderBottom: `2px solid ${on ? T.teal : "transparent"}`,
                    marginBottom: -1, whiteSpace: "nowrap", transition: "all 0.18s",
                  }}>
                  {t.label}
                </button>
              );
            })}
          </nav>

          {activeTab === "stack" && <StackPanel />}
          {activeTab === "proficiency" && <ProficiencyPanel active />}
          {activeTab === "about" && <AboutPanel />}
        </div>
      </div>
    </div>
  );
}
