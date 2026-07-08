// B"H
/**
 * @file GeometryModifiers.js
 * @description Parser-clear geometry transformations: scale, array, mirror, extrude, translate, rotate, center, deterministic noise.
 */
import * as THREE from "/games/scripts/build/three.module.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import * as BufferGeometryUtils from "/games/scripts/jsm/utils/BufferGeometryUtils.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
function list(value) { return Array.isArray(value) ? value : []; }
function vector(value, resolve, fallback = [0,0,0]) { return list(value || fallback).map(resolve); }
function hash(index, salt) { const v = Math.sin(index * 12.9898 + salt * 78.233) * 43758.5453; return v - Math.floor(v); }
function merge(listOfGeometry) { return BufferGeometryUtils.mergeGeometries(listOfGeometry, false) || listOfGeometry[0]; }
export class GeometryModifiers {
  static applyModifiers(geometry, modifiers = [], resolveFn = value => value) { let current = geometry.clone(); for (const mod of modifiers || []) current = this.applyOne(current, mod, resolveFn); return current; }
  static applyOne(geometry, mod, resolve) { const type = resolve(mod.type), p = mod.params || {}; if (type === "scaleMesh") return this.scaleMesh(geometry, vector(p.scale, resolve, [1,1,1])); if (type === "array") return this.array(geometry, resolve(p.count || 1), vector(p.offset, resolve)); if (type === "mirror") return this.mirror(geometry, resolve(p.axis || "x")); if (type === "extrude") return this.extrude(geometry, resolve(p.amount || 0), resolve(p.axis || "y"), resolve(p.threshold || .001)); if (type === "translateVertex") return this.translateVertex(geometry, vector(p.boundsMin, resolve, [-1,-1,-1]), vector(p.boundsMax, resolve, [1,1,1]), vector(p.translation, resolve)); if (type === "rotateMesh") { const r = vector(p.rotation, resolve); geometry.rotateX(r[0]); geometry.rotateY(r[1]); geometry.rotateZ(r[2]); return geometry; } if (type === "translateMesh") { const t = vector(p.position, resolve); geometry.translate(t[0], t[1], t[2]); return geometry; } if (type === "centerMesh") { geometry.center(); return geometry; } if (type === "noise") return this.noise(geometry, resolve(p.amount || .1)); return geometry; }
  static scaleMesh(geometry, scale) { geometry.scale(scale[0], scale[1], scale[2]); return geometry; }
  static array(geometry, count, offset) { const geos = []; for (let i=0; i<count; i++) { const cloned = geometry.clone(); cloned.translate(offset[0]*i, offset[1]*i, offset[2]*i); geos.push(cloned); } return merge(geos); }
  static mirror(geometry, axis) { const cloned = geometry.clone(); if (axis === "x") cloned.scale(-1,1,1); else if (axis === "y") cloned.scale(1,-1,1); else cloned.scale(1,1,-1); this.flipNormals(cloned); return merge([geometry, cloned]); }
  static extrude(geometry, amount, axis, threshold) { const pos = geometry.attributes.position; for (let i=0; i<pos.count; i++) { const val = axis === "x" ? pos.getX(i) : axis === "y" ? pos.getY(i) : pos.getZ(i); if (val > threshold) this.setAxis(pos, i, axis, val + amount); else if (val < -threshold) this.setAxis(pos, i, axis, val - amount); } pos.needsUpdate = true; geometry.computeVertexNormals(); return geometry; }
  static translateVertex(geometry, min, max, move) { const pos = geometry.attributes.position; for (let i=0; i<pos.count; i++) { const x=pos.getX(i), y=pos.getY(i), z=pos.getZ(i); if (x>=min[0] && x<=max[0] && y>=min[1] && y<=max[1] && z>=min[2] && z<=max[2]) pos.setXYZ(i, x+move[0], y+move[1], z+move[2]); } pos.needsUpdate = true; geometry.computeVertexNormals(); return geometry; }
  static noise(geometry, amount) { const pos = geometry.attributes.position; for (let i=0; i<pos.count; i++) pos.setXYZ(i, pos.getX(i)+(hash(i,1)-.5)*amount, pos.getY(i)+(hash(i,2)-.5)*amount, pos.getZ(i)+(hash(i,3)-.5)*amount); pos.needsUpdate = true; geometry.computeVertexNormals(); return geometry; }
  static setAxis(pos, i, axis, value) { if (axis === "x") pos.setX(i, value); else if (axis === "y") pos.setY(i, value); else pos.setZ(i, value); }
  static flipNormals(geometry) { if (geometry.index) { const index = geometry.index.array; for (let i=0; i<index.length; i+=3) { const t=index[i+1]; index[i+1]=index[i+2]; index[i+2]=t; } } geometry.computeVertexNormals(); }
}
