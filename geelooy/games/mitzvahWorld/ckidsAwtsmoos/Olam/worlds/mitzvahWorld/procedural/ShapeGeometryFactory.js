// B"H
/**
 * @file ShapeGeometryFactory.js
 * @description Star, arc, polygon, and ring shapes for JSON-born worlds.
 *
 * Every point is a small decree. The Awtsmoos gathers decrees into a star,
 * bends a path into an arc, and lets a cutscene road become geometry without a
 * hand-written mesh class for every dream.
 */
import * as THREE from "/games/scripts/build/three.module.js";

/**
 * Reads a number with a fallback.
 *
 * @param {*} value Candidate number.
 * @param {number} fallback Fallback number.
 * @returns {number} Safe number.
 */
function n(value, fallback = 0) { return Number.isFinite(Number(value)) ? Number(value) : fallback; }

/**
 * Creates a flat star shape.
 *
 * @param {object} options Star options.
 * @returns {THREE.ExtrudeGeometry} Star geometry.
 */
export function starGeometry(options = {}) {
  const points = Math.max(3, Math.floor(n(options.points, 6)));
  const outer = n(options.outerRadius, n(options.radius, 2));
  const inner = n(options.innerRadius, outer * .46);
  const depth = n(options.depth, .12);
  const shape = new THREE.Shape();
  for (let i = 0; i <= points * 2; i += 1) {
    const radius = i % 2 ? inner : outer;
    const angle = -Math.PI / 2 + i / (points * 2) * Math.PI * 2;
    const x = Math.cos(angle) * radius, y = Math.sin(angle) * radius;
    if (i === 0) shape.moveTo(x, y); else shape.lineTo(x, y);
  }
  return new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled:Boolean(options.bevel), bevelThickness:.03, bevelSize:.03, bevelSegments:1 });
}

/**
 * Creates an arc tube geometry from JSON options.
 *
 * @param {object} options Arc options.
 * @returns {THREE.TubeGeometry} Arc geometry.
 */
export function arcGeometry(options = {}) {
  const radius = n(options.radius, 4), start = n(options.start, 0), end = n(options.end, Math.PI);
  const y = n(options.y, 0), segments = Math.max(8, Math.floor(n(options.segments, 32)));
  const points = Array.from({ length:segments + 1 }, (_, i) => {
    const a = start + (end - start) * i / segments;
    return new THREE.Vector3(Math.cos(a) * radius, y, Math.sin(a) * radius);
  });
  return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points), segments, n(options.thickness, .08), 8, false);
}

/**
 * Creates a polygon extrusion.
 *
 * @param {object} options Polygon options.
 * @returns {THREE.ExtrudeGeometry} Polygon geometry.
 */
export function polygonGeometry(options = {}) {
  const sides = Math.max(3, Math.floor(n(options.sides, 6)));
  const radius = n(options.radius, 1), depth = n(options.depth, .1);
  const shape = new THREE.Shape();
  for (let i = 0; i <= sides; i += 1) {
    const a = -Math.PI / 2 + i / sides * Math.PI * 2, x = Math.cos(a) * radius, y = Math.sin(a) * radius;
    if (i === 0) shape.moveTo(x, y); else shape.lineTo(x, y);
  }
  return new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled:false });
}

/**
 * Creates any supported shape geometry.
 *
 * @param {string} type Shape type.
 * @param {object} options Shape options.
 * @returns {THREE.BufferGeometry|null} Geometry or null.
 */
export function shapeGeometry(type, options = {}) {
  const key = String(type || "").toLowerCase();
  if (key === "star" || key === "starshape") return starGeometry(options);
  if (key === "arc" || key === "arctube") return arcGeometry(options);
  if (key === "polygon") return polygonGeometry(options);
  if (key === "ring") return new THREE.TorusGeometry(n(options.radius, 2), n(options.thickness, .08), 8, Math.max(12, n(options.segments, 40)));
  return null;
}

export default shapeGeometry;
