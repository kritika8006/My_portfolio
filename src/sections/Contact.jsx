import { useEffect, useRef } from "react";
import * as THREE from "three";
import Reveal from "./Reveal";
import { eyebrow } from "./tokens";

// ═══════════════════════════════════════════════════════════════
//  FULL-SCREEN 3-D ENVELOPE HERO
// ═══════════════════════════════════════════════════════════════
function EnvelopeHero() {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    let W = el.clientWidth, H = el.clientHeight;
    const renderer = new THREE.WebGLRenderer({ antialias:true });
    renderer.setSize(W,H); renderer.setPixelRatio(Math.min(window.devicePixelRatio,2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.1;
    renderer.shadowMap.enabled = true;
    el.appendChild(renderer.domElement);
    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#0a0610");
    scene.fog = new THREE.FogExp2("#0a0610", 0.038);
    const camera = new THREE.PerspectiveCamera(46, W/H, 0.1, 60);
    camera.position.set(0,1,10); camera.lookAt(0,0,0);

    scene.add(new THREE.AmbientLight("#c8d0ff", 0.7));
    const key = new THREE.DirectionalLight("#fff8f0", 3.0); key.position.set(5,8,6); key.castShadow=true; scene.add(key);
    const fill = new THREE.PointLight("#f97316", 7, 12); fill.position.set(-3,2,4); scene.add(fill);
    const rim  = new THREE.PointLight("#7c3aed", 5, 10); rim.position.set(3,-1,3); scene.add(rim);

    const mat = c => new THREE.MeshStandardMaterial({color:c,roughness:0.45,metalness:0.3});

    // ── Main envelope ──────────────────────────
    const env = new THREE.Group();
    const envBody = new THREE.Mesh(new THREE.BoxGeometry(3.8,2.4,0.14), mat("#fff8ef"));
    envBody.receiveShadow = true; envBody.castShadow = true;
    env.add(envBody);
    
    const mkTri = (pts, color) => {
      const g = new THREE.BufferGeometry();
      g.setAttribute("position", new THREE.Float32BufferAttribute(pts,3));
      g.computeVertexNormals();
      return new THREE.Mesh(g, mat(color));
    };
    env.add(mkTri([-1.9,-1.2,0.08, 0,0,0.08, 1.9,-1.2,0.08], "#f4a55a"));
    env.add(mkTri([-1.9,1.2,0.08,  0,0,0.08, 1.9,1.2,0.08],  "#e8922a"));
    env.add(mkTri([-1.9,-1.2,0.08,-1.9,1.2,0.08, 0,0,0.08],  "#fbbf24"));
    env.add(mkTri([1.9,-1.2,0.08,  0,0,0.08, 1.9,1.2,0.08],  "#fbbf24"));
    
    const seal = new THREE.Mesh(new THREE.CylinderGeometry(0.26,0.26,0.06,24), mat("#f97316"));
    seal.rotation.x=Math.PI/2; seal.position.set(0,0,0.1); env.add(seal);
    const sealPt = new THREE.PointLight("#f97316",4,3); seal.add(sealPt);
    env.position.set(0,0,0);
    scene.add(env);

    const minis = [0,1,2,3].map(i=>{
      const g = new THREE.Group();
      g.add(new THREE.Mesh(new THREE.BoxGeometry(0.9,0.56,0.07), mat("#fff8ef")));
      const s=new THREE.Mesh(new THREE.CylinderGeometry(0.07,0.07,0.04,16),mat("#f97316"));
      s.rotation.x=Math.PI/2; s.position.z=0.05; g.add(s);
      g.userData={r:4.5+i*0.4,speed:0.22+i*0.06,phase:(i/4)*Math.PI*2};
      scene.add(g); return g;
    });

    const sg=new THREE.BufferGeometry();
    const sv=[]; for(let i=0;i<400;i++) sv.push((Math.random()-0.5)*50,(Math.random()-0.5)*30,(Math.random()-0.5)*30-8);
    sg.setAttribute("position",new THREE.Float32BufferAttribute(sv,3));
    scene.add(new THREE.Points(sg,new THREE.PointsMaterial({color:"#c8c0ff",size:0.04,transparent:true,opacity:0.5})));

    let t=0,mx=0,my=0;
    const onMM=e=>{mx=(e.clientX/window.innerWidth-0.5)*2;my=(e.clientY/window.innerHeight-0.5)*2;};
    window.addEventListener("mousemove",onMM);
    const raf={id:null};
    const loop=()=>{
      raf.id=requestAnimationFrame(loop); t+=0.011;
      env.rotation.y=Math.sin(t*0.5)*0.35 + mx*0.12;
      env.position.y=Math.sin(t*0.7)*0.2 - my*0.1;
      minis.forEach(m=>{
        const a=m.userData.phase+t*m.userData.speed;
        m.position.set(Math.cos(a)*m.userData.r, Math.sin(t*0.5+m.userData.phase)*0.6, Math.sin(a)*m.userData.r*0.35);
        m.rotation.y=a+Math.PI/2;
      });
      fill.position.x=-3+mx; fill.position.y=2-my;
      camera.position.x+=(mx*0.8-camera.position.x)*0.03;
      camera.position.y+=(1-my*0.5-camera.position.y)*0.03;
      camera.lookAt(0,0,0);
      renderer.render(scene,camera);
    };
    loop();
    const onResize=()=>{W=el.clientWidth;H=el.clientHeight;camera.aspect=W/H;camera.updateProjectionMatrix();renderer.setSize(W,H);};
    window.addEventListener("resize",onResize);
    return()=>{cancelAnimationFrame(raf.id);window.removeEventListener("mousemove",onMM);window.removeEventListener("resize",onResize);renderer.dispose();if(el.contains(renderer.domElement))el.removeChild(renderer.domElement);};
  },[]);
  return <div ref={ref} style={{width:"100%",height:"100%"}}/>;
}

const LINKS = [
  { label:"GitHub",   href:"https://github.com/kritika8006",    icon:"⌨️", desc:"See my code & repositories",  color:"#f97316" },
  { label:"LinkedIn", href:"https://linkedin.com/in/kritika-joshi-nitj", icon:"💼", desc:"Let's connect professionally", color:"#7c3aed" },
  { label:"Email",    href:"mailto:kritikaj.ds.24@nitj.ac.in",    icon:"✉️", desc:"Send me a message directly",  color:"#0ea5e9" },
];

export default function Contact() {
  return (
    <div style={{ fontFamily:"'Inter',system-ui,sans-serif", background:"#0a0610", minHeight:"100vh" }}>
      <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}@keyframes pulse{0%,100%{opacity:0.4}50%{opacity:1}}`}</style>

      {/* ── HERO ──────────────────────────────── */}
      <div style={{ position:"relative", height:"100vh", minHeight:560, overflow:"hidden" }}>
        <div style={{ position:"absolute", inset:0 }}><EnvelopeHero /></div>
        <div style={{ position:"absolute", inset:0, background:"linear-gradient(to bottom,rgba(10,6,16,0.1) 0%,rgba(10,6,16,0) 35%,rgba(10,6,16,0.7) 80%,rgba(10,6,16,1) 100%)", pointerEvents:"none" }} />
        <div style={{ position:"absolute", bottom:60, left:0, right:0, textAlign:"center", animation:"fadeUp 0.8s ease both", pointerEvents:"none" }}>
          <span style={{ fontSize:"0.68rem",fontWeight:600,letterSpacing:"0.2em",textTransform:"uppercase",color:"#f97316",display:"block",marginBottom:"0.5rem" }}>Portfolio · Contact</span>
          <h1 style={{ color:"rgba(230,220,255,0.95)", fontSize:"clamp(2.2rem,5vw,3.8rem)", fontWeight:900, letterSpacing:"-0.04em", margin:"0 0 0.5rem" }}>Let's Talk</h1>
          <p style={{ color:"rgba(180,160,220,0.4)", fontSize:"0.95rem", margin:0 }}>Move your mouse to interact with the envelope</p>
        </div>
        <div style={{ position:"absolute", bottom:22, left:"50%", transform:"translateX(-50%)", display:"flex", flexDirection:"column", alignItems:"center", gap:5, animation:"pulse 2s ease infinite" }}>
          <div style={{ width:1, height:28, background:"rgba(124,58,237,0.5)" }} />
          <span style={{ color:"rgba(124,58,237,0.5)", fontSize:"0.65rem", letterSpacing:"0.18em", textTransform:"uppercase" }}>scroll</span>
        </div>
      </div>

      {/* ── CONTACT LINKS ─────────────────────── */}
      <div style={{ background:"#FFF8EF", padding:"5rem 2.5rem" }}>
        <div style={{ maxWidth:"52rem", margin:"0 auto" }}>
          <Reveal delay={0}>
            <span style={{ fontSize:"0.68rem",fontWeight:600,letterSpacing:"0.2em",textTransform:"uppercase",color:"#f97316",display:"block",marginBottom:"0.5rem" }}>Get in touch</span>
            <h2 style={{ fontSize:"clamp(1.8rem,3.5vw,2.6rem)", fontWeight:900, color:"#78350f", letterSpacing:"-0.03em", margin:"0 0 0.6rem" }}>I'm always open to<br/>something new</h2>
            <p style={{ color:"#92400e", opacity:0.55, marginBottom:"3rem", fontSize:"0.95rem", maxWidth:"34rem" }}>
              Whether it's a project, collaboration, internship, or just a conversation about tech — feel free to reach out.
            </p>
          </Reveal>

          <div style={{ display:"flex", flexDirection:"column", gap:"1rem", marginBottom:"3rem" }}>
            {LINKS.map((l,i)=>(
              <Reveal key={l.label} delay={0.1+i*0.1}>
                <a href={l.href} target={l.href.startsWith("mailto")?"_self":"_blank"} rel="noreferrer"
                  style={{
                    display:"flex", alignItems:"center", gap:"1.25rem",
                    background:"#fff", borderRadius:"1.25rem",
                    padding:"1.4rem 1.75rem",
                    boxShadow:"0 2px 16px rgba(120,53,15,0.07)",
                    border:`1px solid ${l.color}22`,
                    textDecoration:"none",
                    transition:"transform 0.3s, box-shadow 0.3s",
                  }}
                  onMouseEnter={e=>{e.currentTarget.style.transform="translateX(8px)";e.currentTarget.style.boxShadow=`0 10px 36px ${l.color}22`;}}
                  onMouseLeave={e=>{e.currentTarget.style.transform="";e.currentTarget.style.boxShadow="0 2px 16px rgba(120,53,15,0.07)";}}>
                  <div style={{ width:52, height:52, borderRadius:"1rem", background:`${l.color}15`, border:`1.5px solid ${l.color}33`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:"1.5rem", flexShrink:0 }}>
                    {l.icon}
                  </div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontWeight:700, color:"#78350f", fontSize:"1.05rem" }}>{l.label}</div>
                    <div style={{ color:"#9ca3af", fontSize:"0.85rem" }}>{l.desc}</div>
                  </div>
                  <div style={{ color:l.color, fontSize:"1.3rem", fontWeight:700 }}>→</div>
                </a>
              </Reveal>
            ))}
          </div>

          <Reveal delay={0.4}>
            <div style={{ textAlign:"center", padding:"2rem", background:"#fff", borderRadius:"1.25rem", boxShadow:"0 2px 16px rgba(120,53,15,0.07)", border:"1px solid rgba(251,191,36,0.14)" }}>
              <p style={{ color:"#6b7280", fontSize:"0.95rem", margin:"0 0 0.5rem" }}>Based in <strong style={{color:"#78350f"}}>India</strong> · Open to <strong style={{color:"#78350f"}}>remote work</strong></p>
              <p style={{ color:"#9ca3af", fontSize:"0.82rem", margin:0 }}>Usually replies within 24 hours ✦</p>
            </div>
          </Reveal>
        </div>
      </div>

      {/* ── DARK CLOSING ──────────────────────── */}
      <div style={{ background:"#0a0610", padding:"4rem 2.5rem", textAlign:"center" }}>
        <Reveal delay={0}>
          <p style={{ color:"rgba(180,160,220,0.3)", fontSize:"0.85rem", fontFamily:"monospace", letterSpacing:"0.06em" }}>
            {"// made with ♥ by Kritika Joshi · 2026"}
          </p>
        </Reveal>
      </div>
    </div>
  );
}