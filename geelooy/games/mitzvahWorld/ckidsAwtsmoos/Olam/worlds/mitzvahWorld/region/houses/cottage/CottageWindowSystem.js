// B"H
/** @file CottageWindowSystem.js @description Cottage frame, sill, shutters, glass, and night-glow metadata. */
import * as THREE from "/games/scripts/build/three.module.js";
import { COTTAGE_BRICK_PALETTE as P } from "../CottageBrickPalette.js";
function mat(color){ return new THREE.MeshLambertMaterial({ color, transparent:false, opacity:1, depthWrite:true, depthTest:true }); }
function box(name,size,pos,color,data={}){ const m=new THREE.Mesh(new THREE.BoxGeometry(...size),mat(color)); m.name=name; m.position.set(...pos); Object.assign(m.userData||={},data,{cottageWindowPart:true,opacitySealed:true}); return m; }
function frontWindow(root, house, win, i, spec){ const z=(spec.depth||house.sz||5.4)/2+.12, x=win.x||0, y=win.y||1.8; root.add(box(`${house.id}_window_frame_${i}`,[.72,.58,.09],[x,y,z],P.window.frame,{windowFrame:true})); root.add(box(`${house.id}_window_glass_${i}`,[.5,.36,.1],[x,y,z+.01],P.window.glass,{windowGlass:true, visualOnly:true, nightGlowSocket:true})); root.add(box(`${house.id}_window_sill_${i}`,[.82,.08,.18],[x,y-.34,z+.02],P.window.sill,{windowSill:true})); root.add(box(`${house.id}_shutter_l_${i}`,[.12,.56,.08],[x-.47,y,z+.01],P.window.frame,{shutter:true})); root.add(box(`${house.id}_shutter_r_${i}`,[.12,.56,.08],[x+.47,y,z+.01],P.window.frame,{shutter:true})); }
export function buildCottageWindows(house={}, spec={}){ const root=new THREE.Group(); root.name=`cottage_window_system_${house.id}`; const windows=house.windows?.length ? house.windows : [{side:"front",x:-1.5,y:1.8},{side:"front",x:1.5,y:1.8}]; windows.filter(w=>!w.side || w.side==="front").forEach((w,i)=>frontWindow(root,house,w,i,spec)); root.userData.windowCount=root.children.length; return root; }
export default buildCottageWindows;
