import { useEffect, useRef, useState, useCallback } from "react";
import * as THREE from "three";
import Reveal from "./Reveal";
import { eyebrow } from "./tokens";

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
    github: "https://github.com/kritika8006",
    color: "#00d4b8",
  },
  {
    id: 2,
    title: "TripWise",
    category: "AI · Travel",
    description:
      "An AI-powered travel planning application that aggregates user preferences to generate personalized itineraries, utilizing the Gemini API for intelligent route optimization.",
    tags: ["React", "Gemini API", "Node.js", "TailwindCSS"],
    github: "https://github.com/kritika8006",
    color: "#f59e0b",
  },
  {
    id: 3,
    title: "Communication Link",
    category: "AI · Health",
    description:
      "A prototype speech therapy app for autistic children with AI-driven contextual feedback. Full-stack MERN app with a FastAPI Python backend powering the AI analysis layer.",
    tags: ["React", "Node.js", "FastAPI", "MongoDB", "Python"],
    github: "https://github.com/kritika8006",
    color: "#6c63ff",
  },
  {
    id: 4,
    title: "Cyber Security Club",
    category: "Web Dev",
    description:
      "Official NIT Jalandhar CSC platform built with the club team — features secure authentication with JWT, event listings, CTF announcements, and a member dashboard.",
    tags: ["React", "Node.js", "MongoDB", "JWT", "TailwindCSS"],
    github: "https://github.com/kritika8006",
    color: "#0ea5e9",
  },
  {
    id: 5,
    title: "ReWear",
    category: "Web Dev",
    description:
      "A community-driven clothing exchange platform for sustainable fashion. Users can list, browse, and swap clothing items, with image uploads via Cloudinary and secure user auth.",
    tags: ["React", "Node.js", "MongoDB", "Cloudinary", "JWT"],
    github: "https://github.com/kritika8006",
    color: "#10b981",
  },
  {
    id: 6,
    title: "Library Management System",
    category: "Full Stack",
    description:
      "A full-stack inventory system for library management with role-based access control — separate admin and user portals for secure book tracking, issue management, and reporting.",
    tags: ["MongoDB", "Express", "React", "Node.js", "JWT"],
    github: "https://github.com/kritika8006",
    color: "#f59e0b",
  },
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
//  3-D CARD SPOTLIGHT VIEWER
// ─────────────────────────────────────────────────────────────────
function CardSpotlight({ items, activeIdx, onSelect, onNavigate }) {
  const mountRef  = useRef(null);
  const stateRef  = useRef({ activeIdx, groups: [], t: 0, mouseX: 0, mouseY: 0 });

  useEffect(() => { stateRef.current.activeIdx = activeIdx; }, [activeIdx]);

  useEffect(() => {
    const el = mountRef.current;
    let W = el.clientWidth, H = el.clientHeight;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(W, H);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    el.appendChild(renderer.domElement);

    const scene  = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(44, W / H, 0.1, 100);
    camera.position.set(0, 0, 9);
    camera.lookAt(0, 0, 0);

    // Lighting
    scene.add(new THREE.AmbientLight("#c0d8f0", 0.5));
    const key = new THREE.DirectionalLight("#e8f4ff", 3.5);
    key.position.set(4, 7, 6); key.castShadow = true; scene.add(key);
    const fill = new THREE.DirectionalLight("#6080a0", 1.0);
    fill.position.set(-5, 2, 4); scene.add(fill);
    const rimPt   = new THREE.PointLight(T.teal, 6, 20);
    rimPt.position.set(0, -4, 4); scene.add(rimPt);
    const accentPt = new THREE.PointLight(T.teal, 8, 16);
    accentPt.position.set(-2, 3, 5); scene.add(accentPt);

    // Particle field
    const pGeo = new THREE.BufferGeometry();
    const pV   = [];
    for (let i = 0; i < 200; i++)
      pV.push((Math.random() - 0.5) * 26, (Math.random() - 0.5) * 14, (Math.random() - 0.5) * 10 - 4);
    pGeo.setAttribute("position", new THREE.Float32BufferAttribute(pV, 3));
    const pMesh = new THREE.Points(
      pGeo,
      new THREE.PointsMaterial({ color: T.teal, size: 0.04, transparent: true, opacity: 0.25 })
    );
    scene.add(pMesh);

    const CW = 6.5, CH = 4.2, CD = 0.18;

    const groups = items.map((item, i) => {
      const col = new THREE.Color(item.color);
      const g   = new THREE.Group();

      // Body
      g.add(new THREE.Mesh(
        new THREE.BoxGeometry(CW, CH, CD),
        new THREE.MeshStandardMaterial({ color: "#0d1420", roughness: 0.4, metalness: 0.5 })
      ));
      
      // Top accent bar
      const bar = new THREE.Mesh(
        new THREE.BoxGeometry(CW, 0.1, CD + 0.01),
        new THREE.MeshStandardMaterial({ color: col, emissive: col, emissiveIntensity: 0.8 })
      );
      bar.position.set(0, CH / 2 - 0.05, 0); g.add(bar);

      // Screen inset
      const screen = new THREE.Mesh(
        new THREE.BoxGeometry(CW - 0.3, CH - 0.55, 0.05),
        new THREE.MeshStandardMaterial({ color: "#060a10", roughness: 0.05, metalness: 0.02 })
      );
      screen.position.set(0, 0.12, CD / 2 + 0.02); g.add(screen);

      // Mockup lines
      for (let s = 0; s < 5; s++) {
        const sl = new THREE.Mesh(
          new THREE.BoxGeometry(s === 0 ? 3.5 : 2.2 + Math.random() * 0.8, 0.018, 0.03),
          new THREE.MeshStandardMaterial({ color: col, transparent: true, opacity: s === 0 ? 0.18 : 0.09 })
        );
        sl.position.set(-0.8 + s * 0.01, 0.5 - s * 0.5, CD / 2 + 0.04); g.add(sl);
      }

      // Orb indicator
      const orb = new THREE.Mesh(
        new THREE.SphereGeometry(0.09, 12, 12),
        new THREE.MeshStandardMaterial({ color: col, emissive: col, emissiveIntensity: 2.2 })
      );
      orb.position.set(-CW / 2 + 0.28, CH / 2 - 0.28, CD / 2 + 0.04); g.add(orb);

      // Traffic lights
      [["#ff5f57"], ["#febc2e"], ["#28c840"]].forEach(([c], d) => {
        const dot = new THREE.Mesh(
          new THREE.SphereGeometry(0.05, 10, 10),
          new THREE.MeshStandardMaterial({ color: c, emissive: c, emissiveIntensity: 0.9 })
        );
        dot.position.set(-CW / 2 + 0.3 + d * 0.2, CH / 2 - 0.68, CD / 2 + 0.04); g.add(dot);
      });

      // Tag pills
      (item.tags || []).slice(0, 3).forEach((_, ti) => {
        const tg = new THREE.Mesh(
          new THREE.BoxGeometry(1.0, 0.2, 0.03),
          new THREE.MeshStandardMaterial({ color: col, roughness: 0.5, metalness: 0.1, transparent: true, opacity: 0.55 })
        );
        tg.position.set(-1.8 + ti * 1.2, -CH / 2 + 0.36, CD / 2 + 0.03); g.add(tg);
      });

      g.children[0].castShadow = true;
      g.children[0].receiveShadow = true;
      g.position.set(i === 0 ? 0 : 20, 0, 0);
      g.userData = { idx: i, col, orb };
      scene.add(g);
      return g;
    });

    stateRef.current.groups = groups;

    // Interaction handlers
    const raycaster = new THREE.Raycaster();
    const mouse2    = new THREE.Vector2();
    const onClick = (e) => {
      if (Math.abs(dragRef.totalDX) > 8) return;
      const rect = el.getBoundingClientRect();
      mouse2.x = ((e.clientX - rect.left) / W) * 2 - 1;
      mouse2.y = -((e.clientY - rect.top) / H) * 2 + 1;
      raycaster.setFromCamera(mouse2, camera);
      const hits = raycaster.intersectObjects(scene.children, true);
      for (const h of hits) {
        let obj = h.object;
        while (obj.parent && obj.parent !== scene) obj = obj.parent;
        const g = groups.find(gg => gg === obj);
        if (g) { onSelect(items[g.userData.idx]); break; }
      }
    };
    el.addEventListener("click", onClick);

    const onMouseMove = (e) => {
      const rect = el.getBoundingClientRect();
      stateRef.current.mouseX = ((e.clientX - rect.left) / W - 0.5) * 2;
      stateRef.current.mouseY = -((e.clientY - rect.top) / H - 0.5) * 2;
      if (dragRef.dragging) {
        dragRef.totalDX += e.clientX - dragRef.lastX;
        dragRef.lastX = e.clientX;
      }
    };
    el.addEventListener("mousemove", onMouseMove);

    const dragRef = { dragging: false, startX: 0, lastX: 0, totalDX: 0 };
    const SWIPE_THRESHOLD = 60;

    const onPointerDown = (e) => {
      dragRef.dragging = true;
      dragRef.startX   = e.clientX;
      dragRef.lastX    = e.clientX;
      dragRef.totalDX  = 0;
      el.setPointerCapture(e.pointerId);
    };
    const onPointerUp = (e) => {
      if (!dragRef.dragging) return;
      dragRef.dragging = false;
      el.releasePointerCapture(e.pointerId);
      if (dragRef.totalDX < -SWIPE_THRESHOLD) onNavigate(1);
      else if (dragRef.totalDX > SWIPE_THRESHOLD) onNavigate(-1);
    };

    el.addEventListener("pointerdown",  onPointerDown);
    el.addEventListener("pointerup",    onPointerUp);
    el.addEventListener("pointercancel",onPointerUp);

    const onKeyDown = (e) => {
      if (e.key === "ArrowLeft")  onNavigate(-1);
      if (e.key === "ArrowRight") onNavigate(1);
    };
    el.setAttribute("tabindex", "0");
    el.addEventListener("keydown", onKeyDown);

    const raf = { id: null };
    const loop = () => {
      raf.id = requestAnimationFrame(loop);
      const s  = stateRef.current;
      s.t += 0.013;
      const ai = s.activeIdx;

      groups.forEach((g, i) => {
        const isA = i === ai;
        const isP = i === ((ai - 1 + groups.length) % groups.length);
        const isN = i === ((ai + 1) % groups.length);
        let tx = 20, tz = 0, tRY = 0, tS = 1;
        if (isA)      { tx = 0;  tz = 0;  tRY = 0;    tS = 1;    }
        else if (isP) { tx = -9; tz = -3; tRY = 0.55;  tS = 0.72; }
        else if (isN) { tx = 9;  tz = -3; tRY = -0.55; tS = 0.72; }
        g.position.x += (tx - g.position.x) * 0.07;
        g.position.z += (tz - g.position.z) * 0.07;
        g.rotation.y += (tRY - g.rotation.y) * 0.07;
        const cs = g.scale.x; g.scale.setScalar(cs + (tS - cs) * 0.07);
        if (isA) g.position.y += (Math.sin(s.t * 0.55) * 0.1 - g.position.y) * 0.05;
        else g.position.y += (0 - g.position.y) * 0.07;
        if (g.userData.orb?.material) {
          g.userData.orb.material.emissiveIntensity =
            isA ? 1.8 + Math.sin(s.t * 2.1 + i) * 0.6 : 0.4;
        }
      });

      accentPt.color.set(new THREE.Color(items[ai].color));
      rimPt.color.set(new THREE.Color(items[ai].color));
      camera.position.x += (s.mouseX * 0.5 - camera.position.x) * 0.04;
      camera.position.y += (s.mouseY * 0.25 + 0.2 - camera.position.y) * 0.04;
      camera.lookAt(0, 0, 0);
      pMesh.rotation.y += 0.0012;
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
      el.removeEventListener("click", onClick);
      el.removeEventListener("mousemove", onMouseMove);
      el.removeEventListener("pointerdown", onPointerDown);
      el.removeEventListener("pointerup", onPointerUp);
      el.removeEventListener("pointercancel", onPointerUp);
      el.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("resize", onResize);
      renderer.dispose();
      if (el.contains(renderer.domElement)) el.removeChild(renderer.domElement);
    };
  }, [items, onSelect, onNavigate]);

  return <div ref={mountRef} style={{ width: "100%", height: "100%", cursor: "grab", touchAction: "none" }} />;
}

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
      <div style={{ height: 96, position: "relative", background: "linear-gradient(135deg,#0a1020,#0d1830)", borderBottom: `1px solid ${T.border}` }}>
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
  const [activeIdx, setActiveIdx] = useState(0);
  const items = PROJECTS;

  const handleSelect = useCallback((project) => {
    if (setSelectedProject) setSelectedProject(project);
  }, [setSelectedProject]);

  return (
    <div style={{ fontFamily: "'Inter',system-ui,sans-serif", background: T.bg, minHeight: "100vh", color: T.txt }}>
      {/* ── HERO ── */}
      <div style={{ padding: "60px 32px 0", borderBottom: `1px solid ${T.border}`, position: "relative" }}>
        <h1 style={{ fontSize: "3rem", fontWeight: 700, margin: "0 0 40px" }}>Featured work</h1>
        <div style={{ height: 420, width: "100%", borderTop: `1px solid ${T.border}` }}>
          <CardSpotlight items={items} activeIdx={activeIdx} onSelect={handleSelect} onNavigate={(dir) => setActiveIdx(i => (i + dir + items.length) % items.length)} />
        </div>
      </div>

      {/* ── GRID ── */}
      <div style={{ padding: "5rem 2.5rem", maxWidth: "76rem", margin: "0 auto" }}>
        <h2 style={{ fontSize: "2.4rem", fontWeight: 700, marginBottom: "2.5rem" }}>All projects</h2>
        <div style={{ display: "grid", gap: "1rem", gridTemplateColumns: "repeat(auto-fill,minmax(270px,1fr))" }}>
          {items.map((p, i) => (
            <ProjectCard key={p.id} project={p} onSelect={(p) => setActiveIdx(i)} />
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