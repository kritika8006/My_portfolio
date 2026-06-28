import { T, pill, hoverCard } from "./tokens";

/**
 * ProjectCard — standalone reusable card component.
 * Props:
 *   project: { id, title, description, tags[], color? }
 *   onClick: (project) => void
 */
export default function ProjectCard({ project, onClick }) {
  return (
    <div
      onClick={() => onClick && onClick(project)}
      style={{
        background: project.color || "#FFFFFF",
        borderRadius: "1.5rem",
        boxShadow: "0 2px 20px rgba(180,83,9,0.07), 0 1px 4px rgba(0,0,0,0.04)",
        border: "1px solid rgba(251,191,36,0.12)",
        padding: "2rem",
        cursor: "pointer",
        display: "flex",
        flexDirection: "column",
        transition: "transform 0.3s ease, box-shadow 0.3s ease",
      }}
      onMouseEnter={e => hoverCard(e.currentTarget, true)}
      onMouseLeave={e => hoverCard(e.currentTarget, false)}
    >
      {/* Optional accent top bar based on first tag colour */}
      <div style={{
        height: 3,
        borderRadius: "999px",
        background: "linear-gradient(90deg,#f97316,#fbbf24)",
        marginBottom: "1rem",
      }} />

      <h3 style={{
        fontSize: "1.1rem",
        fontWeight: 700,
        color: "#78350f",
        marginBottom: "0.6rem",
        margin: "0 0 0.6rem",
      }}>
        {project.title}
      </h3>

      <p style={{
        color: "#374151",
        lineHeight: 1.75,
        fontSize: "0.9rem",
        flex: 1,
        margin: "0 0 1.25rem",
      }}>
        {project.description}
      </p>

      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem", marginBottom: "1rem" }}>
        {(project.tags || []).map(t => (
          <span key={t} style={pill}>{t}</span>
        ))}
      </div>

      <div style={{
        fontSize: "0.82rem",
        color: "#f97316",
        fontWeight: 600,
        letterSpacing: "0.04em",
      }}>
        View project →
      </div>
    </div>
  );
}
