import { useEffect, useRef } from "react";
import * as THREE from "three";
import Reveal from "./Reveal";

// ═══════════════════════════════════════════════════════════════
//  FULL-SCREEN 3-D DESK HERO
// ═══════════════════════════════════════════════════════════════
function DeskHero() {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    let W = el.clientWidth, H = el.clientHeight;
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(W, H);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.08;
    el.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#12080d");
    scene.fog = new THREE.FogExp2("#12080d", 0.045);

    const camera = new THREE.PerspectiveCamera(42, W / H, 0.1, 60);
    camera.position.set(5, 4, 6);
    camera.lookAt(0, 1.5, 0);

    scene.add(new THREE.AmbientLight("#ffe8c0", 0.9));
    const sun = new THREE.DirectionalLight("#fff8e8", 3.2);
    sun.position.set(6, 10, 7); sun.castShadow = true;
    sun.shadow.mapSize.set(1024,1024); sun.shadow.bias = -0.002; scene.add(sun);
    const lamp = new THREE.PointLight("#ffb347", 8, 7);
    lamp.position.set(-1.4, 4.1, -0.9); lamp.castShadow = true; scene.add(lamp);
    const screen = new THREE.PointLight("#9de4f8", 3.5, 5);
    screen.position.set(0, 3.2, -0.8); scene.add(screen);
    const led = new THREE.PointLight("#f4a55a", 2.5, 5);
    led.position.set(0, 2.1, -1.5); scene.add(led);

    const mat = c => new THREE.MeshStandardMaterial({ color: c, roughness: 0.72, metalness: 0.06 });
    const bx = (w,h,d,c,x,y,z,rx=0,ry=0,rz=0) => {
      const m = new THREE.Mesh(new THREE.BoxGeometry(w,h,d), mat(c));
      m.position.set(x,y,z); m.rotation.set(rx,ry,rz);
      m.castShadow = true; m.receiveShadow = true; scene.add(m); return m;
    };
    const cy = (rt,rb,h,c,x,y,z,seg=18) => {
      const m = new THREE.Mesh(new THREE.CylinderGeometry(rt,rb,h,seg), mat(c));
      m.position.set(x,y,z); m.castShadow = true; m.receiveShadow = true; scene.add(m); return m;
    };

    bx(20,0.12,20,"#2a1a0e",0,-0.06,0);
    bx(20,14,0.2,"#1a0c08",0,7,-5.5);
    bx(6,0.18,2.8,"#7a4a26",0,1.82,0);
    [[-2.6,-1.1],[-2.6,1.1],[2.6,-1.1],[2.6,1.1]].forEach(([x,z])=>bx(0.14,1.82,0.14,"#4a2c14",x,0.91,z));
    bx(1.3,1.6,2.5,"#4a2c14",2.5,1.0,0);
    bx(3.0,1.85,0.1,"#0f172a",0,3.72,-1.25);
    bx(2.78,1.65,0.06,"#9de4f8",0,3.72,-1.21);
    bx(0.12,0.65,0.12,"#374151",0,2.64,-1.25);
    bx(0.85,0.07,0.5,"#374151",0,2.35,-1.25);
    ["#22d3ee","#f4a55a","#a3e635","#f472b6","#94a3b8"].forEach((c,i)=>
      bx(0.4+i*0.18,0.05,0.02,c,-0.75+i*0.48,3.82-i*0.22,-1.19));
    bx(1.8,1.1,0.08,"#0f172a",-1.75,3.15,-1.22,0,0.18,0);
    bx(1.62,0.96,0.05,"#9de4f8",-1.75,3.15,-1.19,0,0.18,0);
    bx(2.0,0.07,0.72,"#1e293b",0,2.22,-0.65);
    for(let i=-4;i<=4;i++) for(let j=-1;j<=1;j++)
      bx(0.18,0.05,0.18,"#2d3f55",i*0.22,2.255,-0.65+j*0.18);
    bx(0.36,0.1,0.55,"#1e293b",1.85,2.24,-0.45);
    bx(6,0.05,0.06,"#f4a55a",0,2.23,-1.6);
    cy(0.06,0.06,1.4,"#9a8a7a",-1.95,2.93,-1.35);
    bx(0.06,0.52,0.06,"#9a8a7a",-1.95,3.77,-1.35,0.44,0,0);
    cy(0.2,0.28,0.42,"#fdf0cc",-1.72,4.04,-1.14,8);
    cy(0.2,0.2,0.06,"#9a8a7a",-1.95,2.26,-1.35);
    cy(0.19,0.15,0.38,"#b45309",-2.6,2.2,-1.35);
    cy(0.15,0.13,0.32,"#581c87",-2.6,2.37,-1.35);
    bx(0.08,0.2,0.08,"#b45309",-2.38,2.12,-1.35);
    cy(0.14,0.12,0.28,"#c07830",-3.1,2.2,-1.45);
    cy(0.04,0.04,0.38,"#2d8a48",-3.1,2.53,-1.45);
    bx(0.3,0.06,0.3,"#5ecb7a",-3.1,2.77,-1.45);
    bx(0.2,0.06,0.2,"#5ecb7a",-2.92,2.67,-1.35,0,0,0.3);
    bx(0.2,0.06,0.2,"#5ecb7a",-3.28,2.65,-1.35,0,0,-0.3);
    [[-0.7,1.5],[-0.7,3.3],[1.7,1.5],[1.7,3.3]].forEach(([x,z])=>bx(0.12,1.55,0.12,"#292524",x,0.77,z));
    bx(1.75,0.15,1.75,"#1c1917",0.5,1.61,2.4);
    bx(1.62,0.13,1.62,"#e8922a",0.5,1.74,2.4);
    bx(1.75,1.5,0.14,"#1c1917",0.5,2.5,1.5);
    bx(1.62,1.38,0.08,"#e8922a",0.5,2.46,1.49);
    ["#dc2626","#2563eb","#16a34a"].forEach((c,i)=>bx(0.2,0.64,2.0,c,1.6+i*0.22,2.5,0));
    bx(0.3,0.28,0.04,"#fbbf24",-0.8,2.22,-1.42);
    bx(0.28,0.26,0.04,"#f472b6",-0.48,2.22,-1.42);
    bx(6,0.03,4.5,"#8b3a2a",0,0.01,1.5);

    let t = 0, mouseX = 0, mouseY = 0;
    const onMM = e => {
      mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
      mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener("mousemove", onMM);

    const raf = { id: null };
    const loop = () => {
      raf.id = requestAnimationFrame(loop);
      t += 0.005;
      const r = 7.5, base = t;
      const tx = Math.sin(base) * r + mouseX * 0.4;
      const ty = 4.2 + mouseY * 0.3;
      const tz = Math.cos(base) * r;
      camera.position.x += (tx - camera.position.x) * 0.025;
      camera.position.y += (ty - camera.position.y) * 0.025;
      camera.position.z += (tz - camera.position.z) * 0.025;
      camera.lookAt(0, 1.6, 0);
      lamp.intensity = 7 + Math.sin(t * 3) * 0.5;
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
      window.removeEventListener("mousemove", onMM);
      window.removeEventListener("resize", onResize);
      renderer.dispose();
      if (el.contains(renderer.domElement)) el.removeChild(renderer.domElement);
    };
  }, []);
  return <div ref={ref} style={{ width:"100%", height:"100%" }} />;
}

// ═══════════════════════════════════════════════════════════════
//  ABOUT PAGE — updated with real resume data
// ═══════════════════════════════════════════════════════════════
const JOURNEY = [
  {
    icon:"🔨", title:"The Builder", color:"#f97316",
    text:"Started with C/C++ and HTML — got hooked on how code becomes something real. Never stopped building since.",
  },
  {
    icon:"🚀", title:"The Full-Stack Dev", color:"#7c3aed",
    text:"Shipped production MERN apps — from a clothing exchange platform to an institutional CSC website used by real students.",
  },
  {
    icon:"🛡️", title:"The Club Head", color:"#0ea5e9",
    text:"Leading NIT Jalandhar's Cyber Security Club — running CTFs, workshops, and managing the official web platform.",
  },
  {
    icon:"🤖", title:"The AI Builder", color:"#10b981",
    text:"Diving deep into LangChain, RAG, and local LLMs — built a privacy-first AI code assistant using Ollama and FAISS.",
  },
];

const STACK = ["React.js","Node.js","Express","MongoDB","Python","LangChain","FastAPI","C/C++","SQL","TailwindCSS","Git","JWT"];

export default function About() {
  return (
    <div style={{ fontFamily:"'Inter',system-ui,sans-serif", background:"#0d0a08", minHeight:"100vh" }}>
      <style>{`
        @keyframes fadeUp{from{opacity:0;transform:translateY(22px)}to{opacity:1;transform:translateY(0)}}
        @keyframes blink{0%,100%{opacity:1}50%{opacity:0}}
        @keyframes pulse{0%,100%{opacity:0.5}50%{opacity:1}}
      `}</style>

      {/* ── HERO ────────────────────────────── */}
      <div style={{ position:"relative", height:"100vh", minHeight:560, overflow:"hidden" }}>
        <div style={{ position:"absolute", inset:0 }}><DeskHero /></div>
        <div style={{ position:"absolute", inset:0, background:"linear-gradient(to bottom, rgba(13,10,8,0.15) 0%, rgba(13,10,8,0.0) 40%, rgba(13,10,8,0.75) 85%, rgba(13,10,8,1) 100%)", pointerEvents:"none" }} />
        <div style={{ position:"absolute", bottom:60, left:0, right:0, textAlign:"center", animation:"fadeUp 0.8s ease both", pointerEvents:"none" }}>
          <span style={{ fontSize:"0.68rem",fontWeight:600,letterSpacing:"0.2em",textTransform:"uppercase",color:"#f97316",display:"block",marginBottom:"0.5rem" }}>Portfolio · About</span>
          <h1 style={{ color:"rgba(255,235,200,0.95)", fontSize:"clamp(2.2rem,5vw,3.8rem)", fontWeight:900, letterSpacing:"-0.04em", margin:"0 0 0.5rem" }}>
            Hi, I'm Kritika
          </h1>
          <p style={{ color:"rgba(255,200,130,0.5)", fontSize:"1rem", margin:0, letterSpacing:"0.04em" }}>
            Full-Stack Developer · Cyber Security Club Head · AI Builder
          </p>
        </div>
        <div style={{ position:"absolute", bottom:22, left:"50%", transform:"translateX(-50%)", display:"flex", flexDirection:"column", alignItems:"center", gap:5, animation:"pulse 2s ease infinite" }}>
          <div style={{ width:1, height:28, background:"rgba(249,115,22,0.4)" }} />
          <span style={{ color:"rgba(249,115,22,0.4)", fontSize:"0.65rem", letterSpacing:"0.18em", textTransform:"uppercase" }}>scroll</span>
        </div>
      </div>

      {/* ── WHO I AM ──────────────────────────── */}
      <div style={{ background:"#FFF8EF", padding:"5rem 2.5rem" }}>
        <div style={{ maxWidth:"68rem", margin:"0 auto" }}>
          <Reveal delay={0}>
            <div style={{ display:"grid", gap:"2rem", gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))", alignItems:"start" }}>
              <div>
                <span style={{ fontSize:"0.68rem",fontWeight:600,letterSpacing:"0.2em",textTransform:"uppercase",color:"#f97316",display:"block",marginBottom:"0.75rem" }}>Who I Am</span>
                <h2 style={{ fontSize:"clamp(1.8rem,3.5vw,2.6rem)", fontWeight:900, color:"#78350f", letterSpacing:"-0.03em", margin:"0 0 1.25rem" }}>
                  Developer, Leader<br/>& AI Enthusiast
                </h2>
                <p style={{ color:"#6b7280", lineHeight:1.85, fontSize:"1rem", marginBottom:"1rem" }}>
                  I'm Kritika — a B.Tech CSE student at NIT Jalandhar with a CGPA of 8.7. I build full-stack web apps, lead the Cyber Security Club, and explore AI systems that solve real problems.
                </p>
                <p style={{ color:"#6b7280", lineHeight:1.85, fontSize:"1rem", marginBottom:"1.75rem" }}>
                  From MERN-stack platforms to LangChain-powered RAG tools — I enjoy turning ideas into working products and growing the tech community around me.
                </p>
                <div style={{ display:"flex", flexWrap:"wrap", gap:"0.5rem" }}>
                  {STACK.map(s => (
                    <span key={s} style={{ background:"#ffedd5", color:"#92400e", border:"1px solid rgba(251,191,36,0.3)", borderRadius:999, padding:"5px 14px", fontSize:"0.8rem", fontWeight:600 }}>{s}</span>
                  ))}
                </div>
              </div>

              <div style={{ display:"flex", flexDirection:"column", gap:"1rem" }}>
                {[
                  { num:"8.7",  label:"CGPA at NIT Jalandhar",   color:"#f97316" },
                  { num:"5+",   label:"Projects shipped",         color:"#7c3aed" },
                  { num:"200+", label:"Students reached via CSC", color:"#0ea5e9" },
                  { num:"∞",    label:"Things still to learn",    color:"#10b981" },
                ].map(s => (
                  <div key={s.label} style={{ background:"#fff", borderRadius:"1.25rem", padding:"1.25rem 1.5rem", boxShadow:"0 2px 16px rgba(120,53,15,0.07)", border:"1px solid rgba(251,191,36,0.14)", display:"flex", alignItems:"center", gap:"1.25rem" }}>
                    <span style={{ fontSize:"2rem", fontWeight:900, color:s.color, letterSpacing:"-0.04em", minWidth:52, lineHeight:1 }}>{s.num}</span>
                    <span style={{ color:"#6b7280", fontSize:"0.92rem", fontWeight:500 }}>{s.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </div>

      {/* ── JOURNEY ──────────────────────────── */}
      <div style={{ background:"#0d0a08", padding:"5rem 2.5rem" }}>
        <div style={{ maxWidth:"68rem", margin:"0 auto" }}>
          <Reveal delay={0}>
            <span style={{ fontSize:"0.68rem",fontWeight:600,letterSpacing:"0.2em",textTransform:"uppercase",color:"#f97316",display:"block",marginBottom:"0.5rem" }}>My Journey</span>
            <h2 style={{ fontSize:"clamp(1.8rem,3.5vw,2.6rem)", fontWeight:900, color:"rgba(255,235,200,0.9)", letterSpacing:"-0.03em", margin:"0 0 3rem" }}>
              How I got here
            </h2>
          </Reveal>
          <div style={{ display:"grid", gap:"1.25rem", gridTemplateColumns:"repeat(auto-fit,minmax(240px,1fr))" }}>
            {JOURNEY.map((item, i) => (
              <Reveal key={item.title} delay={0.08 + i * 0.1}>
                <div style={{ background:"rgba(255,255,255,0.04)", border:`1px solid ${item.color}28`, borderRadius:"1.5rem", padding:"1.75rem", transition:"transform 0.3s, box-shadow 0.3s, background 0.3s" }}
                  onMouseEnter={e=>{ e.currentTarget.style.transform="translateY(-6px)"; e.currentTarget.style.background=`${item.color}10`; e.currentTarget.style.boxShadow=`0 16px 40px ${item.color}20`; }}
                  onMouseLeave={e=>{ e.currentTarget.style.transform=""; e.currentTarget.style.background="rgba(255,255,255,0.04)"; e.currentTarget.style.boxShadow=""; }}
                >
                  <div style={{ fontSize:"2rem", marginBottom:"1rem" }}>{item.icon}</div>
                  <h3 style={{ fontSize:"1.05rem", fontWeight:700, color:item.color, marginBottom:"0.6rem" }}>{item.title}</h3>
                  <p style={{ color:"rgba(200,170,130,0.65)", lineHeight:1.78, fontSize:"0.9rem", margin:0 }}>{item.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>

      {/* ── TERMINAL BIO ─────────────────────── */}
      <div style={{ background:"#FFF8EF", padding:"5rem 2.5rem" }}>
        <div style={{ maxWidth:"56rem", margin:"0 auto" }}>
          <Reveal delay={0}>
            <div style={{ borderRadius:"1.5rem", overflow:"hidden", boxShadow:"0 8px 40px rgba(0,0,0,0.18)" }}>
              <div style={{ background:"#1c1c1e", padding:"0.75rem 1.1rem", display:"flex", alignItems:"center", gap:7 }}>
                {["#ff5f57","#febc2e","#28c840"].map(c=><span key={c} style={{ width:11,height:11,borderRadius:"50%",background:c,display:"inline-block" }}/>)}
                <span style={{ marginLeft:8, color:"#6b7280", fontSize:"0.72rem", fontFamily:"monospace" }}>kritika@nitj ~</span>
              </div>
              <div style={{ background:"#0d0d0f", padding:"2rem", fontFamily:"monospace", fontSize:"0.9rem", lineHeight:2.1, display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))", gap:"0 3rem" }}>
                <div>
                  <p style={{color:"#f97316",margin:0}}>&gt; current_role</p>
                  <p style={{color:"#4ade80",margin:"0.2rem 0 1rem"}}>Cyber Security Club Head — NITJ</p>
                  <p style={{color:"#f97316",margin:0}}>&gt; building_now</p>
                  <p style={{color:"#4ade80",margin:"0.2rem 0 1rem"}}>TPO Portal · AI Code Assistant<span style={{animation:"blink 1s step-end infinite"}}>_</span></p>
                </div>
                <div>
                  <p style={{color:"#f97316",margin:0}}>&gt; learning</p>
                  <p style={{color:"#4ade80",margin:"0.2rem 0 1rem"}}>LangChain · RAG · Ollama · FAISS</p>
                  <p style={{color:"#f97316",margin:0}}>&gt; goal</p>
                  <p style={{color:"#ffffff",margin:"0.2rem 0 1rem"}}>AI tools that actually help people.</p>
                  <p style={{color:"#374151",margin:0}}>// always building</p>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </div>
  );
}
