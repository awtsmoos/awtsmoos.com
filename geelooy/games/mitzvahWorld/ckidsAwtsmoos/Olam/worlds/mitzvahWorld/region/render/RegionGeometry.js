// B"H
/** @file RegionGeometry.js @description Organic utility geometry without tree blobs or optional-chain parser storms. */
import * as THREE from "/games/scripts/build/three.module.js";
const cache = new Map();
function leafletGeometry() {
  const s = new THREE.Shape();
  s.moveTo(0, .58); s.bezierCurveTo(.38, .35, .44, -.22, 0, -.58); s.bezierCurveTo(-.44, -.22, -.38, .35, 0, .58);
  const g = new THREE.ShapeGeometry(s, 8); g.computeVertexNormals(); return g;
}
function grassTuftGeometry() {
  const g = new THREE.BufferGeometry(); const p = []; const indices = [];
  for (let i=0; i<7; i++) { const a=i*.9,w=.025+i*.003,h=.65+(i%3)*.17,b=(i-3)*.035,start=p.length/3; p.push(-w,0,0,w,0,0,b,h,Math.sin(a)*.045); indices.push(start,start+1,start+2); }
  g.setAttribute("position", new THREE.Float32BufferAttribute(p, 3)); g.setIndex(indices); g.computeVertexNormals(); return g;
}
function organicBush() {
  const g = new THREE.SphereGeometry(.55, 14, 10); const a = g.attributes.position;
  for (let i=0; i<a.count; i++) { const x=a.getX(i), y=a.getY(i), z=a.getZ(i), n=1+.12*Math.sin(x*11+y*7+z*13); a.setXYZ(i, x*n, y*(.72+.08*n), z*n); }
  a.needsUpdate = true; g.computeVertexNormals(); return g;
}
function rock() {
  const g = new THREE.IcosahedronGeometry(.55, 2); const a = g.attributes.position;
  for (let i=0; i<a.count; i++) { const x=a.getX(i), y=a.getY(i), z=a.getZ(i), n=.82+.28*Math.sin(x*8+y*5+z*9); a.setXYZ(i, x*n, y*n*.72, z*n); }
  a.needsUpdate = true; g.computeVertexNormals(); return g;
}
export function regionGeometry(kind = "box") {
  if (cache.has(kind)) return cache.get(kind); let g;
  if (kind === "blade") g = new THREE.PlaneGeometry(.09, 1, 1, 2);
  else if (kind === "grassTuft") g = grassTuftGeometry();
  else if (kind === "leaflet" || kind === "leafCard") g = leafletGeometry();
  else if (kind === "flower") g = new THREE.SphereGeometry(.5, 10, 7);
  else if (kind === "stem") g = new THREE.CylinderGeometry(.08, .08, 1, 7);
  else if (kind === "rock") g = rock();
  else if (kind === "canopy") g = organicBush();
  else g = new THREE.BoxGeometry(1, 1, 1);
  g.computeBoundingBox(); g.computeBoundingSphere(); cache.set(kind, g); return g;
}
export function geometryStats() { return { geometries:cache.size, legacyTreeBlobs:false, noOptionalChain:true }; }
