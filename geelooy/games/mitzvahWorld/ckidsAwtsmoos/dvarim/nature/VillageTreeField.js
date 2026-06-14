// B"H
/**
 * @file VillageTreeField.js
 * @description
 * Chapter 431: orchards become authored families, not repeated sticks.
 * The Awtsmoos keeps the real leaf atlas system, adds roots, apples, varied
 * crowns, and terrain grounding so every tree reads as a living place.
 */
import Domem from "../../chayim/domem/index.js";
import * as THREE from "/games/scripts/build/three.module.js";
import TerrainMath from "../terrain/core/TerrainMath.js";
const LEAF_ATLAS = "/games/mitzvahWorld/assets/textures/village/leaf-atlas.png";
const n=(v,f=0)=>Number.isFinite(Number(v))?Number(v):f;
const rand=i=>{const x=Math.sin(i*12.9898)*43758.5453;return x-Math.floor(x);};
const TINTS=[0xd8f28a,0x9bd94f,0x67b53f,0x3f9637,0x2e7d32,0x1f5f24];
function terrainHeight(olam,x,z,f=0){ const law=olam?.awtsmoosTerrainLaw; if(law?.data) return n(law.position?.y)+TerrainMath.calculateHeightAt(x-n(law.position?.x),z-n(law.position?.z),law.data); return f; }
function texture(){ const tex=new THREE.TextureLoader().load(LEAF_ATLAS); tex.colorSpace=THREE.SRGBColorSpace; tex.wrapS=tex.wrapT=THREE.ClampToEdgeWrapping; tex.anisotropy=4; return tex; }
function mark(root){ root.traverse(o=>Object.assign(o.userData||={}, {skipOctree:true,noOctree:true,skipRaycast:true,villageDecor:true,useAuthoredY:true,realLeafAtlasTree:true})); }
function compose(mesh,i,p,q,s){ mesh.setMatrixAt(i,new THREE.Matrix4().compose(p,q,s)); }
function trunkGeometry(){ return new THREE.CylinderGeometry(.34,.58,4.2,9,3); }
function limbGeometry(){ return new THREE.CylinderGeometry(.075,.16,1,7,1); }
function rootGeometry(){ return new THREE.CylinderGeometry(.06,.18,1,7,1); }
function leafGeometry(tile=0){ const w=1.35,h=1.15,x0=(tile%4)/4,y0=Math.floor(tile/4)/2,x1=x0+.25,y1=y0+.5; const geo=new THREE.PlaneGeometry(w,h,1,1); geo.setAttribute("uv",new THREE.BufferAttribute(new Float32Array([x0,y1,x1,y1,x0,y0,x1,y0]),2)); return geo; }
function between(a,b){ const mid=a.clone().add(b).multiplyScalar(.5), dir=b.clone().sub(a); const q=new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0),dir.clone().normalize()); return {mid,q,len:dir.length()}; }
function point(i,seed,radius){ const angle=i*2.399963+seed*.77, ring=radius*Math.sqrt(rand(i+seed*17)); return {x:Math.cos(angle)*ring,z:Math.sin(angle)*ring*.72,angle}; }
function crown(i,c){ const angle=c*1.618+i*.41, ring=c<3?.25:.55+rand(i*100+c)*.95; return new THREE.Vector3(Math.cos(angle)*ring,3+rand(i*30+c)*1.65,Math.sin(angle)*ring*.86); }
function color(mesh,index,seed){ const c=new THREE.Color(TINTS[index%TINTS.length]); c.offsetHSL(.01*rand(seed),-.02,(rand(seed+3)-.5)*.08); mesh.setColorAt(index,c); }
function inst(geo,mat,count,name){ const m=new THREE.InstancedMesh(geo,mat,count); m.name=name; m.castShadow=false; m.receiveShadow=true; return m; }
export default class VillageTreeField extends Domem {
  type="villageTreeField";
  constructor(op={},olam){ super({...op,isSolid:false,interactable:false},olam); this.options=op; this.useAuthoredY=true; }
  async heescheel(olam){ const count=Math.max(1,Math.floor(n(this.options.count,64))), radius=n(this.options.radius,96), seed=n(this.options.seed,5), origin=this.position||{}; const trunks=inst(trunkGeometry(),new THREE.MeshLambertMaterial({color:0x6a4124}),count,"warm_tapered_orchard_trunks_varied"); const limbs=inst(limbGeometry(),new THREE.MeshLambertMaterial({color:0x57351d}),count*7,"visible_radial_tree_limbs"); const roots=inst(rootGeometry(),new THREE.MeshLambertMaterial({color:0x4a2b18}),count*5,"surface_roots_tree_to_ground"); const leaves=inst(leafGeometry(0),new THREE.MeshBasicMaterial({color:0xffffff,map:texture(),vertexColors:true,side:THREE.DoubleSide,transparent:true,alphaTest:.34}),count*26,"atlas_leaf_crossed_cards_crowns_varied"); const fruit=inst(new THREE.SphereGeometry(.08,7,5),new THREE.MeshLambertMaterial({color:0xd64b31}),Math.floor(count*.7),"orchard_fruit_small_red_dots"); let li=0,ci=0,ri=0,fi=0; for(let i=0;i<count;i++){ const pt=point(i,seed,radius), sc=.78+rand(i*9+seed)*.54, wx=n(origin.x)+pt.x, wz=n(origin.z)+pt.z, gy=terrainHeight(olam,wx,wz,n(this.options.groundY,0)); compose(trunks,i,new THREE.Vector3(pt.x,gy+2.1*sc,pt.z),new THREE.Quaternion().setFromEuler(new THREE.Euler(0,pt.angle,(rand(i)-.5)*.08)),new THREE.Vector3(sc*.9,sc,sc*.9)); const top=new THREE.Vector3(pt.x,gy+4.05*sc,pt.z); for(let b=0;b<7;b++){ const a=pt.angle+b*.897+rand(i*19+b)*.35, end=top.clone().add(new THREE.Vector3(Math.cos(a)*sc*(.8+rand(b)*.75),sc*(.35+rand(i+b)*.55),Math.sin(a)*sc*(.8+rand(b+2)*.75))); const seg=between(top.clone().add(new THREE.Vector3(0,-.28*sc,0)),end); compose(limbs,li++,seg.mid,seg.q,new THREE.Vector3(sc,seg.len,sc)); }
      for(let r=0;r<5;r++){ const a=pt.angle+r*1.256; compose(roots,ri++,new THREE.Vector3(pt.x+Math.cos(a)*.55,gy+.08,pt.z+Math.sin(a)*.55),new THREE.Quaternion().setFromEuler(new THREE.Euler(Math.PI/2,a,0)),new THREE.Vector3(sc,1.5*sc,sc)); }
      for(let c=0;c<26;c++){ const local=crown(i,c).multiplyScalar(sc), p=new THREE.Vector3(pt.x+local.x,gy+local.y,pt.z+local.z), q=new THREE.Quaternion().setFromEuler(new THREE.Euler((rand(c)-.5)*.7,pt.angle+c*1.11,(rand(i+c)-.5)*.9)), sx=(.72+rand(i*50+c)*.56)*sc; compose(leaves,ci,p,q,new THREE.Vector3(sx*1.18,sx,sx)); color(leaves,ci,i*70+c); ci++; if(c%17===0&&fi<fruit.count) compose(fruit,fi++,p,q,new THREE.Vector3(sc,sc,sc)); } }
    [trunks,limbs,roots,leaves,fruit].forEach(m=>{m.instanceMatrix.needsUpdate=true;if(m.instanceColor)m.instanceColor.needsUpdate=true;m.computeBoundingSphere?.();m.frustumCulled=true;}); this.mesh=new THREE.Group(); this.mesh.name=this.name||"VillageTreeField_real_leaf_atlas_orchard_complex"; this.mesh.position.set(n(origin.x),0,n(origin.z)); this.mesh.add(trunks,limbs,roots,leaves,fruit); Object.assign(this.mesh.userData||={}, {useAuthoredY:true,awtsmoosGrounding:{mode:"per-tree-terrain-law"},complexOrchard:true}); mark(this.mesh); await olam.hoyseef(this); this.isReady=true; }
}
