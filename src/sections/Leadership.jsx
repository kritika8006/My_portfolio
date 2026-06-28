import { useEffect, useRef } from "react";
import * as THREE from "three";
import Reveal from "./Reveal";

// ═══════════════════════════════════════════════════════════════
//  FULL-SCREEN 3-D PODIUM HERO
// ═══════════════════════════════════════════════════════════════
function PodiumHero() {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    let W = el.clientWidth, H = el.clientHeight;
    const renderer = new THREE.WebGLRenderer({ antialias:true });
    renderer.setSize(W, H); renderer.setPixelRatio(Math.min(window.devicePixelRatio,2));
    renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.1;
    el.appendChild(renderer.domElement);
    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#09080e");
    scene.fog = new THREE.FogExp2("#09080e", 0.04);
    const camera = new THREE.PerspectiveCamera(44, W/H, 0.1, 60);
    camera.position.set(0, 4, 10); camera.lookAt(0, 1.5, 0);

    scene.add(new THREE.AmbientLight("#c8d0ff", 0.7));
    const sun = new THREE.DirectionalLight("#fff8e8", 3.5);
    sun.position.set(5,10,7); sun.castShadow=true; sun.shadow.mapSize.set(1024,1024); scene.add(sun);
    const gold = new THREE.PointLight("#fbbf24", 10, 8); gold.position.set(0,5,1); scene.add(gold);
    const blue = new THREE.PointLight("#3b82f6", 6, 10); blue.position.set(-4,2,3); scene.add(blue);
    const rim  = new THREE.PointLight("#f97316", 5, 10); rim.position.set(4,2,3); scene.add(rim);

    const mat = c => new THREE.MeshStandardMaterial({color:c,roughness:0.3,metalness:0.6});
    const bx=(w,h,d,c,x,y,z)=>{ const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat(c)); m.position.set(x,y,z); m.castShadow=true; m.receiveShadow=true; scene.add(m); return m; };
    const cy=(rt,rb,h,c,x,y,z,seg=24)=>{ const m=new THREE.Mesh(new THREE.CylinderGeometry(rt,rb,h,seg),mat(c)); m.position.set(x,y,z); m.castShadow=true; scene.add(m); return m; };

    bx(20,0.1,20,"#0d0b10",0,-0.05,0);
    bx(8,0.22,4,"#2d1f4a",0,-0.0,0);
    bx(2.2,0.6,2.2,"#4c3878",0,0.41,0);
    bx(2.0,0.4,2.0,"#3d2d62",-2.8,0.3,0);
    bx(2.0,0.3,2.0,"#3d2d62", 2.8,0.25,0);
    cy(0.08,0.08,0.8,"#c8a830",0,1.01,0);
    cy(0.55,0.22,0.9,"#fbbf24",0,1.56,0,32);
    cy(0.62,0.62,0.1,"#fbbf24",0,2.06,0,32);
    cy(0.28,0.28,0.1,"#c8a830",0,0.66,0,32);
    [-1,1].forEach(s=>{
      const h=new THREE.Mesh(new THREE.TorusGeometry(0.28,0.04,10,24,Math.PI),mat("#e8a830"));
      h.position.set(s*0.52,1.56,0); h.rotation.z=s*Math.PI/2; scene.add(h);
    });
    const gl=new THREE.PointLight("#fbbf24",8,5); gl.position.set(0,2.2,0); scene.add(gl);
    bx(0.65,0.85,0.1,"#1d4ed8",-2.8,0.9,1.0);
    bx(0.46,0.6,0.08,"#3b82f6",-2.8,0.92,1.04);
    bx(0.06,0.42,0.06,"#f97316",-2.8,0.94,1.08);
    bx(0.36,0.06,0.06,"#f97316",-2.8,1.06,1.08);
    [["#dc2626",0],["#7c3aed",0.14],["#0ea5e9",0.28]].forEach(([c,dy])=>
      bx(0.65,0.13,0.8,c,2.8,0.42+dy,0.3));

    const stars = [0,1,2,3,4].map(i=>{
      const s=new THREE.Mesh(new THREE.SphereGeometry(0.06,10,10),mat("#fef08a"));
      s.userData={phase:i*1.2,r:2.8+i*0.4,speed:0.3+i*0.08};
      scene.add(s); return s;
    });

    const sg=new THREE.BufferGeometry();
    const sv=[]; for(let i=0;i<400;i++) sv.push((Math.random()-0.5)*50,(Math.random()-0.5)*30,(Math.random()-0.5)*30-5);
    sg.setAttribute("position",new THREE.Float32BufferAttribute(sv,3));
    scene.add(new THREE.Points(sg,new THREE.PointsMaterial({color:"#ffffff",size:0.04,transparent:true,opacity:0.5})));

    let t=0,mx=0,my=0;
    const onMM=e=>{mx=(e.clientX/window.innerWidth-0.5)*2;my=(e.clientY/window.innerHeight-0.5)*2;};
    window.addEventListener("mousemove",onMM);
    const raf={id:null};
    const loop=()=>{
      raf.id=requestAnimationFrame(loop); t+=0.01;
      stars.forEach(s=>{
        const a=t*s.userData.speed+s.userData.phase;
        s.position.set(Math.cos(a)*s.userData.r,2.8+Math.sin(a*1.3)*0.4,Math.sin(a)*s.userData.r*0.3);
      });
      gold.intensity=9+Math.sin(t*2)*1.5;
      camera.position.x+=(mx*2-camera.position.x)*0.03;
      camera.position.y+=(4-my*1-camera.position.y)*0.03;
      camera.lookAt(0,1.5,0);
      renderer.render(scene,camera);
    };
    loop();
    const onResize=()=>{W=el.clientWidth;H=el.clientHeight;camera.aspect=W/H;camera.updateProjectionMatrix();renderer.setSize(W,H);};
    window.addEventListener("resize",onResize);
    return()=>{cancelAnimationFrame(raf.id);window.removeEventListener("mousemove",onMM);window.removeEventListener("resize",onResize);renderer.dispose();if(el.contains(renderer.domElement))el.removeChild(renderer.domElement);};
  },[]);
  return <div ref={ref} style={{width:"100%",height:"100%"}}/>;
}

// ═══════════════════════════════════════════════════════════════
//  REAL LEADERSHIP DATA
// ═══════════════════════════════════════════════════════════════
const ROLES = [
  {
    icon:"🛡️", title:"Head, Cyber Security Club", org:"NIT Jalandhar · 2025 – Present", color:"#f97316",
    tags:["Club Leadership","CTF Events","Workshops","Web Infrastructure","Team Management"],
    points:[
      "Leading the Cyber Security Club — organising technical workshops, CTF competitions, and awareness drives on campus.",
      "Managing the official NIT Jalandhar CSC web platform as Full-Stack Developer & Infrastructure Lead.",
      "Leading a student development team for institutional web infrastructure using React, Node, and MongoDB.",
      "Coordinating with faculty, external speakers, and peer clubs to grow the campus tech community.",
    ],
  },
  {
    icon:"🏃", title:"Event Management & Outreach", org:"NIT Jalandhar · 2024 – Present", color:"#7c3aed",
    tags:["Half-Marathon","Health Campaigns","Logistics","Cross-team Coordination","Campus Events"],
    points:[
      "Organised the NITJ Half-Marathon 2.0 — handling registrations, logistics, and on-ground coordination end-to-end.",
      "Led 5+ health-focused campus events, managing multi-team coordination and real-world execution.",
      "Developed strong event planning, communication, and team collaboration skills through high-stakes campus initiatives.",
      "Maintained robust Git-based collaboration workflows across institutional repositories and cross-functional teams.",
    ],
  },
  {
    icon:"🖥️", title:"TPO Portal Collaborator", org:"NIT Jalandhar Training & Placement Office", color:"#0ea5e9",
    tags:["MERN Stack","Institutional Platform","Placement Infrastructure","Team Dev"],
    points:[
      "Collaborating on the official MERN-based Training & Placement Office portal for NIT Jalandhar.",
      "Contributing to the architecture and development of placement management features used by the entire campus.",
      "Working alongside faculty and fellow developers to ensure reliability and security of institutional infrastructure.",
    ],
  },
];

export default function Leadership() {
  return (
    <div style={{ fontFamily:"'Inter',system-ui,sans-serif", background:"#09080e", minHeight:"100vh" }}>
      <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}@keyframes pulse{0%,100%{opacity:0.4}50%{opacity:1}}`}</style>

      {/* ── HERO ──────────────────────────────── */}
      <div style={{ position:"relative", height:"100vh", minHeight:560, overflow:"hidden" }}>
        <div style={{ position:"absolute", inset:0 }}><PodiumHero /></div>
        <div style={{ position:"absolute", inset:0, background:"linear-gradient(to bottom,rgba(9,8,14,0.1) 0%,rgba(9,8,14,0) 35%,rgba(9,8,14,0.75) 80%,rgba(9,8,14,1) 100%)", pointerEvents:"none" }} />
        <div style={{ position:"absolute", bottom:60, left:0, right:0, textAlign:"center", animation:"fadeUp 0.8s ease both", pointerEvents:"none" }}>
          <span style={{ fontSize:"0.68rem",fontWeight:600,letterSpacing:"0.2em",textTransform:"uppercase",color:"#f97316",display:"block",marginBottom:"0.5rem" }}>Portfolio · Leadership</span>
          <h1 style={{ color:"rgba(240,230,255,0.95)", fontSize:"clamp(2.2rem,5vw,3.8rem)", fontWeight:900, letterSpacing:"-0.04em", margin:"0 0 0.5rem" }}>Leadership</h1>
          <p style={{ color:"rgba(200,180,240,0.4)", fontSize:"0.95rem", margin:0 }}>Building community, shipping platforms, leading teams</p>
        </div>
        <div style={{ position:"absolute", bottom:22, left:"50%", transform:"translateX(-50%)", display:"flex", flexDirection:"column", alignItems:"center", gap:5, animation:"pulse 2s ease infinite" }}>
          <div style={{ width:1, height:28, background:"rgba(249,115,22,0.4)" }} />
          <span style={{ color:"rgba(249,115,22,0.4)", fontSize:"0.65rem", letterSpacing:"0.18em", textTransform:"uppercase" }}>scroll</span>
        </div>
      </div>

      {/* ── ROLE CARDS ────────────────────────── */}
      <div style={{ background:"#FFF8EF", padding:"5rem 2.5rem" }}>
        <div style={{ maxWidth:"68rem", margin:"0 auto" }}>
          <Reveal delay={0}>
            <span style={{ fontSize:"0.68rem",fontWeight:600,letterSpacing:"0.2em",textTransform:"uppercase",color:"#f97316",display:"block",marginBottom:"0.5rem" }}>Roles</span>
            <h2 style={{ fontSize:"clamp(1.8rem,3.5vw,2.6rem)", fontWeight:900, color:"#78350f", letterSpacing:"-0.03em", margin:"0 0 3rem" }}>What I've Led</h2>
          </Reveal>

          <div style={{ display:"grid", gap:"1.5rem", gridTemplateColumns:"repeat(auto-fit,minmax(300px,1fr))" }}>
            {ROLES.map((r,i)=>(
              <Reveal key={r.title} delay={0.1+i*0.15}>
                <div style={{ background:"#fff", borderRadius:"1.5rem", overflow:"hidden", boxShadow:"0 4px 24px rgba(120,53,15,0.09)", border:`1px solid ${r.color}22`, transition:"transform 0.3s, box-shadow 0.3s" }}
                  onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-6px)";e.currentTarget.style.boxShadow=`0 16px 44px ${r.color}22`;}}
                  onMouseLeave={e=>{e.currentTarget.style.transform="";e.currentTarget.style.boxShadow="0 4px 24px rgba(120,53,15,0.09)";}}>
                  <div style={{ height:4, background:`linear-gradient(90deg,${r.color},${r.color}66)` }} />
                  <div style={{ padding:"1.75rem" }}>
                    <div style={{ fontSize:"2.2rem", marginBottom:"0.4rem" }}>{r.icon}</div>
                    <h3 style={{ fontSize:"1.15rem", fontWeight:800, color:"#78350f", marginBottom:"0.2rem" }}>{r.title}</h3>
                    <p style={{ fontSize:"0.78rem", color:"#9ca3af", fontWeight:500, marginBottom:"0.75rem" }}>{r.org}</p>
                    <div style={{ display:"flex", flexWrap:"wrap", gap:"0.4rem", marginBottom:"1.25rem" }}>
                      {r.tags.map(t=>(
                        <span key={t} style={{ background:`${r.color}15`, color:r.color, border:`1px solid ${r.color}33`, borderRadius:999, padding:"3px 12px", fontSize:"0.72rem", fontWeight:600 }}>{t}</span>
                      ))}
                    </div>
                    <ul style={{ margin:0, padding:0, listStyle:"none", display:"flex", flexDirection:"column", gap:"0.6rem" }}>
                      {r.points.map((p,pi)=>(
                        <li key={pi} style={{ display:"flex", gap:"0.65rem", alignItems:"flex-start" }}>
                          <span style={{ color:r.color, marginTop:"0.18rem", flexShrink:0, fontSize:"0.75rem" }}>▸</span>
                          <span style={{ color:"#6b7280", lineHeight:1.7, fontSize:"0.88rem" }}>{p}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>

      {/* ── IMPACT NUMBERS ────────────────────── */}
      <div style={{ background:"#09080e", padding:"5rem 2.5rem" }}>
        <div style={{ maxWidth:"68rem", margin:"0 auto" }}>
          <Reveal delay={0}>
            <h2 style={{ fontSize:"clamp(1.6rem,3vw,2.2rem)", fontWeight:900, color:"rgba(240,225,255,0.9)", letterSpacing:"-0.03em", margin:"0 0 3rem", textAlign:"center" }}>Impact in numbers</h2>
          </Reveal>
          <div style={{ display:"grid", gap:"1.25rem", gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))" }}>
            {[
              { num:"1",    label:"Club headed",            color:"#f97316" },
              { num:"5+",   label:"CTF & campus events",    color:"#7c3aed" },
              { num:"200+", label:"Students reached",       color:"#0ea5e9" },
              { num:"3",    label:"Institutional platforms", color:"#10b981" },
            ].map((s,i)=>(
              <Reveal key={s.label} delay={0.08*i}>
                <div style={{ textAlign:"center", background:"rgba(255,255,255,0.03)", border:`1px solid ${s.color}22`, borderRadius:"1.25rem", padding:"2rem 1rem" }}>
                  <div style={{ fontSize:"2.8rem", fontWeight:900, color:s.color, letterSpacing:"-0.05em", lineHeight:1, marginBottom:"0.5rem" }}>{s.num}</div>
                  <div style={{ color:"rgba(200,170,130,0.55)", fontSize:"0.85rem", fontWeight:500 }}>{s.label}</div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
