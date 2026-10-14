import { useRef, useEffect, useState, useCallback } from "react";
import * as THREE from "three";

const ORANGE="#f4a55a",WOOD_D="#4a2c14",WOOD_M="#7a4a26",WOOD_L="#b06a38";
const PLANT_G="#5ecb7a",PLANT_DG="#2d8a48",POT="#c07830",RUG="#8b3a2a";
const LAMP_SH="#fdf0cc",LAMP_BS="#9a8a7a",SCREEN="#9de4f8";
const FLOOR_C="#2a1a0e",WALL_C="#221408",CHAIR_O="#e8922a";
const FLOOR_TOP=0.0;

// Room is a corner: back wall at Z=-18, left wall at X=-18, right wall at X=+18
// All furniture must stay within X:[-17.5 .. +17.5], Z:[-17.5 .. open]

const NAV_META={
  Projects:   {icon:"🔧",hint:"Opening the wardrobe…",  color:"#e8a44a",label:"Projects"},
  Skills:     {icon:"📐",hint:"Checking the bookshelf…",color:"#c8a87a",label:"Skills"},
  Leadership: {icon:"📌",hint:"Walking to the board…",  color:"#d4884a",label:"Leadership"},
  About:      {icon:"🖥", hint:"Heading to the desk…",  color:"#b8c8a8",label:"About"},
  Contact:    {icon:"✉️",hint:"Going to the shelf…",    color:"#d4a24c",label:"Contact"},
};

function mkMat(c){return new THREE.MeshStandardMaterial({color:c,roughness:0.78,metalness:0.02});}
function box(w,h,d,c,x,y,z,rx=0,ry=0,rz=0){
  const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mkMat(c));
  m.position.set(x,y,z);m.rotation.set(rx,ry,rz);m.castShadow=true;m.receiveShadow=true;return m;
}
function cyl(rt,rb,h,c,x,y,z,seg=16){
  const m=new THREE.Mesh(new THREE.CylinderGeometry(rt,rb,h,seg),mkMat(c));
  m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;return m;
}
function sph(r,c,x,y,z){
  const m=new THREE.Mesh(new THREE.SphereGeometry(r,18,18),mkMat(c));
  m.position.set(x,y,z);m.castShadow=true;return m;
}
function cylF(rt,rb,h,c,x,yB,z,seg=16){return cyl(rt,rb,h,c,x,yB+h/2,z,seg);}

function buildAvatar(scene){
  const g=new THREE.Group();g.name="avatar";
  g.add(box(0.55,0.72,0.3,"#1e293b",0,0.91,0));
  g.add(box(0.13,0.58,0.04,ORANGE,-0.13,0.93,0.16));
  g.add(box(0.13,0.58,0.04,ORANGE,0.13,0.93,0.16));
  g.add(sph(0.23,"#f4c394",0,1.62,0));
  g.add(box(0.48,0.2,0.46,WOOD_D,0,1.78,-0.01));
  g.add(box(0.07,0.32,0.38,WOOD_D,-0.23,1.63,0));
  g.add(box(0.07,0.32,0.38,WOOD_D,0.23,1.63,0));
  g.add(box(0.065,0.045,0.04,"#1e293b",-0.085,1.63,0.22));
  g.add(box(0.065,0.045,0.04,"#1e293b",0.085,1.63,0.22));
  g.add(box(0.11,0.03,0.04,"#c2856a",0,1.51,0.22));
  g.add(cyl(0.075,0.075,0.22,"#f4c394",0,1.37,0));
  const lArm=new THREE.Group();
  lArm.add(box(0.19,0.56,0.19,"#1e293b",0,-0.21,0));
  lArm.add(box(0.16,0.3,0.16,"#f4c394",0,-0.57,0));
  lArm.position.set(-0.38,1.16,0);
  const rArm=new THREE.Group();
  rArm.add(box(0.19,0.56,0.19,"#1e293b",0,-0.21,0));
  rArm.add(box(0.16,0.3,0.16,"#f4c394",0,-0.57,0));
  rArm.position.set(0.38,1.16,0);
  g.add(lArm);g.add(rArm);
  g.add(box(0.23,0.67,0.23,"#0f172a",-0.14,0.33,0));
  g.add(box(0.23,0.67,0.23,"#0f172a",0.14,0.33,0));
  g.add(box(0.25,0.11,0.33,"#111",-0.14,0.025,0.06));
  g.add(box(0.25,0.11,0.33,"#111",0.14,0.025,0.06));
  g.scale.set(1.1,1.1,1.1);
  g.position.set(0,0.07,5);
  scene.add(g);
  g.userData.lArm=lArm;g.userData.rArm=rArm;
  return g;
}

function buildRoom(scene){
  const inter={};

  // ── Wall bounds ──────────────────────────────
  // Back wall inner face:  Z = -17.86
  // Left wall inner face:  X = -17.86
  // Right wall inner face: X = +17.86   ← NEW
  const BW = -17.86;  // back wall inner Z
  const LW = -17.86;  // left wall inner X
  const RW =  17.86;  // right wall inner X

  // ── WALLS ────────────────────────────────────
  // Back wall
  scene.add(box(40,18,0.28,WALL_C, 0,9,-18.14));
  // Left wall
  scene.add(box(0.28,18,40,WALL_C, -18.14,9,0));
  // RIGHT wall (new — gives bookshelf / wardrobe a surface to lean against)
  scene.add(box(0.28,18,40,WALL_C, 18.14,9,0));
  // Baseboards
  scene.add(box(40,0.32,0.1,"#180e06",  0,0.16,-17.86));
  scene.add(box(0.1,0.32,40,"#180e06", -17.86,0.16,0));
  scene.add(box(0.1,0.32,40,"#180e06",  17.86,0.16,0));

  // ── FLOOR ────────────────────────────────────
  scene.add(box(40,0.15,40,FLOOR_C, 0,-0.08,0));
  // Desk rug
  scene.add(box(9,0.03,6.5,RUG, 0,0.015,1.5));
  [-1.5,0,1.5].forEach(i=>scene.add(box(8.6,0.032,0.1,"#a84030",0,0.031,1.5+i*1.8)));
  [-3.5,3.5].forEach(i=>scene.add(box(0.1,0.032,6.1,"#a84030",0+i*3.5,0.031,1.5)));
  // Couch rug
  scene.add(box(7,0.025,5,"#6b3d24", 9,0.013,6));
  [-2,0,2].forEach(i=>scene.add(box(6.6,0.027,0.08,"#8b5a30",9,0.027,6+i*1.6)));

  // ── CEILING PENDANTS ─────────────────────────
  scene.add(cyl(0.5,0.65,0.18,LAMP_SH, -1,14.5,-8,12));
  scene.add(cyl(0.04,0.04,5.5,LAMP_BS, -1,11.75,-8));
  scene.add(cyl(0.08,0.08,0.1,"#fef9c3",-1,9.1,-8));
  scene.add(cyl(0.5,0.65,0.18,LAMP_SH, 7,14.5,5,12));
  scene.add(cyl(0.04,0.04,4.0,LAMP_BS, 7,12.5,5));
  scene.add(cyl(0.08,0.08,0.1,"#fef9c3",7,10.6,5));
  scene.add(cyl(0.35,0.45,0.14,LAMP_SH,-12,14.5,-14,10));
  scene.add(cyl(0.04,0.04,3.5,LAMP_BS, -12,12.75,-14));

  // ── DESK (centred near back wall) ────────────
  scene.add(box(6.5,0.2,3.2,WOOD_M, 0,2.1,-0.6));
  [[-2.9,-1.1],[-2.9,1.1],[2.9,-1.1],[2.9,1.1]].forEach(([dx,dz])=>
    scene.add(box(0.16,2.0,0.16,WOOD_D, dx,1.0,-0.6+dz)));
  scene.add(box(1.4,1.8,2.8,WOOD_D, 2.7,1.1,-0.6));
  [0.55,-0.1,-0.65].forEach(dy=>scene.add(box(0.55,0.07,0.1,"#c4a882",2.7,1.1+dy,0.83)));

  // ── MONITOR ──────────────────────────────────
  scene.add(box(3.0,1.8,0.1,"#0f172a", 0,3.7,-1.9));
  scene.add(box(2.78,1.58,0.06,SCREEN,  0,3.7,-1.86));
  scene.add(box(0.13,0.7,0.13,"#374151",0,2.65,-1.9));
  scene.add(box(0.9,0.07,0.55,"#374151",0,2.31,-1.9));
  ["#22d3ee","#f4a55a","#a3e635","#f472b6","#94a3b8"].forEach((c,i)=>
    scene.add(box(0.4+i*0.18,0.055,0.02,c,-0.8+i*0.5,3.8-i*0.22,-1.83)));
  scene.add(box(1.8,1.1,0.08,"#0f172a",-1.8,3.15,-1.85,0,0.18,0));
  scene.add(box(1.62,0.96,0.05,SCREEN,  -1.8,3.15,-1.82,0,0.18,0));

  // ── KEYBOARD + MOUSE ─────────────────────────
  scene.add(box(2.0,0.07,0.7,"#1e293b",0,2.21,-0.75));
  for(let i=-4;i<=4;i++) for(let j=-1;j<=1;j++)
    scene.add(box(0.19,0.05,0.19,"#2d3f55",i*0.22,2.255,-0.75+j*0.19));
  scene.add(box(0.38,0.11,0.58,"#1e293b",1.9,2.24,-0.55));
  scene.add(box(0.06,0.075,0.28,"#334155",1.9,2.27,-0.62));
  // trinkets
  scene.add(sph(0.12,"#f4a55a",-1.2,2.32,-0.9));
  scene.add(box(0.22,0.28,0.06,"#b8621a",-1.6,2.24,-1.0));
  scene.add(box(0.18,0.22,0.06,"#8b4a2a",-1.38,2.21,-1.0));
  scene.add(box(0.08,0.06,0.06,"#fbbf24",-1.0,2.24,-0.92));

  // ── DESK LAMP ────────────────────────────────
  scene.add(cyl(0.065,0.065,1.4,LAMP_BS,-2.0,2.97,-1.4));
  scene.add(box(0.065,0.55,0.065,LAMP_BS,-2.0,3.8,-1.4,0.45,0,0));
  scene.add(cyl(0.22,0.32,0.45,LAMP_SH,-1.75,4.06,-1.18,8));
  scene.add(cyl(0.22,0.22,0.06,LAMP_BS,-2.0,2.27,-1.4));

  // ── MUG ──────────────────────────────────────
  const DT=2.2;
  scene.add(cylF(0.2,0.16,0.4,"#b45309",-2.7,DT,-1.4));
  scene.add(cyl(0.16,0.14,0.34,"#581c87",-2.7,DT+0.34,-1.4));
  scene.add(box(0.08,0.22,0.08,"#b45309",-2.47,DT+0.11,-1.4));

  // ── DESK PLANT ───────────────────────────────
  const PH=0.28,PR=0.15;
  scene.add(cylF(PR,PR-0.03,PH,POT,-3.2,DT,-1.55));
  const PT=DT+PH;
  scene.add(cylF(0.04,0.04,0.4,PLANT_DG,-3.2,PT,-1.55));
  const ST2=PT+0.4;
  scene.add(box(0.32,0.06,0.32,PLANT_G,-3.2,ST2+0.03,-1.55));
  scene.add(box(0.22,0.06,0.22,PLANT_G,-3.0,ST2-0.1,-1.42,0,0,0.3));
  scene.add(box(0.22,0.06,0.22,PLANT_G,-3.4,ST2-0.12,-1.42,0,0,-0.3));

  // LED strip behind monitors
  scene.add(box(6.5,0.05,0.06,ORANGE,0,2.22,-2.21));

  // ── CHAIR ────────────────────────────────────
  const CLH=1.5;
  [[-0.75,1.6],[-0.75,3.4],[1.75,1.6],[1.75,3.4]].forEach(([dx,dz])=>
    scene.add(box(0.13,CLH,0.13,"#292524",dx,CLH/2,dz)));
  const SY=CLH;
  scene.add(box(1.8,0.16,1.8,"#1c1917",0.5,SY+0.08,2.5));
  scene.add(box(1.68,0.13,1.68,CHAIR_O,0.5,SY+0.225,2.5));
  scene.add(box(1.8,1.55,0.15,"#1c1917",0.5,SY+0.935,1.6));
  scene.add(box(1.62,1.42,0.08,CHAIR_O,0.5,SY+0.87,1.59));
  scene.add(box(0.12,0.08,1.7,"#292524",-0.62,SY+0.45,2.45));
  scene.add(box(0.12,0.08,1.7,"#292524", 1.62,SY+0.45,2.45));

  // ── TV MEDIA UNIT (left wall — kept well clear of LW=-17.86) ─
  // Unit centred at X=-13 so its right edge is -13+2.75=-10.25,
  // left edge is -13-2.75=-15.75. TV screen at same X, depth goes into wall:
  // place TV screen facing +Z direction (not into wall).
  const TVX=-13, TVZ=1.5;
  // Unit body (width 5.5 → edges at -15.75 and -10.25, both inside wall)
  scene.add(box(5.5,0.7,1.2,WOOD_D, TVX,0.35,TVZ));
  scene.add(box(5.6,0.08,1.3,WOOD_L, TVX,0.72,TVZ));
  [[-2.4,-0.4],[-2.4,0.4],[2.4,-0.4],[2.4,0.4]].forEach(([dx,dz])=>
    scene.add(box(0.1,0.18,0.1,WOOD_D, TVX+dx,0.09,TVZ+dz)));
  scene.add(box(2.4,0.55,0.06,WOOD_M, TVX-1.4,0.35,TVZ+0.62));
  scene.add(box(2.4,0.55,0.06,WOOD_M, TVX+1.4,0.35,TVZ+0.62));
  scene.add(box(0.08,0.32,0.06,"#d4a96a", TVX-0.2,0.35,TVZ+0.65));
  scene.add(box(0.08,0.32,0.06,"#d4a96a", TVX+0.2,0.35,TVZ+0.65));
  // TV screen mounted on left wall face (screen faces +Z / into room)
  scene.add(box(4.8,2.8,0.12,"#0f172a", TVX,2.86,BW+0.18));
  scene.add(box(4.5,2.55,0.06,"#0d1a2e", TVX,2.86,BW+0.22));
  scene.add(box(4.5,0.04,0.03,ORANGE, TVX,4.22,BW+0.23));
  scene.add(box(4.5,0.04,0.03,ORANGE, TVX,1.53,BW+0.23));
  // items on unit
  scene.add(cylF(0.14,0.11,0.38,"#b8621a",TVX-2.2,0.72,TVZ-0.1));
  scene.add(cylF(0.04,0.04,0.55,PLANT_DG,TVX-2.2,0.72+0.38,TVZ-0.1));
  scene.add(box(0.22,0.33,0.22,PLANT_G, TVX-2.2,0.72+0.38+0.27+0.05,TVZ-0.1));
  scene.add(box(0.7,0.06,0.45,"#1e293b",TVX+2.0,0.75,TVZ-0.1));
  scene.add(cyl(0.07,0.07,0.55,LAMP_BS, TVX-1.0,1.0,TVZ-0.1));
  scene.add(cyl(0.18,0.24,0.28,LAMP_SH, TVX-1.0,1.42,TVZ-0.1,8));

  // ── COUCH (right-centre area) ────────────────
  const CX=9, CZ=6;
  scene.add(box(7.5,0.6,3.0,"#4a2e22", CX,0.3,CZ));
  ["#6b4436","#6b4436","#6b4436"].forEach((c,i)=>
    scene.add(box(2.2,0.38,2.7,c, CX-2.25+i*2.25,0.79,CZ)));
  scene.add(box(7.5,1.8,0.55,"#4a2e22", CX,1.5,CZ-1.4));
  scene.add(box(7.2,1.55,0.42,"#6b4436", CX,1.55,CZ-1.36));
  scene.add(box(0.55,1.2,3.0,"#4a2e22", CX-3.78,0.9,CZ));
  scene.add(box(0.55,1.2,3.0,"#4a2e22", CX+3.78,0.9,CZ));
  scene.add(box(0.9,0.55,0.9,ORANGE, CX-2.8,1.25,CZ-0.5,0,0,0.18));
  scene.add(box(0.85,0.5,0.85,"#d4915a",CX+2.5,1.22,CZ-0.5,0,0,-0.12));
  [[-3.3,-1.2],[-3.3,1.2],[3.3,-1.2],[3.3,1.2]].forEach(([dx,dz])=>
    scene.add(box(0.14,0.22,0.14,WOOD_D, CX+dx,0.11,CZ+dz)));

  // ── COFFEE TABLE ─────────────────────────────
  const CTX=9, CTZ=9.2;
  scene.add(box(4.2,0.12,2.0,WOOD_L, CTX,2.46,CTZ));
  scene.add(box(4.0,0.06,1.8,"#c8d8e8",CTX,2.5,CTZ));
  [[-1.8,-0.7],[-1.8,0.7],[1.8,-0.7],[1.8,0.7]].forEach(([dx,dz])=>
    scene.add(box(0.1,2.4,0.1,WOOD_D, CTX+dx,1.2,CTZ+dz)));
  scene.add(box(1.1,0.06,0.8,"#f1f5f9",CTX-0.8,2.54,CTZ-0.3));
  scene.add(cylF(0.22,0.18,0.5,"#b45309",CTX+1.3,2.52,CTZ));
  scene.add(sph(0.14,ORANGE, CTX+0.2,2.66,CTZ+0.5));

  // ── SIDE TABLE (right of desk) ───────────────
  const STH=2.45;
  [[-0.6,-0.6],[-0.6,0.6],[0.6,-0.6],[0.6,0.6]].forEach(([dx,dz])=>
    scene.add(box(0.11,STH,0.11,WOOD_D, 5+dx,STH/2,0.5+dz)));
  const STT=STH+0.07;
  scene.add(box(1.6,0.14,1.6,WOOD_M, 5,STT,0.5));
  // Record player on side table
  const RPY=STT+0.14;
  scene.add(box(1.2,0.1,0.9,WOOD_D, 5,RPY+0.05,0.5));
  scene.add(cyl(0.42,0.42,0.04,"#1a1a1a", 5,RPY+0.12,0.48,32));
  scene.add(cyl(0.12,0.12,0.02,"#c8a850", 5,RPY+0.14,0.48,32));

  // ── FILING CABINET (left of desk) ────────────
  const FCX=-4.5, FCZ=1.4;
  scene.add(box(1.4,3.6,1.8,WOOD_D, FCX,1.8,FCZ));
  [1.0,2.0,3.0].forEach(y=>{
    scene.add(box(1.32,0.82,0.07,WOOD_M, FCX,y,FCZ+0.92));
    scene.add(box(0.28,0.06,0.06,"#c4a882",FCX,y+0.2,FCZ+0.97));
  });
  scene.add(box(0.9,0.06,0.7,"#f1f5f9", FCX,3.63,FCZ));
  scene.add(box(0.32,0.42,0.06,"#dc2626",FCX-0.3,3.84,FCZ-0.1));
  scene.add(box(0.28,0.35,0.06,"#b8621a",FCX-0.02,3.81,FCZ-0.1));

  // ── WARDROBE → Projects (back-right corner, against right wall) ─
  // Right wall inner face = +17.86. Wardrobe depth 2.2, half=1.1 → centre Z=-1.1 from wall.
  // Wardrobe width 3.5, half=1.75 → centred at X=17.86-1.75=16.11 keeps it inside.
  const WGX=15.5, WGZ=-14;
  const wg=new THREE.Group();wg.name="wardrobe";
  wg.add(box(3.5,7.0,2.2,WOOD_D, 0,3.5,0));
  wg.add(box(3.7,0.2,2.4,WOOD_L, 0,7.1,0));
  const doorL=box(1.6,6.6,0.09,WOOD_M, -0.87,3.5,1.13);
  const doorR=box(1.6,6.6,0.09,"#5a3218", 0.87,3.5,1.13);
  wg.add(doorL);wg.add(doorR);
  wg.add(box(0.07,0.55,0.07,"#d4a96a",-0.13,3.5,1.18));
  wg.add(box(0.07,0.55,0.07,"#d4a96a", 0.13,3.5,1.18));
  wg.add(box(1.8,0.12,0.04,ORANGE, 0,6.5,1.15));
  // shoe rack beside wardrobe
  wg.add(box(1.2,0.08,0.8,WOOD_D, 2.2,0.44,0));
  wg.add(box(1.2,0.08,0.8,WOOD_D, 2.2,0.88,0));
  wg.add(box(0.1,0.9,0.82,WOOD_D, 1.65,0.45,0));
  wg.add(box(0.1,0.9,0.82,WOOD_D, 2.75,0.45,0));
  wg.position.set(WGX,0,WGZ);
  scene.add(wg);
  inter.wardrobe={group:wg,doorL,doorR,
    camPos:new THREE.Vector3(9,5,-8),
    camLook:new THREE.Vector3(WGX,3.5,WGZ)};

  // ── BOOKSHELF → Skills (against RIGHT wall, mid-room) ──────────
  // Right wall inner face = +17.86.
  // Shelf depth 1.85, half=0.925 → group local Z=0 = room X=17.86.
  // We rotate the group 90° so depth goes into wall (+X direction).
  // Actually easier: place shelf flush: its back panel needs to be at X=+17.86.
  // Shelf is built along Z axis; rotate group by -PI/2 around Y so its +Z face
  // becomes +X face (into the right wall).
  const SHELF_W=2.4, SHELF_D=1.85, SIDE_T=0.18, BACK_T=0.14, SHELF_T=0.14;
  const sg=new THREE.Group();sg.name="bookshelf";
  // Uprights (local X = ±(SHELF_W/2+SIDE_T/2), local Y = height, local Z = depth)
  sg.add(box(SIDE_T,6.6,SHELF_D,WOOD_D, -(SHELF_W/2+SIDE_T/2),3.3,0));
  sg.add(box(SIDE_T,6.6,SHELF_D,WOOD_D,  (SHELF_W/2+SIDE_T/2),3.3,0));
  // Back panel (at local -Z face = against wall once rotated)
  sg.add(box(SHELF_W,6.6,BACK_T,WOOD_D, 0,3.3,-(SHELF_D/2-BACK_T/2)));
  // Top cap + base
  sg.add(box(SHELF_W+SIDE_T*2+0.12,SHELF_T,SHELF_D,WOOD_L, 0,6.69,0));
  sg.add(box(SHELF_W+SIDE_T*2+0.12,SHELF_T,SHELF_D,WOOD_M, 0,0.09,0));
  // Shelf boards
  [1.6,3.1,4.6].forEach(y=>sg.add(box(SHELF_W,SHELF_T,SHELF_D,WOOD_M, 0,y,0)));
  // Books
  const BD=SHELF_D-0.2;
  const RY=[0.18, 1.6+SHELF_T, 3.1+SHELF_T, 4.6+SHELF_T];
  ["#dc2626","#2563eb","#16a34a","#d97706","#7c3aed","#0891b2","#db2777","#ea580c"].forEach((c,i)=>{
    const bh=0.75+i*0.04;sg.add(box(0.18,bh,BD,c,-0.95+i*0.27,RY[0]+bh/2,0));});
  ["#f59e0b","#10b981","#ef4444","#6366f1","#0284c7"].forEach((c,i)=>{
    const bh=0.62+i*0.06;sg.add(box(0.20,bh,BD,c,-0.9+i*0.45,RY[1]+bh/2,0));});
  ["#be185d","#15803d","#c2410c","#4f46e5"].forEach((c,i)=>{
    const bh=0.58+i*0.05;sg.add(box(0.20,bh,BD,c,-0.85+i*0.55,RY[2]+bh/2,0));});
  sg.add(sph(0.1,"#fde68a",0.85,RY[2]+0.12,0));
  ["#be185d","#15803d","#c2410c"].forEach((c,i)=>sg.add(box(0.21,0.56,BD,c,-0.5+i*0.52,RY[3]+0.28,0)));
  // top decorations
  sg.add(sph(0.22,ORANGE, 0.5,6.78+0.22,0));
  sg.add(cyl(0.18,0.18,0.06,"#1e293b",-0.5,6.78+0.06,-0.2,32));
  // Rotate -90° around Y so bookshelf faces -X (into the room from right wall)
  sg.rotation.y=-Math.PI/2;
  // Position: right wall inner face at X=17.86; shelf depth 1.85 → centre at X=17.86-0.925=16.93
  // After rotation, local +Z becomes world -X, local -Z becomes world +X (into wall).
  // Back panel is at local Z=-(SHELF_D/2) = -0.925 → world X= 16.93 + 0.925 = 17.86 ✓
  sg.position.set(16.93, 0, 4);
  scene.add(sg);
  inter.bookshelf={group:sg,
    camPos:new THREE.Vector3(10,5,10),
    camLook:new THREE.Vector3(16,3,4)};

  // ── POSTER → Leadership (back wall, left of centre) ────────────
  scene.add(box(3.6,2.8,0.08,"#0f172a",-6,6.5,BW+0.04));
  scene.add(box(3.3,2.5,0.06,ORANGE,   -6,6.5,BW+0.09));
  scene.add(cyl(0.22,0.28,0.55,"#fbbf24",-6,7.05,BW+0.12));
  scene.add(box(0.7,0.12,0.05,"#fbbf24", -6,6.7, BW+0.12));
  scene.add(box(0.18,0.4,0.05,"#fbbf24", -6,6.42,BW+0.12));
  scene.add(box(2.0,0.1,0.04,"#fff",  -6,5.85,BW+0.11));
  scene.add(box(1.4,0.08,0.04,"#fff", -6,5.65,BW+0.11));
  inter.poster={camPos:new THREE.Vector3(-1,7,-10),camLook:new THREE.Vector3(-6,6.5,-18)};

  // ── MONITOR AREA → About ─────────────────────
  inter.monitor={camPos:new THREE.Vector3(6,5,6),camLook:new THREE.Vector3(0,3.7,-1.8)};

  // ── WALL SHELF → Contact (back wall, right of centre) ──────────
  const WSZ=BW+0.07;
  scene.add(box(4.0,0.14,0.85,WOOD_M, 6,7.5,WSZ));
  scene.add(box(4.0,0.14,0.85,WOOD_M, 6,5.5,WSZ));
  scene.add(box(0.12,2.1,0.85,WOOD_D, 4.05,6.5,WSZ));
  scene.add(box(0.12,2.1,0.85,WOOD_D, 7.95,6.5,WSZ));
  scene.add(cylF(0.18,0.14,0.6,"#64748b",4.7,7.5+0.07,WSZ));
  scene.add(box(0.8,1.05,0.18,"#b8621a",6,8.04,WSZ));
  scene.add(cylF(0.12,0.12,0.45,"#d97706",7.3,5.5+0.07,WSZ));
  scene.add(box(0.32,0.6,0.06,"#1e293b",4.7,6.3,WSZ+0.04));
  scene.add(box(0.24,0.44,0.04,SCREEN,  4.7,6.3,WSZ+0.06));
  inter.wallshelf={camPos:new THREE.Vector3(10,6,-10),camLook:new THREE.Vector3(6,7,-18)};

  // ── BIG CORNER PLANT (left-centre) ───────────
  const BPX=-5,BPZ=5.5,BPH=1.0;
  scene.add(cylF(0.65,0.5,BPH,POT,BPX,FLOOR_TOP,BPZ));
  const BPT=BPH;
  scene.add(cylF(0.06,0.06,2.2,PLANT_DG,BPX,BPT,BPZ));
  const BST=BPT+2.2;
  [[BPX,BST+0.1,BPZ,1.0,0.07,1.0],[BPX+0.5,BST-0.4,BPZ,0.7,0.06,0.7],
   [BPX-0.5,BST-0.5,BPZ+0.2,0.75,0.06,0.75],[BPX,BST-0.6,BPZ+0.5,0.65,0.06,0.65]].forEach(
    ([x,y,z,w,h,d])=>scene.add(box(w,h,d,PLANT_G,x,y,z)));

  // ── PLANT near left wall ──────────────────────
  scene.add(cylF(0.42,0.34,0.75,POT,-13,FLOOR_TOP,4));
  scene.add(cylF(0.05,0.05,1.4,PLANT_DG,-13,0.75,4));
  [[-13,2.2,4,0.7,0.06,0.7],[-12.7,1.9,4,0.5,0.06,0.5]].forEach(
    ([x,y,z,w,h,d])=>scene.add(box(w,h,d,PLANT_G,x,y,z)));

  // ── WALL ART above desk (back wall) ──────────
  scene.add(box(2.8,2.0,0.07,"#1a0f07", 3.5,7.5,BW+0.04));
  scene.add(box(2.55,1.75,0.05,"#111827",3.5,7.5,BW+0.08));
  [ORANGE,"#c97b3a","#8b4a2a","#d4a24c"].forEach((c,i)=>
    scene.add(box(0.5,0.7+i*0.2,0.04,c, 2.35+i*0.72,7.5,BW+0.11)));

  // ── GALLERY WALL (back wall, far left) ───────
  scene.add(box(2.2,1.6,0.07,"#1a0f07",-14,8.5,BW+0.04));
  scene.add(box(1.96,1.38,0.05,"#0f172a",-14,8.5,BW+0.08));
  scene.add(cyl(0.32,0.32,0.04,"#d4a24c",-14,8.5,BW+0.12,32));
  scene.add(cyl(0.18,0.18,0.04,ORANGE,   -14,8.5,BW+0.14,32));
  // framed photo centre
  scene.add(box(1.8,1.4,0.07,"#1a120b",0,6.5,BW+0.04));
  scene.add(box(1.6,1.2,0.05,"#e8d4b0",0,6.5,BW+0.08));

  // ── FLOOR LAMP (back-left corner) ────────────
  scene.add(cylF(0.1,0.16,0.14,LAMP_BS,-14,FLOOR_TOP,-14));
  scene.add(cylF(0.04,0.04,6.4,LAMP_BS,-14,0.14,-14));
  scene.add(cyl(0.44,0.56,0.72,LAMP_SH,-14,6.9,-14,12));

  // Second floor lamp (right side, near couch)
  scene.add(cylF(0.08,0.13,0.12,LAMP_BS,14,FLOOR_TOP,9.5));
  scene.add(cylF(0.035,0.035,5.0,LAMP_BS,14,0.12,9.5));
  scene.add(cyl(0.36,0.46,0.6,LAMP_SH,14,5.42,9.5,12));

  // ── WINDOW (back wall) ───────────────────────
  scene.add(box(3.5,4.0,0.12,"#1e293b",-10,7.5,BW+0.07));
  scene.add(box(3.1,3.6,0.05,"#f0c890",-10,7.5,BW+0.14));
  scene.add(box(0.14,3.6,0.06,"#1e293b",-10,7.5,BW+0.18));
  scene.add(box(3.1,0.14,0.06,"#1e293b",-10,7.5,BW+0.18));
  const wl=new THREE.RectAreaLight("#f4d9a8",3.5,3.0,3.5);
  wl.position.set(-10,7.5,-17);wl.lookAt(-10,7.5,0);scene.add(wl);
  // sill
  scene.add(box(3.8,0.1,0.6,"#1a120b",-10,5.55,BW+0.5));
  scene.add(cylF(0.12,0.09,0.32,POT,-9.0,5.6,BW+0.45));
  scene.add(cylF(0.1,0.08,0.28,POT,-11.0,5.6,BW+0.45));

  // ── SMALL RUGS ───────────────────────────────
  scene.add(box(4.5,0.025,3.5,"#5c2818",-12,0.013,-9));
  scene.add(box(4.5,0.025,3.5,"#3a2a18", 13,0.013,-9));

  // ── BASEBOARD HEATER (back wall) ─────────────
  scene.add(box(12,0.28,0.14,"#2a1e14",-2,0.14,BW+0.1));

  // ── DOOR FRAME (left wall) ───────────────────
  const DFX=LW+0.08;
  scene.add(box(0.1,8.0,3.2,"#2a1a0e",DFX,4.0,-8.5));
  scene.add(box(0.1,0.3,3.4,"#2a1a0e",DFX,8.15,-8.5));
  scene.add(box(0.06,7.8,3.0,"#1a0f07",DFX+0.04,4.0,-8.5));
  scene.add(box(0.06,0.5,0.06,"#c4a882",DFX+0.06,4.2,-7.1));

  return inter;
}

const NAV_CONFIG={
  Projects:  {furniture:"wardrobe",  walkTo:new THREE.Vector3(14,0,-10)},
  Skills:    {furniture:"bookshelf", walkTo:new THREE.Vector3(14,0,4)},
  Leadership:{furniture:"poster",    walkTo:new THREE.Vector3(-5,0,-14)},
  About:     {furniture:"monitor",   walkTo:new THREE.Vector3(4,0,4)},
  Contact:   {furniture:"wallshelf", walkTo:new THREE.Vector3(5,0,-13)},
};

// ── Responsive camera helpers ────────────────────────────────────
// Portrait screens crop the sides of the room, so widen the FOV a little
// and start the camera further back. Landscape is unchanged (fov 45, r 24).
const getAspect = () =>
  typeof window !== "undefined" && window.innerHeight ? window.innerWidth / window.innerHeight : 1.6;
const baseRadiusFor = (a) => (a < 1 ? 24 + (1 - Math.max(a, 0.4)) * 16 : 24);
const fovFor = (a) => (a < 1 ? 45 + (1 - Math.max(a, 0.4)) * 20 : 45);

export default function Portfolio({onNavigate}){
  const mountRef=useRef(null);
  const avatarRef=useRef(null);
  const intRef=useRef({});
  const rafRef=useRef(null);
  // Keep the latest onNavigate in a ref so the 3D scene is built ONCE.
  // (Before, the scene was torn down and rebuilt every time App re-rendered.)
  const onNavRef=useRef(onNavigate);
  onNavRef.current=onNavigate;

  const r0=baseRadiusFor(getAspect());
  const orbitRef=useRef({
    theta:Math.PI*0.25,phi:Math.PI*0.30,radius:r0,
    target:new THREE.Vector3(0,2,0),
    dragging:false,lastX:0,lastY:0,
    tTheta:Math.PI*0.25,tPhi:Math.PI*0.30,tRadius:r0,
    tTarget:new THREE.Vector3(0,2,0),
  });
  const walkRef=useRef({phase:"idle",from:new THREE.Vector3(),to:new THREE.Vector3(),t:0,furniture:null,section:null});
  const keysRef=useRef({});
  const [activeSection,setActiveSection]=useState(null);
  const [walking,setWalking]=useState(false);

  useEffect(()=>{
    const mount=mountRef.current;
    const W=mount.clientWidth,H=mount.clientHeight;
    const renderer=new THREE.WebGLRenderer({antialias:true});
    renderer.setSize(W,H);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio,2));
    renderer.shadowMap.enabled=true;
    renderer.shadowMap.type=THREE.PCFSoftShadowMap;
    renderer.toneMapping=THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure=1.05;
    renderer.logarithmicDepthBuffer=true;
    mount.appendChild(renderer.domElement);

    const scene=new THREE.Scene();
    scene.background=new THREE.Color("#1a0f07");
    scene.fog=new THREE.Fog("#1a0f07",45,72);
    const camera=new THREE.PerspectiveCamera(fovFor(W/H),W/H,0.1,140);

    // Lighting
    scene.add(new THREE.AmbientLight("#ffe0b0",1.5));
    const sun=new THREE.DirectionalLight("#fff8e8",2.6);
    sun.position.set(8,18,10);sun.castShadow=true;
    sun.shadow.mapSize.set(2048,2048);
    sun.shadow.camera.left=-36;sun.shadow.camera.right=36;
    sun.shadow.camera.top=36;sun.shadow.camera.bottom=-36;
    sun.shadow.camera.far=80;sun.shadow.bias=-0.002;
    scene.add(sun);
    const dl1=new THREE.DirectionalLight("#ffd8a0",1.2); dl1.position.set(-10,12,15); scene.add(dl1);
    const dl2=new THREE.DirectionalLight("#ffcc88",1.4); dl2.position.set(12,10,-5);  scene.add(dl2);
    const pl=(col,i,x,y,z)=>{const l=new THREE.PointLight(col,i,0);l.position.set(x,y,z);scene.add(l);};
    pl("#ffb347",4,0,4.3,-1.2);    // desk lamp
    pl("#9de4f8",1.8,0,3.7,-1.6);  // screen glow
    pl(ORANGE,1.5,0,2.35,-2.2);    // LED strip
    pl("#ffddb0",2.6,-14,7,-2);    // left wall fill
    pl("#fff8e1",2.4,-14,6.5,-14); // floor lamp
    pl("#ffcca0",1.8,0,8,0);       // room fill
    pl("#ffddb0",2.2,9,5.5,6);     // couch area
    pl("#ffddb0",1.6,-13,4,1.5);   // TV area
    pl("#fff8e8",2.0,-1,9,-8);     // pendant 1
    pl("#fff0d0",1.6,7,9,5);       // pendant 2
    pl("#ffeedd",2.0,16,5,4);      // bookshelf area
    pl("#ffeedd",1.8,14,5,-10);    // wardrobe area

    intRef.current=buildRoom(scene);
    avatarRef.current=buildAvatar(scene);

    const canvas=renderer.domElement;
    canvas.style.cursor="grab";
    // stop the browser from scrolling/zooming the page while dragging the scene on touch screens
    canvas.style.touchAction="none";
    const o=orbitRef.current;
    const clampR=r=>Math.max(6,Math.min(40,r));

    const onMD=e=>{if(walkRef.current.phase!=="idle")return;o.dragging=true;o.lastX=e.clientX;o.lastY=e.clientY;canvas.style.cursor="grabbing";};
    const onMM=e=>{if(!o.dragging)return;o.tTheta-=(e.clientX-o.lastX)*0.007;o.tPhi=Math.max(0.1,Math.min(Math.PI*0.46,o.tPhi+(e.clientY-o.lastY)*0.006));o.lastX=e.clientX;o.lastY=e.clientY;};
    const onMU=()=>{o.dragging=false;canvas.style.cursor="grab";};
    const onW=e=>{e.preventDefault();o.tRadius=clampR(o.tRadius+e.deltaY*0.04);};

    // touch: one finger orbits, two fingers pinch-zoom
    let pinch=0;
    const dist=t=>Math.hypot(t[0].clientX-t[1].clientX,t[0].clientY-t[1].clientY);
    const onTS=e=>{
      if(e.touches.length===1){
        if(walkRef.current.phase!=="idle")return;
        o.dragging=true;o.lastX=e.touches[0].clientX;o.lastY=e.touches[0].clientY;
      }else if(e.touches.length===2){
        o.dragging=false;pinch=dist(e.touches);
      }
    };
    const onTM=e=>{
      if(e.touches.length===2){
        const d=dist(e.touches);
        o.tRadius=clampR(o.tRadius-(d-pinch)*0.08);
        pinch=d;
        return;
      }
      if(!o.dragging||e.touches.length!==1)return;
      o.tTheta-=(e.touches[0].clientX-o.lastX)*0.007;
      o.tPhi=Math.max(0.1,Math.min(Math.PI*0.46,o.tPhi+(e.touches[0].clientY-o.lastY)*0.006));
      o.lastX=e.touches[0].clientX;o.lastY=e.touches[0].clientY;
    };
    const onTE=()=>{o.dragging=false;};
    const onKD=e=>{keysRef.current[e.key]=true;};
    const onKU=e=>{keysRef.current[e.key]=false;};
    canvas.addEventListener("mousedown",onMD);
    window.addEventListener("mousemove",onMM);
    window.addEventListener("mouseup",onMU);
    canvas.addEventListener("wheel",onW,{passive:false});
    canvas.addEventListener("touchstart",onTS,{passive:true});
    canvas.addEventListener("touchmove",onTM,{passive:true});
    canvas.addEventListener("touchend",onTE);
    window.addEventListener("keydown",onKD);
    window.addEventListener("keyup",onKU);

    const clock=new THREE.Clock();
    const animate=()=>{
      rafRef.current=requestAnimationFrame(animate);
      const dt=Math.min(clock.getDelta(),0.05);
      const av=avatarRef.current,wk=walkRef.current,or=orbitRef.current,ks=keysRef.current;
      const s=0.022;
      if(ks["ArrowLeft"]||ks["a"]||ks["A"])or.tTheta-=s;
      if(ks["ArrowRight"]||ks["d"]||ks["D"])or.tTheta+=s;
      if(ks["ArrowUp"]||ks["w"]||ks["W"])or.tPhi=Math.max(0.1,or.tPhi-s);
      if(ks["ArrowDown"]||ks["s"]||ks["S"])or.tPhi=Math.min(Math.PI*0.46,or.tPhi+s);
      if(ks["+"]||ks["="])or.tRadius=Math.max(6,or.tRadius-0.18);
      if(ks["-"])or.tRadius=Math.min(40,or.tRadius+0.18);

      if(wk.phase==="walking"){
        wk.t=Math.min(wk.t+dt*0.65,1);
        const e=wk.t<0.5?2*wk.t*wk.t:1-Math.pow(-2*wk.t+2,2)/2;
        av.position.lerpVectors(wk.from,wk.to,e);
        const dir=new THREE.Vector3().subVectors(wk.to,wk.from);
        if(dir.length()>0.01)av.rotation.y=Math.atan2(dir.x,dir.z);
        av.userData.lArm.rotation.x=Math.sin(wk.t*Math.PI*6)*0.45;
        av.userData.rArm.rotation.x=-Math.sin(wk.t*Math.PI*6)*0.45;
        av.position.y=0.07+Math.abs(Math.sin(wk.t*Math.PI*6))*0.06;
        if(wk.t>=1){
          wk.phase=wk.furniture&&intRef.current[wk.furniture]?.doorL?"opening":"done";
          wk.t=0;av.userData.lArm.rotation.x=0;av.userData.rArm.rotation.x=0;av.position.y=0.07;
          if(wk.phase==="done")setTimeout(()=>{onNavRef.current?.(wk.section);},500);
        }
      }
      if(wk.phase==="opening"){
        wk.t=Math.min(wk.t+dt*0.6,1);
        const e=1-Math.pow(1-wk.t,3);
        const f=intRef.current[wk.furniture];
        if(f?.doorL){f.doorL.rotation.y=e*-Math.PI*0.58;f.doorR.rotation.y=e*Math.PI*0.58;}
        if(wk.t>=1){wk.phase="done";wk.t=0;setTimeout(()=>{onNavRef.current?.(wk.section);},600);}
      }

      or.theta+=(or.tTheta-or.theta)*0.08;
      or.phi+=(or.tPhi-or.phi)*0.08;
      or.radius+=(or.tRadius-or.radius)*0.08;
      or.target.lerp(or.tTarget,0.08);
      camera.position.set(
        or.target.x+or.radius*Math.sin(or.phi)*Math.sin(or.theta),
        or.target.y+or.radius*Math.cos(or.phi),
        or.target.z+or.radius*Math.sin(or.phi)*Math.cos(or.theta)
      );
      camera.lookAt(or.target);
      renderer.render(scene,camera);
    };
    animate();

    const onResize=()=>{
      const w=mount.clientWidth,h=mount.clientHeight;
      if(!w||!h)return;
      const a=w/h;
      camera.aspect=a;
      camera.fov=fovFor(a);
      camera.updateProjectionMatrix();
      renderer.setSize(w,h);
      // on rotate/resize, re-frame the whole room if we're at the home view
      if(walkRef.current.section===null&&walkRef.current.phase==="idle")o.tRadius=baseRadiusFor(a);
    };
    window.addEventListener("resize",onResize);
    window.addEventListener("orientationchange",onResize);
    return()=>{
      cancelAnimationFrame(rafRef.current);
      canvas.removeEventListener("mousedown",onMD);
      window.removeEventListener("mousemove",onMM);
      window.removeEventListener("mouseup",onMU);
      canvas.removeEventListener("wheel",onW);
      canvas.removeEventListener("touchstart",onTS);
      canvas.removeEventListener("touchmove",onTM);
      canvas.removeEventListener("touchend",onTE);
      window.removeEventListener("keydown",onKD);
      window.removeEventListener("keyup",onKU);
      window.removeEventListener("resize",onResize);
      window.removeEventListener("orientationchange",onResize);
      renderer.dispose();
      if(mount.contains(renderer.domElement))mount.removeChild(renderer.domElement);
    };
  },[]);

  const resetFurniture=useCallback(key=>{
    if(!key)return;
    const f=intRef.current[key];
    if(f?.doorL){f.doorL.rotation.y=0;f.doorR.rotation.y=0;}
  },[]);

  const handleNav=useCallback(section=>{
    const cfg=NAV_CONFIG[section];if(!cfg)return;
    const wk=walkRef.current;
    resetFurniture(wk.furniture);
    const or=orbitRef.current;
    const fur=intRef.current[cfg.furniture];
    if(fur){
      or.tTarget=fur.camLook?.clone()??new THREE.Vector3(0,2,0);
      const diff=new THREE.Vector3().subVectors(fur.camPos,fur.camLook??new THREE.Vector3(0,2,0));
      or.tTheta=Math.atan2(diff.x,diff.z);
      or.tPhi=Math.atan2(Math.sqrt(diff.x**2+diff.z**2),diff.y);
      // a little further back on portrait screens so the furniture isn't cropped
      const a=getAspect();
      or.tRadius=Math.min(40,diff.length()*(a<1?1+(1-Math.max(a,0.4))*0.8:1));
    }
    const av=avatarRef.current;
    wk.from=av.position.clone();wk.to=cfg.walkTo.clone();
    wk.t=0;wk.furniture=cfg.furniture;wk.section=section;wk.phase="walking";
    setActiveSection(section);setWalking(true);
    setTimeout(()=>setWalking(false),3200);
  },[resetFurniture]);

  const handleHome=useCallback(()=>{
    const wk=walkRef.current;
    resetFurniture(wk.furniture);
    const av=avatarRef.current;
    wk.from=av.position.clone();wk.to=new THREE.Vector3(0,0.07,5);
    wk.t=0;wk.phase="walking";wk.furniture=null;wk.section=null;
    const or=orbitRef.current;
    or.tTheta=Math.PI*0.25;or.tPhi=Math.PI*0.30;or.tRadius=baseRadiusFor(getAspect());or.tTarget.set(0,2,0);
    setActiveSection(null);setWalking(false);
  },[resetFurniture]);

  const meta=activeSection?NAV_META[activeSection]:null;

  return(
    <div className="ws-root">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&display=swap');
        @keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
        @keyframes fadeIn{from{opacity:0}to{opacity:1}}
        @keyframes blink{0%,100%{opacity:1}50%{opacity:0.2}}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes drift{0%,100%{transform:translateY(0)}50%{transform:translateY(-4px)}}

        /* 100dvh = the *visible* height on mobile browsers (100vh includes the URL bar) */
        .ws-root{width:100%;height:100vh;height:100dvh;position:relative;overflow:hidden;
          font-family:'Space Grotesk','Inter',system-ui,sans-serif;background:#1a0f07;}

        .ws-logo{position:absolute;top:24px;left:28px;z-index:30;display:flex;align-items:center;gap:12px;animation:fadeIn 0.9s ease both;}
        .ws-hero{position:absolute;bottom:48px;left:30px;z-index:20;pointer-events:none;animation:fadeUp 1.1s cubic-bezier(0.22,1,0.36,1) both 0.12s;}
        .ws-nav{position:absolute;right:26px;top:50%;transform:translateY(-50%);z-index:20;display:flex;flex-direction:column;gap:5px;animation:fadeIn 1.4s ease both 0.3s;}
        .ws-pill-wrap{position:absolute;left:0;right:0;bottom:44px;z-index:20;display:flex;justify-content:center;pointer-events:none;padding:0 16px;}
        .ws-scroll{position:absolute;bottom:46px;right:30px;z-index:10;pointer-events:none;display:flex;flex-direction:column;align-items:center;gap:7px;animation:fadeIn 2.5s ease both;opacity:0.5;}
        .hint-touch{display:none;}

        .ws-btn{all:unset;cursor:pointer;display:flex;align-items:center;gap:10px;
          padding:9px 16px 9px 11px;border-radius:5px;
          border-top:1px solid rgba(255,215,150,0.12);border-bottom:1px solid rgba(0,0,0,0.38);
          border-left:3px solid rgba(244,165,90,0.08);border-right:1px solid rgba(0,0,0,0.2);
          background:rgba(32,16,5,0.76);backdrop-filter:blur(18px);-webkit-backdrop-filter:blur(18px);
          color:rgba(210,160,90,0.42);font-family:'Space Grotesk',sans-serif;
          font-size:10.5px;font-weight:500;letter-spacing:0.12em;text-transform:uppercase;
          transition:all 0.18s ease;min-width:132px;box-shadow:0 2px 10px rgba(0,0,0,0.45);}
        .ws-btn:hover{color:rgba(255,210,135,0.95);background:rgba(50,24,7,0.90);
          border-left-color:rgba(244,165,90,0.6);
          box-shadow:0 4px 20px rgba(0,0,0,0.6),-3px 0 14px rgba(244,165,90,0.12);
          transform:translateX(-5px);}
        .ws-btn.active{color:#fcd37a;background:rgba(55,26,6,0.92);border-left-color:#f4a55a;
          box-shadow:0 4px 20px rgba(0,0,0,0.55),-3px 0 18px rgba(244,165,90,0.2);}
        .ws-icon{font-size:14px;opacity:0.7;flex-shrink:0;transition:opacity 0.18s,transform 0.18s;}
        .ws-btn:hover .ws-icon,.ws-btn.active .ws-icon{opacity:1;transform:scale(1.15);}
        .ws-dot{width:5px;height:5px;border-radius:50%;background:#f4a55a;animation:blink 1.8s ease infinite;flex-shrink:0;}

        /* ── Phones / small tablets: nav becomes an icon bar along the bottom ── */
        @media (max-width: 760px){
          .ws-logo{top:16px;left:16px;}
          .ws-nav{right:0;left:0;top:auto;bottom:14px;transform:none;flex-direction:row;justify-content:center;gap:6px;padding:0 10px;}
          .ws-nav-title,.ws-nav-rule,.ws-label,.ws-dot,.ws-scroll{display:none;}
          .ws-btn{min-width:0;padding:12px 14px;border-left-width:1px;border-bottom:2px solid rgba(244,165,90,0.08);}
          .ws-btn:hover{transform:none;}
          .ws-btn.active{border-bottom-color:#f4a55a;}
          .ws-icon{font-size:17px;}
          .ws-hero{left:20px;right:20px;bottom:86px;}
          .ws-pill-wrap{bottom:86px;}
          .hint-desk{display:none;}
          .hint-touch{display:inline;}
        }
      `}</style>

      <div ref={mountRef} style={{position:"absolute",inset:0}}/>
      <div style={{position:"absolute",inset:0,pointerEvents:"none",zIndex:4,boxShadow:"inset 0 0 100px rgba(8,3,1,0.7)"}}/>
      <div style={{position:"absolute",top:0,left:0,right:0,height:90,background:"linear-gradient(to bottom,rgba(12,5,1,0.72) 0%,transparent 100%)",pointerEvents:"none",zIndex:5}}/>
      <div style={{position:"absolute",bottom:0,left:0,right:0,height:150,background:"linear-gradient(to top,rgba(12,5,1,0.80) 0%,transparent 100%)",pointerEvents:"none",zIndex:5}}/>

      {/* TOP LEFT LOGO */}
      <div className="ws-logo">
        <div onClick={activeSection?handleHome:undefined}
          style={{width:38,height:38,borderRadius:7,flexShrink:0,
            background:"linear-gradient(145deg,#4a1e06 0%,#8a3e14 50%,#b86828 100%)",
            border:"1px solid rgba(255,195,110,0.2)",
            boxShadow:"0 2px 14px rgba(0,0,0,0.65),inset 0 1px 0 rgba(255,215,130,0.14)",
            display:"flex",alignItems:"center",justifyContent:"center",
            cursor:activeSection?"pointer":"default",transition:"transform 0.18s,box-shadow 0.18s"}}
          onMouseEnter={e=>{if(activeSection){e.currentTarget.style.transform="scale(1.07)";e.currentTarget.style.boxShadow="0 4px 22px rgba(0,0,0,0.65),0 0 18px rgba(244,165,90,0.28)";}}}
          onMouseLeave={e=>{e.currentTarget.style.transform="scale(1)";e.currentTarget.style.boxShadow="0 2px 14px rgba(0,0,0,0.65),inset 0 1px 0 rgba(255,215,130,0.14)";}}>
          <span style={{fontFamily:"monospace",color:"#fde68a",fontWeight:900,fontSize:11,letterSpacing:"-1px"}}>KJ</span>
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:3}}>
          <span style={{color:"rgba(255,210,130,0.85)",fontWeight:600,fontSize:13,letterSpacing:"-0.01em",lineHeight:1}}>Kritika Joshi</span>
          <span style={{color:"rgba(230,175,110,0.85)",fontWeight:400,fontSize:9,letterSpacing:"0.18em",textTransform:"uppercase"}}>
            {activeSection
              ?<span onClick={handleHome} style={{cursor:"pointer",color:"rgba(230,175,110,0.85)"}}>← back to workshop</span>
              :"Digital Workshop"}
          </span>
        </div>
      </div>

      {/* HERO TEXT */}
      {!activeSection&&(
        <div className="ws-hero">
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
            <div style={{width:20,height:1,background:"rgba(244,165,90,0.3)"}}/>
            <span style={{color:"rgba(190,135,60,0.48)",fontWeight:500,fontSize:8.5,letterSpacing:"0.26em",textTransform:"uppercase"}}>Creative Portfolio</span>
          </div>
          <h1 style={{margin:"0 0 7px",fontWeight:700,lineHeight:0.93,letterSpacing:"-0.04em",fontSize:"clamp(2.5rem,4.2vw,4.8rem)",color:"rgba(255,210,140,0.87)"}}>
            Kritika's<br/>
            <span style={{fontWeight:300,color:"rgba(195,138,60,0.48)",fontSize:"0.66em",letterSpacing:"-0.01em"}}>Digital Workshop</span>
          </h1>
          <p style={{margin:"2px 0 8px",color:"rgba(215,168,90,0.55)",fontSize:11,letterSpacing:"0.04em",fontWeight:500}}>
            Full-Stack Developer · React · Node.js · AI Applications
          </p>
          <p style={{margin:0,color:"rgba(230,175,110,0.65)",fontSize:9.5,letterSpacing:"0.1em",fontWeight:400}}>
            <span className="hint-desk">Drag · Scroll · Arrow keys</span>
            <span className="hint-touch">Drag to look · Pinch to zoom</span>
          </p>
        </div>
      )}

      {/* NAV (right side on desktop, bottom bar on phones) */}
      <div className="ws-nav">
        <div className="ws-nav-title" style={{textAlign:"right",color:"rgba(170,105,40,0.2)",fontSize:8,fontWeight:500,letterSpacing:"0.24em",textTransform:"uppercase",marginBottom:3,paddingRight:1}}>Navigate</div>
        {Object.entries(NAV_META).map(([sec,m])=>(
          <button key={sec} title={m.label} aria-label={m.label} className={`ws-btn${activeSection===sec?" active":""}`} onClick={()=>handleNav(sec)}>
            <span className="ws-icon">{m.icon}</span>
            <span className="ws-label" style={{flex:1}}>{m.label}</span>
            {activeSection===sec&&<span className="ws-dot"/>}
          </button>
        ))}
        <div className="ws-nav-rule" style={{height:1,background:"linear-gradient(to right,rgba(160,90,25,0.2),transparent)",marginTop:3}}/>
      </div>

      {/* WALKING PILL */}
      {walking&&meta&&(
        <div className="ws-pill-wrap">
          <div style={{display:"flex",alignItems:"center",gap:11,
            background:"rgba(18,8,1,0.90)",backdropFilter:"blur(20px)",border:"1px solid rgba(190,130,50,0.2)",borderRadius:100,
            padding:"10px 22px",animation:"fadeUp 0.22s ease both",boxShadow:"0 6px 28px rgba(0,0,0,0.7)"}}>
            <div style={{width:11,height:11,borderRadius:"50%",border:"1.5px solid rgba(190,130,50,0.18)",borderTop:"1.5px solid "+meta.color,animation:"spin 0.75s linear infinite",flexShrink:0}}/>
            <span style={{fontSize:14}}>{meta.icon}</span>
            <span style={{color:"rgba(215,168,90,0.72)",fontWeight:500,fontSize:10.5,letterSpacing:"0.06em"}}>{meta.hint}</span>
          </div>
        </div>
      )}

      {/* SCROLL HINT (desktop only) */}
      {!activeSection&&(
        <div className="ws-scroll">
          <div style={{width:9,height:13,borderRadius:5,border:"1.5px solid rgba(195,135,55,0.28)",position:"relative",overflow:"hidden"}}>
            <div style={{width:3,height:3,borderRadius:"50%",background:"rgba(195,135,55,0.55)",position:"absolute",left:"50%",transform:"translateX(-50%)",top:2,animation:"drift 1.8s ease-in-out infinite"}}/>
          </div>
          <span style={{color:"rgba(170,110,40,0.3)",fontSize:7.5,letterSpacing:"0.2em",textTransform:"uppercase",fontWeight:500}}>scroll</span>
        </div>
      )}
    </div>
  );
}