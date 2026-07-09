// B"H
/** @file ProceduralAnimalSurface.js @description One-piece procedural animal surface, not a SphereGeometry bead. */
import * as THREE from "/games/mitzvahWorld/systems/three/AwtsmoosThreeGateway.js";
const CACHE = new Map();
function torsoOf(profile) { const body = profile?.body || {}; return body.torso || [.75,.38,1.15]; }
function push(v,x,y,z){v.push(x,y,z);} function idx(i,a,b,c){i.push(a,b,c);}
export function proceduralAnimalGeometry(species = "animal", profile = {}) {
  const key = `${species}:awtsmoos_one_piece_surface`; if (CACHE.has(key)) return CACHE.get(key);
  const torso = torsoOf(profile), vertices = [], indices = [], rings = 8, cols = 16;
  for (let r=0;r<=rings;r++){const vv=r/rings,phi=-Math.PI/2+vv*Math.PI;for(let c=0;c<cols;c++){const u=c/cols,theta=u*Math.PI*2;push(vertices,Math.cos(phi)*Math.cos(theta)*torso[0],.42+Math.sin(phi)*torso[1],Math.cos(phi)*Math.sin(theta)*torso[2]);}}
  for (let r=0;r<rings;r++) for(let c=0;c<cols;c++){const a=r*cols+c,b=r*cols+(c+1)%cols,d=(r+1)*cols+c,e=(r+1)*cols+(c+1)%cols;idx(indices,a,d,b);idx(indices,b,d,e);}
  const headBase=vertices.length/3; [[0,.55,torso[2]*.85],[.22,.46,torso[2]*.55],[-.22,.46,torso[2]*.55],[0,.28,torso[2]*.55],[0,.44,torso[2]*1.16]].forEach(p=>push(vertices,...p));
  idx(indices,headBase,headBase+1,headBase+4); idx(indices,headBase+2,headBase,headBase+4); idx(indices,headBase+3,headBase+2,headBase+4); idx(indices,headBase+1,headBase+3,headBase+4);
  const geometry = new THREE.BufferGeometry(); geometry.setAttribute("position", new THREE.Float32BufferAttribute(vertices,3)); geometry.setIndex(indices); geometry.computeVertexNormals(); geometry.computeBoundingSphere();
  geometry.name = `awtsmoos_one_piece_${species}_surface_geometry`; geometry.userData = { oldScalarAnimalSurface:false, useAnimalBodyForge:false, singleMeshAnimal:true, notSphereChain:true };
  CACHE.set(key, geometry); return geometry;
}
export default proceduralAnimalGeometry;
