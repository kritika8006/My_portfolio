import { useEffect } from "react";

export default function ProjectModal({ project, onClose }) {
  // Close on Escape key
  useEffect(() => {
    if (!project) return;
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [project, onClose]);

  // Lock body scroll while open
  useEffect(() => {
    document.body.style.overflow = project ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [project]);

  if (!project) return null;

  const pill = {
    display: "inline-block",
    background: "#ffedd5",
    color: "#92400e",
    borderRadius: "999px",
    padding: "0.3rem 0.85rem",
    fontSize: "0.8rem",
    fontWeight: 600,
    border: "1px solid rgba(251,191,36,0.22)",
  };

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: "fixed", inset: 0, zIndex: 200,
          background: "rgba(10,5,1,0.72)",
          backdropFilter: "blur(6px)",
          WebkitBackdropFilter: "blur(6px)",
          animation: "fadeIn 0.2s ease both",
        }}
      />

      {/* Modal card */}
      <div style={{
        position: "fixed",
        top: "50%", left: "50%",
        transform: "translate(-50%,-50%)",
        zIndex: 201,
        width: "min(92vw, 540px)",
        background: project.color || "#fff",
        borderRadius: "2rem",
        boxShadow: "0 24px 80px rgba(0,0,0,0.35)",
        border: "1px solid rgba(251,191,36,0.18)",
        overflow: "hidden",
        animation: "slideUp 0.32s cubic-bezier(0.22,1,0.36,1) both",
        fontFamily: "'Inter', system-ui, sans-serif",
      }}>
        {/* Orange accent bar */}
        <div style={{ height: 4, background: "linear-gradient(90deg,#f97316,#fbbf24)" }} />

        <div style={{ padding: "2rem 2rem 1.5rem" }}>
          {/* Header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }}>
            <h2 style={{
              margin: 0, fontSize: "1.4rem", fontWeight: 800,
              color: "#78350f", letterSpacing: "-0.02em",
            }}>
              {project.title}
            </h2>
            <button
              onClick={onClose}
              style={{
                all: "unset", cursor: "pointer",
                width: 32, height: 32, borderRadius: "50%",
                background: "rgba(249,115,22,0.1)",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "#f97316", fontSize: 18, flexShrink: 0,
                transition: "background 0.18s",
              }}
              onMouseEnter={e => e.currentTarget.style.background = "rgba(249,115,22,0.22)"}
              onMouseLeave={e => e.currentTarget.style.background = "rgba(249,115,22,0.1)"}
            >
              ✕
            </button>
          </div>

          {project.year && (
            <span style={{
              fontSize: "0.72rem", fontWeight: 600, letterSpacing: "0.16em",
              textTransform: "uppercase", color: "#f97316", display: "block",
              marginBottom: "1rem",
            }}>
              {project.year}
            </span>
          )}

          <p style={{ color: "#374151", lineHeight: 1.82, marginBottom: "1.5rem", fontSize: "0.95rem" }}>
            {project.description}
          </p>

          {/* Tags */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.45rem", marginBottom: "1.75rem" }}>
            {(project.tags || []).map(t => <span key={t} style={pill}>{t}</span>)}
          </div>

          {/* Action buttons */}
          <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
            {project.github && (
              <a href={project.github} target="_blank" rel="noreferrer" style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                background: "#1a0f07", color: "#fde68a",
                borderRadius: 999, padding: "10px 22px",
                fontSize: 13, fontWeight: 700, textDecoration: "none",
                transition: "transform 0.18s, box-shadow 0.18s",
                boxShadow: "0 2px 10px rgba(0,0,0,0.2)",
              }}
                onMouseEnter={e => { e.currentTarget.style.transform = "scale(1.04)"; e.currentTarget.style.boxShadow = "0 6px 20px rgba(0,0,0,0.3)"; }}
                onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = "0 2px 10px rgba(0,0,0,0.2)"; }}
              >
                ⌨️ GitHub
              </a>
            )}
            {project.live && (
              <a href={project.live} target="_blank" rel="noreferrer" style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                background: "#f97316", color: "#fff",
                borderRadius: 999, padding: "10px 22px",
                fontSize: 13, fontWeight: 700, textDecoration: "none",
                transition: "transform 0.18s, box-shadow 0.18s",
                boxShadow: "0 2px 10px rgba(249,115,22,0.35)",
              }}
                onMouseEnter={e => { e.currentTarget.style.transform = "scale(1.04)"; e.currentTarget.style.boxShadow = "0 6px 20px rgba(249,115,22,0.5)"; }}
                onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = "0 2px 10px rgba(249,115,22,0.35)"; }}
              >
                🚀 Live Demo
              </a>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn { from{opacity:0} to{opacity:1} }
        @keyframes slideUp { from{opacity:0;transform:translate(-50%,-44%)} to{opacity:1;transform:translate(-50%,-50%)} }
      `}</style>
    </>
  );
}
