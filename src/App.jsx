import { useState, useEffect } from "react";
import Portfolio from "./components/Portfolio";
import Projects from "./sections/Projects";
import Skills from "./sections/Skills";
import Leadership from "./sections/Leadership";
import Contact from "./sections/Contact";
import About from "./sections/About";
import ProjectModal from "./ui/ProjectModal";
import { projects } from "./data/portfolioData";

const SECTION_MAP = {
  Projects:   "projects",
  Skills:     "skills",
  Leadership: "leadership",
  About:      "about",
  Contact:    "contact",
};

const NAV_ICONS = {
  Projects:   "🔧",
  Skills:     "📐",
  Leadership: "📌",
  About:      "🖥️",
  Contact:    "✉️",
};

export default function App() {
  const [selectedProject, setSelectedProject] = useState(null);
  const [view, setView] = useState("home");
  const [entering, setEntering] = useState(false);

  const isFullPage = view !== "home";

  const handleNavigate = (section) => {
    const mapped = SECTION_MAP[section];
    if (!mapped) return;
    setEntering(true);
    setTimeout(() => {
      setView(mapped);
      setEntering(false);
    }, 280);
  };

  const handleBackToRoom = () => {
    setView("home");
    setEntering(false);
  };

  useEffect(() => {
    if (isFullPage) window.scrollTo({ top: 0, behavior: "instant" });
  }, [view]);

  return (
    <>
      {/* Responsive helpers for the top bar (inline styles can't do media queries) */}
            <style>{`
        html { overflow-x: hidden; }
        img, video, canvas { max-width: 100%; }
        @media (max-width: 640px) {
          .nav-label { display: none; }
          .nav-tab   { padding: 8px 11px !important; }
          .nav-bar   { gap: 8px !important; }
        }
        @media (max-width: 480px) {
          .kj-logo { display: none !important; }
        }
      `}</style>
      
      {/* ── 3D ROOM ───────────────────────────────────── */}
      {!isFullPage && (
        <Portfolio onNavigate={handleNavigate} />
      )}

      {/* ── SECTION PAGES ─────────────────────────────── */}
      {isFullPage && (
        <div style={{
          minHeight: "100vh",
          background: "#FFF8EF",
          opacity: entering ? 0 : 1,
          transform: entering ? "translateY(18px)" : "translateY(0)",
          transition: "opacity 0.48s cubic-bezier(0.22,1,0.36,1), transform 0.48s cubic-bezier(0.22,1,0.36,1)",
        }}>

          {/* ── Top bar ───────────────────────────────── */}
          <div className="nav-bar" style={{
            position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
            height: 64,
            background: "rgba(255,248,239,0.85)",
            backdropFilter: "blur(18px)",
            WebkitBackdropFilter: "blur(18px)",
            borderBottom: "1px solid rgba(249,115,22,0.1)",
            boxShadow: "0 2px 20px rgba(180,83,9,0.06)",
            display: "flex", alignItems: "center",
            padding: "0 clamp(10px, 3vw, 24px)",
            gap: 12,
            fontFamily: "'Inter', system-ui, sans-serif",
          }}>
            {/* Back */}
            <button
              onClick={handleBackToRoom}
              style={{
                all: "unset", cursor: "pointer",
                display: "flex", alignItems: "center", gap: 6,
                background: "#f97316", color: "#fff",
                borderRadius: 999, padding: "7px 18px",
                fontSize: 12, fontWeight: 700, letterSpacing: "0.02em",
                boxShadow: "0 2px 10px rgba(249,115,22,0.35)",
                transition: "transform 0.18s, box-shadow 0.18s",
                flexShrink: 0,
              }}
              onMouseEnter={e => { e.currentTarget.style.transform="scale(1.05)"; e.currentTarget.style.boxShadow="0 4px 18px rgba(249,115,22,0.5)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform=""; e.currentTarget.style.boxShadow="0 2px 10px rgba(249,115,22,0.35)"; }}
            >
              ← Room
            </button>

            {/* Divider */}
            <div style={{ width:1, height:28, background:"rgba(249,115,22,0.15)", flexShrink:0 }} />

            {/* Section tabs */}
            <div style={{ display:"flex", gap:4, flex:1, overflowX:"auto", minWidth: 0 }}>
              {Object.entries(SECTION_MAP).map(([label, key]) => {
                const active = view === key;
                return (
                  <button
                    key={key}
                    className="nav-tab"
                    title={label}
                    aria-label={label}
                    onClick={() => setView(key)}
                    style={{
                      all: "unset", cursor: "pointer",
                      display: "flex", alignItems: "center", gap: 5,
                      padding: "6px 14px",
                      borderRadius: 999,
                      fontSize: 12, fontWeight: active ? 700 : 500,
                      letterSpacing: "0.02em",
                      background: active ? "#f97316" : "transparent",
                      color: active ? "#fff" : "#92400e",
                      transition: "all 0.18s ease",
                      whiteSpace: "nowrap",
                      flexShrink: 0,
                    }}
                    onMouseEnter={e => { if (!active) e.currentTarget.style.background="rgba(249,115,22,0.1)"; }}
                    onMouseLeave={e => { if (!active) e.currentTarget.style.background="transparent"; }}
                  >
                    <span style={{ fontSize:13 }}>{NAV_ICONS[label]}</span>
                    <span className="nav-label">{label}</span>
                  </button>
                );
              })}
            </div>

            {/* KJ logo */}
            <div className="kj-logo" style={{
              width:34, height:34, borderRadius:8, flexShrink:0,
              background:"linear-gradient(145deg,#4a1e06,#b86828)",
              display:"flex", alignItems:"center", justifyContent:"center",
              boxShadow:"0 2px 10px rgba(0,0,0,0.25)",
            }}>
              <span style={{ fontFamily:"monospace", color:"#fde68a", fontWeight:900, fontSize:10, letterSpacing:"-1px" }}>KJ</span>
            </div>
          </div>

          {/* Section content — padded below fixed bar */}
          <div style={{ paddingTop: 64 }}>
            {view === "projects"   && <Projects projects={projects} setSelectedProject={setSelectedProject} />}
            {view === "skills"     && <Skills />}
            {view === "leadership" && <Leadership />}
            {view === "about"      && <About />}
            {view === "contact"    && <Contact />}
          </div>
        </div>
      )}

      {/* ── PROJECT MODAL ─────────────────────────────── */}
      <ProjectModal
        project={selectedProject}
        onClose={() => setSelectedProject(null)}
      />
    </>
  );
}