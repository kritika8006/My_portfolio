import { useState } from "react";
import InteractiveBook from "../components/InteractiveBook";

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
  { num: "1", lbl: "Club headed", color: T.teal, icon: "🛡️" },
  { num: "5+", lbl: "CTF and campus events", color: T.violet, icon: "⚡" },
  { num: "200+", lbl: "Students reached", color: T.blue, icon: "🌐" },
  { num: "3", lbl: "Institutional platforms", color: T.green, icon: "🏛️" },
];

// ── BOOK COVER (inline SVG, no external asset needed) ──────────
// Clean, warm cover — deep navy field, a thin gold frame, and elegant
// serif type. No glow/neon effects, just a calm, book-like look.
const COVER_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" width="500" height="700" viewBox="0 0 500 700">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#132436"/>
      <stop offset="100%" stop-color="#0a1420"/>
    </linearGradient>
  </defs>
  <rect width="500" height="700" fill="url(#bg)"/>
  <rect x="28" y="28" width="444" height="644" fill="none" stroke="#c9a86a" stroke-width="1.5" opacity="0.55"/>
  <rect x="40" y="40" width="420" height="620" fill="none" stroke="#c9a86a" stroke-width="0.75" opacity="0.35"/>

  <!-- simple compass/emblem -->
  <g transform="translate(250,215)" stroke="#c9a86a" stroke-width="1.4" fill="none" opacity="0.85">
    <circle r="42"/>
    <circle r="3" fill="#c9a86a" stroke="none"/>
    <path d="M0,-42 L0,-52 M0,42 L0,52 M-42,0 L-52,0 M42,0 L52,0"/>
  </g>

  <text x="250" y="360" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif" font-size="48" font-weight="700" fill="#f5efe3">Leadership</text>
  <rect x="205" y="382" width="90" height="2" fill="#c9a86a"/>
  <text x="250" y="412" text-anchor="middle" font-family="Georgia, serif" font-style="italic" font-size="15" fill="#a9b8c6">A Journal of Campus Impact</text>

  <text x="250" y="640" text-anchor="middle" font-family="Arial, sans-serif" font-size="12" letter-spacing="3" fill="#8090a0">KRITIKA</text>
</svg>
`;
const COVER_IMAGE = `data:image/svg+xml;base64,${
  typeof window !== "undefined" ? window.btoa(COVER_SVG) : ""
}`;

// ── Expressive, journal-style copy for each role ─────────────────
// Written as prose rather than resume bullets, since the whole point
// of the notebook format is to feel handwritten and personal.
const ROLE_ICONS = ["🛡️", "🏃", "🎓"];

const NARRATIVE = [
  {
    intro:
      "Stepping into this role felt like inheriting a live wire — workshops to run, a community to grow, and a platform that couldn't go down. I said yes anyway.",
    body: [
      "Every CTF, every workshop, every awareness drive on campus traces back to a small team that decided cybersecurity shouldn't feel intimidating. I lead that team.",
      "Behind the scenes, I keep the official NIT Jalandhar CSC platform alive — as its full-stack developer and infrastructure lead, working in React, Node, and MongoDB.",
      "None of it happens alone. I coordinate with faculty, outside speakers, and sister clubs, because a tech community is only as strong as the bridges between its parts.",
    ],
  },
  {
    intro:
      "Somewhere between a spreadsheet and a starting line, event management taught me what campus leadership actually costs — and what it gives back.",
    body: [
      "The NITJ Half-Marathon 2.0 was mine to run, literally and organisationally — registrations, logistics, and the whole unglamorous machinery behind race day.",
      "Five-plus health campaigns later, I've learned to hold several moving teams in my head at once without dropping any of them.",
      "The real skill wasn't logistics, though — it was communicating clearly under pressure, and keeping Git-based collaboration humming across every team I touched.",
    ],
  },
  {
    intro:
      "Some of my best work is invisible by design — the placement portal every graduating student depends on, and hopefully never has to think about.",
    body: [
      "I collaborate on the MERN-based backbone of NIT Jalandhar's Training and Placement Office portal — the system an entire campus quietly relies on each recruitment season.",
      "My part lives in the architecture: the features that manage placements at scale, built to be reliable rather than flashy.",
      "Working alongside faculty and fellow developers, security and uptime aren't afterthoughts here. They're the whole job.",
    ],
  },
];

// Page A of each spread: the header card (icon, title, org, tags, intro line).
function introPage(r, i) {
  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <div
        style={{
          width: 56,
          height: 56,
          borderRadius: 14,
          background: `${r.color}18`,
          border: `1.5px solid ${r.color}55`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "1.7rem",
          margin: "0.25rem auto 1rem",
        }}
      >
        {ROLE_ICONS[i] || "★"}
      </div>

      <h3 style={{ fontFamily: "Georgia, serif", fontSize: "1.25rem", fontWeight: 700, textAlign: "center", color: "#262626", margin: "0 0 0.3rem" }}>
        {r.role}
      </h3>
      <div style={{ width: 44, height: 2, background: r.color, margin: "0 auto 0.7rem" }} />
      <p style={{ textAlign: "center", fontSize: "0.72rem", color: "#9a9a9a", margin: "0 0 0.15rem" }}>{r.year}</p>
      <p style={{ textAlign: "center", fontSize: "0.85rem", fontWeight: 600, color: "#444", margin: "0 0 1.1rem" }}>{r.org}</p>

      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.35rem", justifyContent: "center", marginBottom: "1.5rem" }}>
        {r.tags.map((t) => (
          <span
            key={t}
            style={{
              fontSize: "0.6rem",
              fontFamily: "monospace",
              padding: "3px 9px",
              borderRadius: 999,
              background: `${r.color}12`,
              border: `1px solid ${r.color}55`,
              color: r.color,
            }}
          >
            {t}
          </span>
        ))}
      </div>

      <p
        style={{
          fontFamily: "Georgia, serif",
          fontStyle: "italic",
          fontSize: "0.92rem",
          lineHeight: 1.75,
          color: "#4a4a4a",
          textAlign: "center",
          padding: "0 0.25rem",
        }}
      >
        “{NARRATIVE[i].intro}”
      </p>

      <div style={{ flex: 1 }} />
      <p style={{ textAlign: "center", fontSize: "0.65rem", color: "#b5b5b5", letterSpacing: "0.1em" }}>turn the page →</p>
    </div>
  );
}

// Page B of each spread: the expressive account of what was actually done.
function storyPage(r, i) {
  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <p style={{ fontFamily: "monospace", fontSize: "0.62rem", color: r.color, letterSpacing: "0.15em", textAlign: "center", marginBottom: "0.4rem" }}>
        {r.role.toUpperCase()}
      </p>
      <div style={{ width: 32, height: 2, background: r.color, margin: "0 auto 1.3rem" }} />
      {NARRATIVE[i].body.map((para, j) => (
        <p
          key={j}
          style={{
            fontFamily: "Georgia, serif",
            fontSize: "0.9rem",
            lineHeight: 1.85,
            color: "#333",
            marginBottom: "1.1rem",
          }}
        >
          {j === 0 && (
            <span style={{ fontSize: "2.1rem", lineHeight: 1, float: "left", marginRight: "0.4rem", color: r.color, fontWeight: 700 }}>
              {para.charAt(0)}
            </span>
          )}
          {j === 0 ? para.slice(1) : para}
        </p>
      ))}
    </div>
  );
}

// Build the actual page list: two pages per role, both landing on the
// visible right-hand face. The left page stays intentionally blank.
const BOOK_PAGES = ROLES.flatMap((r, i) => [
  { pageNumber: i * 2 + 1, content: introPage(r, i), accentColor: r.color, icon: ROLE_ICONS[i] },
  { pageNumber: i * 2 + 2, content: storyPage(r, i), accentColor: r.color, icon: ROLE_ICONS[i] },
]);

// ── PAGE ─────────────────────────────────────────────────────────
function ImpactCard({ stat }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: T.card,
        border: `1px solid ${hovered ? `${stat.color}88` : T.border}`,
        borderRadius: 14,
        padding: "1.75rem 1rem",
        textAlign: "center",
        transform: hovered ? "translateY(-6px)" : "translateY(0)",
        boxShadow: hovered ? `0 12px 28px -8px ${stat.color}40` : "none",
        transition: "transform .25s, border-color .25s, box-shadow .25s",
      }}
    >
      <div style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>{stat.icon}</div>
      <div style={{ fontSize: "2.6rem", fontWeight: 800, color: stat.color, marginBottom: "0.45rem" }}>{stat.num}</div>
      <div style={{ color: T.txt2, fontSize: "0.78rem" }}>{stat.lbl}</div>
    </div>
  );
}

export default function Leadership() {
  return (
    <div style={{ fontFamily: "'Inter',system-ui,sans-serif", background: T.bg, minHeight: "100vh", color: T.txt, position: "relative" }}>
      <style>{`@keyframes fadeUp { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }`}</style>

      {/* ── HERO / BOOK ── */}
      <div style={{
        position: "relative",
        zIndex: 1,
        minHeight: "100vh",
        padding: "5rem 2rem 4rem",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
      }}>
        {/* Ambient glow behind the title */}
        <div style={{
          position: "absolute",
          top: "8%",
          left: "50%",
          transform: "translateX(-50%)",
          width: 700,
          height: 700,
          background: `radial-gradient(circle, ${T.teal}14 0%, transparent 65%)`,
          pointerEvents: "none",
        }} />

        <div style={{ textAlign: "center", animation: "fadeUp 0.85s ease both", marginBottom: "2.5rem", position: "relative" }}>
          <span style={{ fontSize: "0.68rem", fontWeight: 600, letterSpacing: "0.2em", textTransform: "uppercase", color: T.teal, marginBottom: "1rem", display: "block" }}>
            Portfolio · Leadership
          </span>
          <h1 style={{ color: "#f0f9ff", fontSize: "clamp(3rem, 7vw, 5rem)", fontWeight: 800, margin: 0 }}>Leadership</h1>
          <p style={{ color: `${T.txt2}99`, fontSize: "1rem", marginTop: "1rem" }}>
            Building community · shipping platforms · leading teams
          </p>
        </div>

        <InteractiveBook
          coverImage={COVER_IMAGE}
          bookTitle="Leadership"
          bookAuthor="Kritika"
          pages={BOOK_PAGES}
          width={360}
          height={540}
        />
      </div>

      {/* ── IMPACT ── */}
      <div style={{ position: "relative", zIndex: 1, background: "transparent", padding: "5rem 2.5rem", borderTop: `1px solid ${T.border}` }}>
        <div style={{ maxWidth: "68rem", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
            <span style={{ fontSize: "0.65rem", fontWeight: 600, letterSpacing: "0.2em", textTransform: "uppercase", color: T.teal }}>
              By the numbers
            </span>
            <h2 style={{ color: "#f0f9ff", fontSize: "1.9rem", fontWeight: 700, margin: "0.5rem 0 0" }}>Impact</h2>
          </div>
          <div style={{ display: "grid", gap: "0.75rem", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))" }}>
            {IMPACT.map((s) => (
              <ImpactCard key={s.lbl} stat={s} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
