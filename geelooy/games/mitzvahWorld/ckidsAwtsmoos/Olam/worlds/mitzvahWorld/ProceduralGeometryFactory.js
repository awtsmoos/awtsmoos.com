// B"H
/** @file ProceduralGeometryFactory.js @description Deterministic procedural primitives, parser-clear seed handling. */
import * as THREE from "/games/scripts/build/three.module.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
class RNG { constructor(seed = 123) { this.seed = seed >>> 0; } next() { this.seed = (1664525 * this.seed + 1013904223) >>> 0; return this.seed / 4294967296; } range(a, b) { return a + (b - a) * this.next(); } }
function optSeed(options) { return options && options.seed !== undefined ? options.seed : 123; }
function opt(options, key, fallback) { return options && options[key] !== undefined ? options[key] : fallback; }
export class ProceduralGeometryFactory {
  static createGrass(options = {}) { const rng = new RNG(optSeed(options)); const count = opt(options, "count", 7), height = opt(options, "height", 1); const g = new THREE.BufferGeometry(), p = [], idx = []; for (let i=0;i<count;i++) { const a=rng.range(0,Math.PI*2), r=rng.range(.02,.1), h=height*rng.range(.65,1.35), s=p.length/3; p.push(-r,0,0,r,0,0,Math.cos(a)*r*.8,h,Math.sin(a)*r*.8); idx.push(s,s+1,s+2); } g.setAttribute("position", new THREE.Float32BufferAttribute(p,3)); g.setIndex(idx); g.computeVertexNormals(); return g; }
  static createTube(options = {}) { const path = options.path || []; const radius = opt(options, "radius", .1); if (path.length < 2) return new THREE.CylinderGeometry(radius, radius, 1, 8); const curve = new THREE.CatmullRomCurve3(path); return new THREE.TubeGeometry(curve, opt(options,"segments",24), radius, opt(options,"radialSegments",8), false); }
}
