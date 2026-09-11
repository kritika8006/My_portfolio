import { useState, useEffect, useCallback } from "react";
import Reveal from "./Reveal";
import { eyebrow } from "./tokens";
import { CylinderCarousel } from "../components/CylindricalCarousel";

// ─── Design tokens ───────────────────────────────────────────────
const T = {
  bg:       "#080b10",
  card:     "#0d1420",
  card2:    "#111827",
  border:   "#1e2d3d",
  border2:  "#243447",
  txt:      "#e8f4f8",
  txt2:     "#7a9bb5",
  txt3:     "#3d566e",
  teal:     "#00d4b8",
  tealDim:  "#00d4b822",
  tealMid:  "#00d4b855",
  violet:   "#6c63ff",
};

// ─── Projects data ───────────────────────────────────────────────
const PROJECTS = [
  {
    id: 1,
    title: "Local AI Code Assistant",
    category: "AI / LLM",
    description:
      "A RAG-based tool to search and analyse local codebases using fully local LLMs — built for developer privacy. No API keys, no cloud. Uses Gemma 3 via Ollama and FAISS for vector search.",
    tags: ["LangChain", "Ollama", "FAISS", "Node.js", "Python"],
    github: "https://github.com/kritika8006/code-chat-ai",
    color: "#00d4b8",
  },
  {
    id: 2,
    title: "TripWise",
    category: "AI · Travel",
    description:
      "An AI-powered travel planning application that aggregates user preferences to generate personalized itineraries, utilizing the Gemini API for intelligent route optimization.",
    tags: ["React", "Gemini API", "Node.js", "TailwindCSS"],
    github: "https://github.com/kritika8006/tripwise",
    color: "#f59e0b",
    image: "/projects/tripwise.png",
  },
  {
    id: 3,
    title: "Communication Link",
    category: "AI · Health",
    description:
      "A prototype speech therapy app for autistic children with AI-driven contextual feedback. Full-stack MERN app with a FastAPI Python backend powering the AI analysis layer.",
    tags: ["React", "Node.js", "FastAPI", "MongoDB", "Python"],
    github: "https://github.com/kritika8006/communication-link",
    color: "#6c63ff",
    image: "/projects/aac-dashboard.png",
  },
  {
    id: 4,
    title: "Cyber Security Club",
    category: "Web Dev",
    description:
      "Official NIT Jalandhar CSC platform built with the club team — features secure authentication with JWT, event listings, CTF announcements, and a member dashboard.",
    tags: ["React", "Node.js", "MongoDB", "JWT", "TailwindCSS"],
    github: "https://github.com/kritika8006/CSC_NITJ_Web",
    color: "#0ea5e9",
    image: "/projects/csc-nitj.png",
  },
  {
    id: 5,
    title: "ReWear",
    category: "Web Dev",
    description:
      "A community-driven clothing exchange platform for sustainable fashion. Users can list, browse, and swap clothing items, with image uploads via Cloudinary and secure user auth.",
    tags: ["React", "Node.js", "MongoDB", "Cloudinary", "JWT"],
    github: "https://github.com/kritika8006/Rewear",
    color: "#10b981",
    image: "/projects/helpyuva-rewear.png",
  },
  {
    id: 6,
    title: "Library Management System",
    category: "Full Stack",
    description:
      "A full-stack inventory system for library management with role-based access control — separate admin and user portals for secure book tracking, issue management, and reporting.",
    tags: ["MongoDB", "Express", "React", "Node.js", "JWT"],
    github: "github.com/kritika8006/OptiReserveClient",
    color: "#f59e0b",
  },
  {
    id: 7,
    title: "Imagify",
    category: "AI / SaaS",
    description:
      "An AI-powered text-to-image generator with credit-based billing. Razorpay checkout, MongoDB-backed accounts, and instant image generation.",
    tags: ["Next.js", "TypeScript", "Razorpay", "MongoDB"],
    github: "https://github.com/kritika8006/imageCreation",
    color: "#3b82f6",
    image: "/projects/imagify.png",
  },
  {
    id: 8,
    title: "AI Interview Simulator",
    category: "AI / EdTech",
    description:
      "A mock interview platform that generates role-based technical questions, evaluates answers with a local LLM, and provides model answers — fully offline for privacy.",
    tags: ["Python", "Next.js", "TailwindCSS", "Local LLM"],
    github: "https://github.com/kritika8006/AI-interview-stimulator2",
    color: "#22c55e",
    image: "/projects/ai-interview-simulator.png",
  },
  {
    id: 9,
    title: "AI Neon HUD",
    category: "Computer Vision",
    description:
      "Gesture-controlled air writing using real-time hand tracking — hover, write, and erase on a virtual canvas without touching anything.",
    tags: ["Python", "OpenCV", "MediaPipe"],
    github: "https://github.com/kritika8006/ai_writer",
    color: "#ec4899",
    image: "/projects/ai-neon-hud.png",
  },
];

// Screenshots for the rotating hero carousel — pulled from the same
// public/projects folder, shown in a fixed showcase order.
const SHOWCASE_IMAGES = [
  { src: "/projects/imagify.png", alt: "Imagify — AI text-to-image generator" },
  { src: "/projects/aac-dashboard.png", alt: "AAC Communication Dashboard" },
  { src: "/projects/ai-interview-simulator.png", alt: "AI Interview Simulator" },
  { src: "/projects/ai-neon-hud.png", alt: "AI Neon HUD — gesture air writing" },
  { src: "/projects/csc-nitj.png", alt: "CSC NITJ — Cyber Security Club" },
  { src: "/projects/tripwise.png", alt: "TripWise — AI trip planner & budget tracker" },
  { src: "/projects/helpyuva-rewear.png", alt: "HelpYuva & Rewear platform" },
];

// ─── Terminal lines ───────────────────────────────────────────────
const AI_LINES = [
  { t: "> current_project",                       c: "#00d4b8" },
  { t: "Local AI Code Assistant (RAG + Ollama)...", c: "#4ade80" },
  { t: "> stack",                                 c: "#00d4b8" },
  { t: "LangChain · Ollama · FAISS · nomic-embed",  c: "#4ade80" },
  { t: "> also_building",                         c: "#00d4b8" },
  { t: "TripWise · CSC Web Platform (NITJ)",        c: "#4ade80" },
  { t: "> model_used",                            c: "#00d4b8" },
  { t: "Gemma 3 — runs 100% locally, no API key.",  c: T.txt },
  { t: "// privacy-first AI for developers",        c: T.txt3 },
];

const TECH_CARDS = [
  { icon: "🧠", title: "LangChain",      desc: "Chains & agents — powers the RAG code assistant.",        color: T.teal   },
  { icon: "🦙", title: "Ollama (Gemma 3)", desc: "Local LLM inference — no API keys, full privacy.",  color: T.violet },
  { icon: "📐", title: "FAISS",          desc: "Vector search for fast semantic codebase lookup.",        color: "#0ea5e9" },
  { icon: "⚡", title: "FastAPI",        desc: "Python backend powering Communication Link AI.",          color: "#10b981" },
];

// ─────────────────────────────────────────────────────────────────
//  AI TERMINAL
// ─────────────────────────────────────────────────────────────────
function AITerminal() {
  const [shown, setShown] = useState(0);
  useEffect(() => {
    if (shown >= AI_LINES.length) return;
    const id = setTimeout(() => setShown(s => s + 1), 420);
    return () => clearTimeout(id);
  }, [shown]);

  return (
    <div style={{ borderRadius: "0.75rem", overflow: "hidden", border: `1px solid ${T.border2}` }}>
      <div style={{
        background: T.card, padding: "10px 16px", display: "flex", alignItems: "center", gap: 6,
        borderBottom: `1px solid ${T.border}`,
      }}>
        {["#ff5f57", "#febc2e", "#28c840"].map(c => (
          <span key={c} style={{ width: 10, height: 10, borderRadius: "50%", background: c, display: "inline-block" }} />
        ))}
      </div>
      <div style={{
        background: "#060a10", padding: "20px 24px", fontFamily: "'JetBrains Mono','Fira Code',monospace",
        fontSize: "13px", lineHeight: 2, minHeight: 220,
      }}>
        {AI_LINES.slice(0, shown).map((l, i) => (
          <p key={i} style={{ margin: 0, color: l.c }}>{l.t}</p>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
//  PROJECT CARD
// ─────────────────────────────────────────────────────────────────
function ProjectCard({ project, onSelect }) {
  const [hovered, setHovered] = useState(false);
  const ac = project.color;

  return (
    <div
      onClick={() => onSelect(project)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: T.card, border: `1px solid ${hovered ? T.tealMid : T.border}`,
        borderRadius: "12px", overflow: "hidden", cursor: "pointer", display: "flex", flexDirection: "column",
        transform: hovered ? "translateY(-6px)" : "translateY(0)",
        transition: "transform .28s, border-color .28s",
      }}
    >
      <div style={{ height: 96, position: "relative", overflow: "hidden", background: "linear-gradient(135deg,#0a1020,#0d1830)", borderBottom: `1px solid ${T.border}` }}>
        {project.image && (
          <img
            src={project.image}
            alt={project.title}
            style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.85 }}
          />
        )}
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: ac }} />
      </div>
      <div style={{ padding: "14px 16px", display: "flex", flexDirection: "column", flex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", marginBottom: 6 }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: ac, marginRight: 8 }} />
          <span style={{ fontSize: 14, fontWeight: 600, color: T.txt }}>{project.title}</span>
        </div>
        <p style={{ fontSize: 12, color: T.txt2, lineHeight: 1.65, flex: 1, margin: "0 0 12px" }}>{project.description}</p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 12 }}>
          {project.tags.map(t => (
            <span key={t} style={{
              fontSize: 10, fontFamily: "monospace", color: T.txt2, background: "#0a1020",
              border: `1px solid ${T.border}`, padding: "1px 6px", borderRadius: 3
            }}>{t}</span>
          ))}
        </div>
        <a href={project.github} target="_blank" rel="noopener noreferrer" style={{ fontSize: 11, fontWeight: 600, color: T.teal, textDecoration: "none" }}>View on GitHub →</a>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
//  MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────
export default function Projects({ setSelectedProject }) {
  const items = PROJECTS;

  const handleSelect = useCallback((project) => {
    if (setSelectedProject) setSelectedProject(project);
  }, [setSelectedProject]);

  return (
    <div style={{ fontFamily: "'Inter',system-ui,sans-serif", background: T.bg, minHeight: "100vh", color: T.txt }}>
      {/* ── HERO ── */}
      <div style={{ padding: "60px 32px 0", borderBottom: `1px solid ${T.border}`, position: "relative" }}>
        <h1 style={{ fontSize: "3rem", fontWeight: 700, margin: "0 0 40px" }}>Featured work</h1>
        <div style={{ height: 480, width: "100%", borderTop: `1px solid ${T.border}` }}>
          <CylinderCarousel
            images={SHOWCASE_IMAGES}
            cardWidth={720}
            animationDuration={40}
            radiusScale={1.2}
            perspective="70em"
          />
        </div>
      </div>

      {/* ── GRID ── */}
      <div style={{ padding: "5rem 2.5rem", maxWidth: "76rem", margin: "0 auto" }}>
        <h2 style={{ fontSize: "2.4rem", fontWeight: 700, marginBottom: "2.5rem" }}>All projects</h2>
        <div style={{ display: "grid", gap: "1rem", gridTemplateColumns: "repeat(auto-fill,minmax(270px,1fr))" }}>
          {items.map((p) => (
            <ProjectCard key={p.id} project={p} onSelect={handleSelect} />
          ))}
        </div>
      </div>

      {/* ── AI CORNER ── */}
      <div style={{ background: "#060810", padding: "5rem 2.5rem", borderTop: `1px solid ${T.border}` }}>
        <div style={{ maxWidth: "76rem", margin: "0 auto" }}>
          <h2 style={{ fontSize: "2.4rem", fontWeight: 700, marginBottom: "2.5rem" }}>What I'm building with AI</h2>
          <div style={{ display: "grid", gap: "1.5rem", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))" }}>
            <AITerminal />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
              {TECH_CARDS.map(item => (
                <div key={item.title} style={{ background: T.card, border: `1px solid ${T.border}`, padding: "1rem", borderRadius: "0.75rem" }}>
                  <div style={{ fontSize: "1.3rem" }}>{item.icon}</div>
                  <h4 style={{ color: item.color, margin: "0.5rem 0" }}>{item.title}</h4>
                  <p style={{ fontSize: "0.75rem", color: T.txt2 }}>{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
