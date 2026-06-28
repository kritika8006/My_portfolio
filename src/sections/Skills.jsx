import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import Reveal from "./Reveal";
import { eyebrow } from "./tokens";

// ═══════════════════════════════════════════════════════════════
//  FULL-SCREEN 3-D SKILL GALAXY HERO
//  Labelled orbs orbit in rings — one ring per skill category
// ═══════════════════════════════════════════════════════════════
function SkillGalaxy() {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    let W = el.clientWidth, H = el.clientHeight;
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(W, H);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    el.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#080610");
    scene.fog = new THREE.FogExp2("#080610", 0.032);

    const camera = new THREE.PerspectiveCamera(50, W / H, 0.1, 80);
    camera.position.set(0, 4, 14);
    camera.lookAt(0, 0, 0);

    scene.add(new THREE.AmbientLight("#c8c0ff", 0.7));
    const dl = new THREE.DirectionalLight("#ffffff", 2.0);
    dl.position.set(6, 10, 6); scene.add(dl);

    // Ring colours
    const rings = [
      { color:"#f97316", radius:2.2, count:5, speed:0.38, tilt:0.1 },
      { color:"#7c3aed", radius:3.8, count:2, speed:-0.28, tilt:0.55 },
      { color:"#0ea5e9", radius:5.0, count:2, speed:0.22, tilt:-0.4 },
      { color:"#10b981", radius:6.3, count:3, speed:-0.16, tilt:0.7 },
      { color:"#f59e0b", radius:7.5, count:3, speed:0.12, tilt:-0.2 },
    ];

    const orbs = [];
    rings.forEach(ring => {
      for (let i = 0; i < ring.count; i++) {
        const angle = (i / ring.count) * Math.PI * 2;
        const mat = new THREE.MeshStandardMaterial({
          color: ring.color, roughness: 0.25, metalness: 0.55,
          emissive: ring.color, emissiveIntensity: 0.2,
        });
        const size = 0.28 + Math.random() * 0.18;
        const m = new THREE.Mesh(new THREE.SphereGeometry(size, 20, 20), mat);
        m.userData = { ring, baseAngle: angle, phase: Math.random() * Math.PI * 2 };
        scene.add(m);
        orbs.push(m);

        // Point light companion
        const pt = new THREE.PointLight(ring.color, 3.5, 3.5);
        m.add(pt);
      }
    });

    // Ring orbit lines
    rings.forEach(ring => {
      const pts = [];
      for (let i = 0; i <= 80; i++) {
        const a = (i / 80) * Math.PI * 2;
        pts.push(new THREE.Vector3(Math.cos(a) * ring.radius, Math.sin(a * 0) * 0, Math.sin(a) * ring.radius));
      }
      const geo = new THREE.BufferGeometry().setFromPoints(pts);
      const line = new THREE.Line(geo, new THREE.LineBasicMaterial({ color: ring.color, transparent: true, opacity: 0.08 }));
      line.rotation.x = ring.tilt;
      scene.add(line);
    });

    // Star field
    const sGeo = new THREE.BufferGeometry();
    const sv = [];
    for (let i = 0; i < 500; i++) sv.push((Math.random()-0.5)*60,(Math.random()-0.5)*40,(Math.random()-0.5)*40);
    sGeo.setAttribute("position", new THREE.Float32BufferAttribute(sv,3));
    scene.add(new THREE.Points(sGeo, new THREE.PointsMaterial({ color:"#ffffff", size:0.04, transparent:true, opacity:0.55 })));

    // Centre core
    const core = new THREE.Mesh(
      new THREE.SphereGeometry(0.55, 28, 28),
      new THREE.MeshStandardMaterial({ color:"#f97316", emissive:"#f97316", emissiveIntensity:1.2, roughness:0.2, metalness:0.6 })
    );
    scene.add(core);
    scene.add(new THREE.PointLight("#f97316", 12, 6));

    let t = 0, mx = 0, my = 0;
    const onMM = e => { mx=(e.clientX/window.innerWidth-0.5)*2; my=(e.clientY/window.innerHeight-0.5)*2; };
    window.addEventListener("mousemove", onMM);

    const raf = { id:null };
    const loop = () => {
      raf.id = requestAnimationFrame(loop);
      t += 0.009;
      orbs.forEach(o => {
        const { ring, baseAngle, phase } = o.userData;
        const a = baseAngle + t * ring.speed;
        const r = ring.radius;
        const tilt = ring.tilt;
        o.position.set(
          Math.cos(a) * r,
          Math.sin(a) * r * Math.sin(tilt) + Math.sin(t * 0.5 + phase) * 0.15,
          Math.sin(a) * r * Math.cos(tilt)
        );
        o.rotation.y += 0.02;
        o.material.emissiveIntensity = 0.18 + Math.abs(Math.sin(t * 1.5 + phase)) * 0.3;
      });

      core.rotation.y += 0.008;
      core.material.emissiveIntensity = 1.0 + Math.sin(t * 2) * 0.3;

      camera.position.x += (mx * 2.5 - camera.position.x) * 0.03;
      camera.position.y += (4 - my * 1.5 - camera.position.y) * 0.03;
      camera.lookAt(0, 0, 0);
      renderer.render(scene, camera);
    };
    loop();

    const onResize = () => { W=el.clientWidth;H=el.clientHeight;camera.aspect=W/H;camera.updateProjectionMatrix();renderer.setSize(W,H); };
    window.addEventListener("resize", onResize);
    return () => {
      cancelAnimationFrame(raf.id);
      window.removeEventListener("mousemove", onMM);
      window.removeEventListener("resize", onResize);
      renderer.dispose();
      if (el.contains(renderer.domElement)) el.removeChild(renderer.domElement);
    };
  }, []);
  return <div ref={ref} style={{ width:"100%", height:"100%" }} />;
}

// ═══════════════════════════════════════════════════════════════
//  SKILLS DATA
// ═══════════════════════════════════════════════════════════════
const GROUPS = [
  { title:"Frontend",  color:"#f97316", icon:"🖼️", skills:["React","JavaScript","TypeScript","Tailwind CSS","HTML5","CSS3"] },
  { title:"Backend",   color:"#7c3aed", icon:"⚙️", skills:["Node.js","Express.js","REST APIs"] },
  { title:"Database",  color:"#0ea5e9", icon:"🗄️", skills:["MongoDB","MySQL","Mongoose"] },
  { title:"AI / ML",   color:"#10b981", icon:"🤖", skills:["LangChain","Ollama","Prompt Engineering","RAG","Vector DBs"] },
  { title:"Tools",     color:"#f59e0b", icon:"🔧", skills:["Git","GitHub","VS Code","Postman","Linux"] },
];

export default function Skills() {
  const [active, setActive] = useState(null);

  return (
    <div style={{ fontFamily:"'Inter',system-ui,sans-serif", background:"#0d0a08", minHeight:"100vh" }}>
      <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}@keyframes pulse{0%,100%{opacity:0.4}50%{opacity:1}}`}</style>

      {/* ── HERO: skill galaxy ────────────────── */}
      <div style={{ position:"relative", height:"100vh", minHeight:560, overflow:"hidden" }}>
        <div style={{ position:"absolute", inset:0 }}><SkillGalaxy /></div>
        <div style={{ position:"absolute", inset:0, background:"linear-gradient(to bottom,rgba(8,6,16,0.1) 0%,rgba(8,6,16,0) 35%,rgba(8,6,16,0.7) 80%,rgba(8,6,16,1) 100%)", pointerEvents:"none" }} />

        <div style={{ position:"absolute", bottom:60, left:0, right:0, textAlign:"center", animation:"fadeUp 0.8s ease both", pointerEvents:"none" }}>
          <span style={{ fontSize:"0.68rem",fontWeight:600,letterSpacing:"0.2em",textTransform:"uppercase",color:"#f97316",display:"block",marginBottom:"0.5rem" }}>Portfolio · Skills</span>
          <h1 style={{ color:"rgba(230,220,255,0.95)", fontSize:"clamp(2.2rem,5vw,3.8rem)", fontWeight:900, letterSpacing:"-0.04em", margin:"0 0 0.5rem" }}>Skills Galaxy</h1>
          <p style={{ color:"rgba(180,160,220,0.45)", fontSize:"0.95rem", margin:0 }}>Each orb is a skill category · Move your mouse to explore</p>
        </div>

        <div style={{ position:"absolute", bottom:22, left:"50%", transform:"translateX(-50%)", display:"flex", flexDirection:"column", alignItems:"center", gap:5, animation:"pulse 2s ease infinite" }}>
          <div style={{ width:1, height:28, background:"rgba(124,58,237,0.5)" }} />
          <span style={{ color:"rgba(124,58,237,0.5)", fontSize:"0.65rem", letterSpacing:"0.18em", textTransform:"uppercase" }}>scroll</span>
        </div>
      </div>

      {/* ── SKILL CARDS ───────────────────────── */}
      <div style={{ background:"#FFF8EF", padding:"5rem 2.5rem" }}>
        <div style={{ maxWidth:"72rem", margin:"0 auto" }}>
          <Reveal delay={0}>
            <span style={{ fontSize:"0.68rem",fontWeight:600,letterSpacing:"0.2em",textTransform:"uppercase",color:"#f97316",display:"block",marginBottom:"0.5rem" }}>Tech Stack</span>
            <h2 style={{ fontSize:"clamp(1.8rem,3.5vw,2.6rem)", fontWeight:900, color:"#78350f", letterSpacing:"-0.03em", margin:"0 0 0.6rem" }}>What I Work With</h2>
            <p style={{ color:"#92400e", opacity:0.55, marginBottom:"3rem", fontSize:"0.95rem" }}>Click a category to expand it</p>
          </Reveal>

          <div style={{ display:"flex", flexDirection:"column", gap:"0.85rem" }}>
            {GROUPS.map((g, i) => {
              const isOpen = active === g.title;
              return (
                <Reveal key={g.title} delay={0.06 * i}>
                  <div
                    onClick={() => setActive(isOpen ? null : g.title)}
                    style={{
                      background:"#fff", borderRadius:"1.25rem", overflow:"hidden",
                      boxShadow:"0 2px 16px rgba(120,53,15,0.07)",
                      border:`1px solid ${isOpen ? g.color+"55" : "rgba(251,191,36,0.14)"}`,
                      cursor:"pointer",
                      transition:"border-color 0.25s, box-shadow 0.25s",
                      ...(isOpen ? { boxShadow:`0 8px 32px ${g.color}20` } : {}),
                    }}
                  >
                    {/* Header row */}
                    <div style={{ display:"flex", alignItems:"center", gap:"1rem", padding:"1.25rem 1.5rem" }}>
                      <div style={{ width:44, height:44, borderRadius:"0.85rem", background:`${g.color}18`, border:`1.5px solid ${g.color}33`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:"1.3rem", flexShrink:0 }}>
                        {g.icon}
                      </div>
                      <div style={{ flex:1 }}>
                        <h3 style={{ fontSize:"1.05rem", fontWeight:700, color:"#78350f", margin:0 }}>{g.title}</h3>
                        <p style={{ color:"#9ca3af", fontSize:"0.8rem", margin:0 }}>{g.skills.length} skills</p>
                      </div>
                      <div style={{ width:28, height:28, borderRadius:"50%", background:`${g.color}15`, display:"flex", alignItems:"center", justifyContent:"center", color:g.color, fontSize:"1.1rem", fontWeight:700, transition:"transform 0.3s", transform:isOpen?"rotate(45deg)":"rotate(0deg)" }}>
                        +
                      </div>
                    </div>

                    {/* Expanded skills */}
                    <div style={{
                      maxHeight: isOpen ? 200 : 0, overflow:"hidden",
                      transition:"max-height 0.4s cubic-bezier(0.22,1,0.36,1)",
                    }}>
                      <div style={{ padding:"0 1.5rem 1.4rem", display:"flex", flexWrap:"wrap", gap:"0.5rem" }}>
                        {g.skills.map(s => (
                          <span key={s} style={{ background:`${g.color}15`, color:g.color, border:`1px solid ${g.color}33`, borderRadius:999, padding:"5px 14px", fontSize:"0.82rem", fontWeight:600 }}>
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── DARK PROFICIENCY BARS ─────────────── */}
      <div style={{ background:"#0d0a08", padding:"5rem 2.5rem" }}>
        <div style={{ maxWidth:"56rem", margin:"0 auto" }}>
          <Reveal delay={0}>
            <span style={{ fontSize:"0.68rem",fontWeight:600,letterSpacing:"0.2em",textTransform:"uppercase",color:"#f97316",display:"block",marginBottom:"0.5rem" }}>Proficiency</span>
            <h2 style={{ fontSize:"clamp(1.6rem,3vw,2.2rem)", fontWeight:900, color:"rgba(255,235,200,0.9)", letterSpacing:"-0.03em", margin:"0 0 2.5rem" }}>How deep I go</h2>
          </Reveal>
          {[
            { label:"React + JS", pct:88, color:"#f97316" },
            { label:"Node.js / Express", pct:80, color:"#7c3aed" },
            { label:"Python", pct:72, color:"#0ea5e9" },
            { label:"MongoDB / MySQL", pct:75, color:"#10b981" },
            { label:"LangChain / AI", pct:65, color:"#f59e0b" },
          ].map((b, i) => (
            <Reveal key={b.label} delay={0.08 * i}>
              <div style={{ marginBottom:"1.4rem" }}>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:"0.5rem" }}>
                  <span style={{ color:"rgba(220,190,140,0.8)", fontSize:"0.88rem", fontWeight:600 }}>{b.label}</span>
                  <span style={{ color:b.color, fontSize:"0.82rem", fontWeight:700 }}>{b.pct}%</span>
                </div>
                <div style={{ height:6, background:"rgba(255,255,255,0.06)", borderRadius:999, overflow:"hidden" }}>
                  <div style={{ height:"100%", width:`${b.pct}%`, background:`linear-gradient(90deg,${b.color},${b.color}88)`, borderRadius:999, boxShadow:`0 0 10px ${b.color}55`, transition:"width 1s cubic-bezier(0.22,1,0.36,1)" }} />
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>

    </div>
  );
}
