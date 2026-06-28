import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import Reveal from "./Reveal";
import { T, section, h2, eyebrow } from "./tokens";

// ── 3-D AI Brain / neural network scene ─────────────────────────
function NeuralScene() {
  const mountRef = useRef(null);
  useEffect(() => {
    const el = mountRef.current;
    const W = el.clientWidth, H = el.clientHeight;
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(W, H);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    el.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(52, W / H, 0.1, 80);
    camera.position.set(0, 0, 11);

    scene.add(new THREE.AmbientLight("#ffffff", 0.6));
    const dl = new THREE.DirectionalLight("#fff8e8", 1.8);
    dl.position.set(5, 8, 6); scene.add(dl);

    // Node positions — 3 layers
    const layers = [
      [[-2.5, 1.8], [-2.5, 0], [-2.5, -1.8]],
      [[-0.2, 2.4], [-0.2, 0.8], [-0.2, -0.8], [-0.2, -2.4]],
      [[2.2, 1.4], [2.2, -1.4]],
    ];
    const nodeColors = ["#f97316", "#7c3aed", "#0ea5e9"];
    const nodeMeshes = [];

    layers.forEach((layer, li) => {
      layer.forEach(([x, y]) => {
        const mat = new THREE.MeshStandardMaterial({
          color: nodeColors[li], roughness: 0.3, metalness: 0.5,
          emissive: nodeColors[li], emissiveIntensity: 0.15,
        });
        const m = new THREE.Mesh(new THREE.SphereGeometry(0.28, 20, 20), mat);
        m.position.set(x, y, 0);
        m.userData = { baseEmissive: 0.15, phase: Math.random() * Math.PI * 2 };
        scene.add(m);
        nodeMeshes.push(m);
      });
    });

    // Edges between layers
    const lineMat = new THREE.LineBasicMaterial({ color: "#f97316", transparent: true, opacity: 0.18 });
    layers.forEach((layerA, li) => {
      if (li >= layers.length - 1) return;
      const layerB = layers[li + 1];
      layerA.forEach(([ax, ay]) => {
        layerB.forEach(([bx, by]) => {
          const geo = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(ax, ay, 0),
            new THREE.Vector3(bx, by, 0),
          ]);
          scene.add(new THREE.Line(geo, lineMat));
        });
      });
    });

    // Floating particles
    const pGeo = new THREE.BufferGeometry();
    const pVerts = [];
    for (let i = 0; i < 80; i++)
      pVerts.push((Math.random() - 0.5) * 12, (Math.random() - 0.5) * 8, (Math.random() - 0.5) * 4);
    pGeo.setAttribute("position", new THREE.Float32BufferAttribute(pVerts, 3));
    const pts = new THREE.Points(pGeo, new THREE.PointsMaterial({
      color: "#7c3aed", size: 0.05, transparent: true, opacity: 0.45,
    }));
    scene.add(pts);

    let t = 0;
    const raf = { id: null };
    const loop = () => {
      raf.id = requestAnimationFrame(loop);
      t += 0.014;
      nodeMeshes.forEach(m => {
        const pulse = 0.15 + Math.abs(Math.sin(t * 1.2 + m.userData.phase)) * 0.45;
        m.material.emissiveIntensity = pulse;
        m.scale.setScalar(1 + Math.sin(t + m.userData.phase) * 0.06);
      });
      pts.rotation.y += 0.004;
      camera.position.x = Math.sin(t * 0.25) * 1.5;
      camera.position.y = Math.cos(t * 0.18) * 0.6;
      camera.lookAt(0, 0, 0);
      renderer.render(scene, camera);
    };
    loop();

    const onResize = () => {
      const nw = el.clientWidth, nh = el.clientHeight;
      camera.aspect = nw / nh; camera.updateProjectionMatrix();
      renderer.setSize(nw, nh);
    };
    window.addEventListener("resize", onResize);
    return () => {
      cancelAnimationFrame(raf.id);
      window.removeEventListener("resize", onResize);
      renderer.dispose();
      if (el.contains(renderer.domElement)) el.removeChild(renderer.domElement);
    };
  }, []);
  return <div ref={mountRef} style={{ width: "100%", height: "100%", borderRadius: "1.5rem", overflow: "hidden" }} />;
}

// ── Typewriter hook ──────────────────────────────────────────────
function useTypewriter(lines, speed = 38) {
  const [displayed, setDisplayed] = useState([]);
  const [lineIdx, setLineIdx] = useState(0);
  const [charIdx, setCharIdx] = useState(0);

  useEffect(() => {
    if (lineIdx >= lines.length) return;
    const current = lines[lineIdx];
    if (charIdx < current.length) {
      const t = setTimeout(() => {
        setDisplayed(prev => {
          const next = [...prev];
          if (!next[lineIdx]) next[lineIdx] = { ...current, text: "" };
          next[lineIdx] = { ...current, text: current.text.slice(0, charIdx + 1) };
          return next;
        });
        setCharIdx(c => c + 1);
      }, speed);
      return () => clearTimeout(t);
    } else {
      const t = setTimeout(() => { setLineIdx(l => l + 1); setCharIdx(0); }, 320);
      return () => clearTimeout(t);
    }
  }, [lineIdx, charIdx, lines, speed]);

  return displayed;
}

const termLines = [
  { text: "> current_focus",         color: "#f97316",  indent: false },
  { text: "Building TripWise AI Planner...", color: "#4ade80", indent: true },
  { text: "> stack",                 color: "#f97316",  indent: false },
  { text: "LangChain · RAG · Ollama · OpenAI", color: "#4ade80", indent: true },
  { text: "> learning",              color: "#f97316",  indent: false },
  { text: "Prompt Engineering · Vector DBs · Agents", color: "#4ade80", indent: true },
  { text: "> goal",                  color: "#f97316",  indent: false },
  { text: "Build AI tools that actually help people.", color: "#ffffff", indent: true },
  { text: "// always learning, always building", color: "#374151", indent: false },
];

export default function AISection() {
  const displayed = useTypewriter(termLines, 32);
  const endRef = useRef(null);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" }); }, [displayed]);

  return (
    <section style={{ ...section, minHeight: "auto", background: "#FFF3E0", paddingBottom: "6rem" }}>
      <div style={{ maxWidth: "64rem", margin: "0 auto" }}>

        <Reveal delay={0}>
          <span style={eyebrow}>Portfolio · AI</span>
          <h2 style={h2}>AI Corner</h2>
          <p style={{ color: T.muted, margin: "0.5rem 0 3rem" }}>
            What I'm building and exploring in the AI space right now.
          </p>
        </Reveal>

        {/* Neural network banner */}
        <Reveal delay={0.1}>
          <div style={{
            height: 240, marginBottom: "1.75rem", borderRadius: "1.5rem", overflow: "hidden",
            background: "#0a0a12", boxShadow: "0 4px 32px rgba(0,0,0,0.35)",
          }}>
            <NeuralScene />
          </div>
        </Reveal>

        {/* Typewriter terminal */}
        <Reveal delay={0.2}>
          <div style={{ borderRadius: "1.5rem", overflow: "hidden", boxShadow: "0 4px 28px rgba(0,0,0,0.22)" }}>
            {/* Title bar */}
            <div style={{
              background: "#1c1c1e", padding: "0.75rem 1.1rem",
              display: "flex", alignItems: "center", gap: "0.45rem",
            }}>
              {["#ff5f57", "#febc2e", "#28c840"].map(c => (
                <span key={c} style={{ width: 11, height: 11, borderRadius: "50%", background: c, display: "inline-block" }} />
              ))}
              <span style={{ marginLeft: "0.75rem", color: "#6b7280", fontSize: "0.72rem", fontFamily: "monospace" }}>
                kritika@ai ~ zsh
              </span>
            </div>
            {/* Terminal body */}
            <div style={{
              background: "#0d0d0f", padding: "2rem 2.25rem",
              fontFamily: "monospace", fontSize: "0.95rem", lineHeight: 2.0,
              minHeight: 280,
            }}>
              {displayed.map((line, i) => (
                <p key={i} style={{
                  margin: 0,
                  marginTop: line && !line.indent && i > 0 ? "1rem" : "0.1rem",
                  color: line?.color || "#4ade80",
                  paddingLeft: line?.indent ? "1rem" : 0,
                }}>
                  {line?.text || ""}
                  {i === displayed.length - 1 && (
                    <span style={{ display: "inline-block", width: 10, height: "1em", background: "#4ade80", marginLeft: 2, verticalAlign: "text-bottom", animation: "blink 1s step-end infinite" }} />
                  )}
                </p>
              ))}
              <div ref={endRef} />
            </div>
          </div>
        </Reveal>

        {/* AI focus cards */}
        <div style={{ display: "grid", gap: "1.25rem", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", marginTop: "1.75rem" }}>
          {[
            { icon: "🧠", title: "LangChain",      text: "Building chains and agents for complex multi-step reasoning." },
            { icon: "📚", title: "RAG Systems",     text: "Retrieval-augmented generation for grounded, accurate answers." },
            { icon: "🔮", title: "LLMs",            text: "Exploring GPT-4, Claude, Llama, and local models via Ollama." },
            { icon: "✍️", title: "Prompt Engineering", text: "Crafting prompts that get consistent, structured AI outputs." },
          ].map((item, i) => (
            <Reveal key={item.title} delay={0.1 + i * 0.08}>
              <div style={{
                background: "#fff", borderRadius: "1.5rem",
                boxShadow: "0 2px 20px rgba(180,83,9,0.07)",
                border: "1px solid rgba(251,191,36,0.12)",
                padding: "1.5rem",
                transition: "transform 0.3s, box-shadow 0.3s",
              }}
                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-5px)"; e.currentTarget.style.boxShadow = "0 10px 36px rgba(180,83,9,0.14)"; }}
                onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = "0 2px 20px rgba(180,83,9,0.07)"; }}
              >
                <div style={{ fontSize: "1.5rem", marginBottom: "0.6rem" }}>{item.icon}</div>
                <h3 style={{ fontSize: "0.95rem", fontWeight: 700, color: "#f97316", marginBottom: "0.5rem" }}>{item.title}</h3>
                <p style={{ color: T.body, lineHeight: 1.72, fontSize: "0.85rem", margin: 0 }}>{item.text}</p>
              </div>
            </Reveal>
          ))}
        </div>

      </div>
      <style>{`@keyframes blink{0%,100%{opacity:1}50%{opacity:0}}`}</style>
    </section>
  );
}
