// B"H
/**
 * @file RegionGeometry.js
 * @description Chapter 997: trees gain translated leaflets and grass gains seed heads.
 */
import * as THREE from "/games/scripts/build/three.module.js";
const cache = new Map();
function leafletGeometry() {
  const shape = new THREE.Shape();
  shape.moveTo(0, .55); shape.bezierCurveTo(.42, .32, .42, -.26, 0, -.55); shape.bezierCurveTo(-.42, -.26, -.42, .32, 0, .55);
  const g = new THREE.ShapeGeometry(shape, 6); g.computeBoundingBox(); g.computeBoundingSphere(); return g;
}
function grassTuftGeometry() {
  const g = new THREE.BufferGeometry();
  const pts = [-.18,0,0, -.04,1,0, .04,0,0,  .02,0,0, .18,.88,.02, .1,0,0,  -.1,0,.02, -.28,.72,0, -.18,0,.02];
  g.setAttribute("position", new THREE.Float32BufferAttribute(pts, 3)); g.computeBoundingBox(); g.computeBoundingSphere(); return g;
}
export function regionGeometry(kind = "box") {
  if (cache.has(kind)) return cache.get(kind);
  const g = kind === "blade" ? new THREE.PlaneGeometry(.09, 1, 1, 1)
    : kind === "grassTuft" ? grassTuftGeometry()
    : kind === "leaflet" ? leafletGeometry()
    : kind === "leafCard" ? new THREE.PlaneGeometry(1.2, 1.05, 1, 1)
    : kind === "flower" ? new THREE.SphereGeometry(.5, 8, 5)
    : kind === "stem" ? new THREE.CylinderGeometry(.08, .08, 1, 6)
    : kind === "rock" ? new THREE.SphereGeometry(.5, 10, 7)
    : kind === "trunk" ? new THREE.CylinderGeometry(.5, .65, 1, 8)
    : kind === "canopy" ? new THREE.DodecahedronGeometry(.55, 0)
    : kind === "road" ? new THREE.BoxGeometry(1, 1, 1)
    : kind === "cone" ? new THREE.ConeGeometry(.5, 1, 10)
    : new THREE.BoxGeometry(1, 1, 1);
  g.computeBoundingBox(); g.computeBoundingSphere(); cache.set(kind, g); return g;
}
export function geometryStats() { return { geometries: cache.size }; }
