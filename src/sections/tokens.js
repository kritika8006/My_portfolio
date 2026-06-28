export const T = {
  cream:     "#FFF8EF",
  paper:     "#FFFFFF",
  amber900:  "#78350f",
  orange:    "#f97316",
  orangePill:"#ffedd5",
  muted:     "#6b7280",
  body:      "#374151",
  tag:       "#92400e",
};

export const card = {
  background: "#FFFFFF",
  borderRadius: "1.5rem",
  boxShadow: "0 2px 20px rgba(180,83,9,0.07), 0 1px 4px rgba(0,0,0,0.04)",
  padding: "2rem",
  border: "1px solid rgba(251,191,36,0.12)",
};

export const section = {
  backgroundColor: "#FFF8EF",
  padding: "6rem 2.5rem",
  fontFamily: "'Inter', system-ui, sans-serif",
};

export const h2 = {
  fontSize: "clamp(2.2rem,4.5vw,3.2rem)",
  fontWeight: 900,
  color: "#78350f",
  letterSpacing: "-0.03em",
  lineHeight: 1.05,
  margin: "0 0 0.5rem",
};

export const eyebrow = {
  fontSize: "0.72rem",
  fontWeight: 600,
  letterSpacing: "0.18em",
  textTransform: "uppercase",
  color: "#f97316",
  marginBottom: "0.75rem",
  display: "block",
};

export const pill = {
  display: "inline-block",
  background: "#ffedd5",
  color: "#92400e",
  borderRadius: "999px",
  padding: "0.3rem 0.85rem",
  fontSize: "0.8rem",
  fontWeight: 600,
  border: "1px solid rgba(251,191,36,0.22)",
};

export function hoverCard(el, on) {
  el.style.transform = on ? "translateY(-5px)" : "";
  el.style.boxShadow = on
    ? "0 10px 36px rgba(180,83,9,0.15)"
    : "0 2px 20px rgba(180,83,9,0.07), 0 1px 4px rgba(0,0,0,0.04)";
}
