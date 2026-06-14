// B"H
/**
 * @file VillageHeroTree.js
 * @description
 * Chapter 80: the landmark tree receives roots, grounding, and a name.
 * The Awtsmoos keeps the real geelooy/libs heroTree forge, then wraps it with
 * terrain grounding metadata so no fake tree replaces the authored vessel.
 */
import Domem from "../../chayim/domem/index.js";
import * as THREE from "/games/scripts/build/three.module.js";
import TerrainMath from "../terrain/core/TerrainMath.js";
import { createHeroTree } from "../../../../../libs/awtsmoos3d/tree/heroTree.js?v=shader-tree-20260604-bh437";
const n=(v,f=0)=>Number.isFinite(Number(v))?Number(v):f;
function yAt(olam,x,z,f=0){ const law=olam?.awtsmoosTerrainLaw; if(!law?.data) return f; return n(law.position?.y)+TerrainMath.calculateHeightAt(x-n(law.position?.x),z-n(law.position?.z),law.data); }
function rootGeo(){ return new THREE.CylinderGeometry(.08,.2,1,8,1); }
function rootMat(){ return new THREE.MeshLambertMaterial({color:0x5b351c}); }
function addRoots(group,count=11){ const geo=rootGeo(), mat=rootMat(); for(let i=0;i<count;i++){ const a=i/count*Math.PI*2, r=1.35+(i%3)*.34; const m=new THREE.Mesh(geo,mat); m.name="hero_tree_visible_ground_root"; m.position.set(Math.cos(a)*r*.5,.08,Math.sin(a)*r*.5); m.scale.set(.8,2.7+(i%4)*.38,.8); m.rotation.set(Math.PI/2,a,0); group.add(m); } }
function mark(root){ root?.traverse?.(c=>Object.assign(c.userData||={}, {villageDecor:true,heroTree:true,skipRaycast:true,skipOctree:true,noOctree:true,useAuthoredY:true})); }
export default class VillageHeroTree extends Domem {
  type = "villageHeroTree";
  constructor(op = {}, olam) { super({ ...op, isSolid: false, interactable: false }, olam); this.options = op; this.useAuthoredY = true; }
  async heescheel(olam) {
    const x=n(this.position?.x,this.options.x||34), z=n(this.position?.z,this.options.z||34);
    const tree=createHeroTree({ scale:1.25, ...this.options }, { renderer: olam?.renderer });
    const root=new THREE.Group(); root.name=this.options.name||"VillageHeroTree_real_geelooy_libs_landmark";
    root.position.set(x,yAt(olam,x,z,n(this.options.groundY)),z); root.add(tree); addRoots(root,n(this.options.rootCount,13));
    Object.assign(root.userData||={}, {awtsmoosGrounding:{mode:"terrain-law",x,z}, landmarkTree:true}); mark(root);
    this.mesh=root; await olam.hoyseef(this); this.isReady = true;
  }
}
