// B"H
import { Group } from '../../../light-three-gltf/tiny-runtime.js';
import { createPrimitiveMesh, primitiveColliders } from './Box3D.js';
import { add, cross, dot, normalize, scale, sub, transformPoint, v } from '../math/Geometry3D.js';
import { tallDoorDef } from './DoorwaySpecs.js';
const CLOSED = 0;

/** Hinged textured door: cached colliders, exact closed pose, optional module open angle. */
export class DynamicDoor3D {
  constructor(def = tallDoorDef()) { this.def = def; this.t = 0; this.state = 'closed'; this.hovered = false; this.context = {}; this.lastHitMode = 'none'; this.lastScreenBox = null; this.lastHit = null; this.mesh = new Group(); this.mesh.name = `${def.id}-hinge`; this.panel = createPrimitiveMesh(this.panelDef()); this.panel.name = `${def.id}-dynamic-door`; this.mesh.add(this.panel); this.closedColliders = primitiveColliders(this.colliderDef(CLOSED)); this.setPose(CLOSED); }
  setInteractionContext(context = {}) { this.context = context; return this; }
  install(canvas, camera) { canvas.addEventListener('pointermove', e => this.pointer(e, camera, false)); canvas.addEventListener('pointerdown', e => this.pointer(e, camera, true)); return this; }
  pointer(e, camera, click) { if (e.pointerType !== 'mouse' && !click) return; const hit = this.pointerHit(e, camera); this.setHover(hit && e.pointerType === 'mouse'); if (click && hit) { e.preventDefault(); e.stopPropagation(); e.stopImmediatePropagation?.(); this.toggle(); } }
  pointerHit(e, camera) { this.lastHitMode = 'none'; this.lastHit = null; if (!this.clickable()) return false; const canvas = e.currentTarget || this.context.canvas; const ray = rayFromPointer(e, camera, canvas, this.context.getCameraTarget?.()); if (this.hitTest(ray)) return hit(this, 'ray-current-pose'); if (this.screenHit(e, camera, canvas)) return hit(this, 'screen-current-pose'); return false; }
  clickable() { return this.state === 'closed' || this.state === 'open'; }
  toggle() { if (this.state === 'closed') this.state = 'opening'; else if (this.state === 'open') this.state = 'closing'; }
  update(dt) { const speed = 2.15; if (this.state === 'opening') this.t = Math.min(1, this.t + dt * speed); if (this.state === 'closing') this.t = Math.max(0, this.t - dt * speed); if (this.t >= 1) this.state = 'open'; if (this.t <= 0) this.state = 'closed'; this.setPose(this.currentAngle()); }
  activeColliders() { return this.state === 'closed' ? this.closedColliders : []; }
  setHover(on) { this.hovered = !!on; this.panel.material.color = this.hovered ? [1, .78, .26, 1] : colorArray(this.def.color || '#6b3d1e'); }
  setPose(angle) { const hinge = this.hingeWorld(); const yaw = this.def.yaw + angle; this.mesh.position.set(hinge.x, hinge.y || 0, hinge.z); this.mesh.quaternion.set(0, Math.sin(yaw / 2), 0, Math.cos(yaw / 2)); }
  panelDef() { return { id: `${this.def.id}-panel`, shape: 'box', color: this.def.color || '#6b3d1e', mapImage: this.def.mapImage || null, textureUrl: this.def.textureUrl || null, mapRepeat: this.def.mapRepeat || [1, 1], position: v(this.def.width / 2, this.def.centerY, 0), size: { x: this.def.width, y: this.def.height, z: this.def.thickness }, rotation: { y: 0 } }; }
  colliderDef(angle = this.currentAngle()) { const yaw = this.def.yaw + angle, c = this.centerFor(yaw); return { id: `${this.def.id}-door`, shape: 'box', solid: true, walkable: false, color: this.def.color || '#6b3d1e', position: c, size: { x: this.def.width, y: this.def.height, z: this.def.thickness }, rotation: { y: yaw } }; }
  hitTest(ray) { const box = this.obb(), found = rayObb(ray, box); if (!found) return false; this.lastHit = { distance: found.t, state: this.state, angle: this.currentAngle(), center: box.center }; return true; }
  screenHit(e, camera, canvas) { const box = this.screenBox(camera, canvas); this.lastScreenBox = box; return !!box && e.clientX >= box.x0 && e.clientX <= box.x1 && e.clientY >= box.y0 && e.clientY <= box.y1; }
  screenBox(camera, canvas) { const out = this.corners().map(p => project(p, camera, canvas, this.context.getCameraTarget?.())).filter(Boolean); if (out.length < 2) return null; const pad = this.state === 'open' ? 22 : 9; return { x0: Math.min(...out.map(p => p.x)) - pad, x1: Math.max(...out.map(p => p.x)) + pad, y0: Math.min(...out.map(p => p.y)) - pad, y1: Math.max(...out.map(p => p.y)) + pad }; }
  corners() { const b = this.obb(), pts = []; for (const sx of [-1, 1]) for (const sy of [-1, 1]) for (const sz of [-1, 1]) pts.push(add(add(add(b.center, scale(b.right, sx * b.half.x)), scale(b.up, sy * b.half.y)), scale(b.forward, sz * b.half.z))); return pts; }
  obb() { const yaw = this.def.yaw + this.currentAngle(), right = v(Math.cos(yaw), 0, Math.sin(yaw)), forward = v(Math.sin(yaw), 0, -Math.cos(yaw)); return { center: this.centerFor(yaw), right, up: v(0, 1, 0), forward, half: { x: this.def.width / 2, y: this.def.height / 2, z: Math.max(this.def.thickness / 2, .12) } }; }
  centerFor(yaw) { const h = this.hingeWorld(), right = v(Math.cos(yaw), 0, Math.sin(yaw)), c = add(h, scale(right, this.def.width / 2)); c.y = (h.y || 0) + this.def.centerY; return c; }
  hingeWorld() { return transformPoint(v(-this.def.width / 2, 0, this.def.depth || 0), this.def.position, this.def.yaw); }
  currentAngle() { return CLOSED + ((this.def.openAngle ?? -Math.PI * .58) - CLOSED) * ease(this.t); }
  debug() { return { id: this.def.id, state: this.state, t: this.t, hitMode: this.lastHitMode, lastHit: this.lastHit, colliders: this.closedColliders.length, screenBox: this.lastScreenBox, obb: this.obb(), def: { position: this.def.position, yaw: this.def.yaw, depth: this.def.depth, openAngle: this.def.openAngle } }; }
}
export const highDoorDef = tallDoorDef;
function hit(door, mode) { door.lastHitMode = mode; return true; }
function rayObb(ray, b) { const dir = normalize(ray.dir); let t0 = 0.05, t1 = 80; for (const [axis, half] of [[b.right, b.half.x], [b.up, b.half.y], [b.forward, b.half.z]]) { const e = dot(axis, sub(b.center, ray.origin)), f = dot(dir, axis); if (Math.abs(f) < 0.00001) { if (-e - half > 0 || -e + half < 0) return null; continue; } let a = (e - half) / f, c = (e + half) / f; if (a > c) [a, c] = [c, a]; if (a > t0) t0 = a; if (c < t1) t1 = c; if (t0 > t1) return null; } return { t: t0 }; }
function rayFromPointer(e, camera, canvas, targetHint) { const rect = canvas.getBoundingClientRect(); const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1, ny = 1 - ((e.clientY - rect.top) / rect.height) * 2; const b = cameraBasis(camera, targetHint); const tan = Math.tan((camera.fov || 45) * Math.PI / 360); return { origin: b.o, dir: normalize(add(add(b.f, scale(b.r, nx * tan * (camera.aspect || 1))), scale(b.u, ny * tan))) }; }
function project(p, camera, canvas, targetHint) { const b = cameraBasis(camera, targetHint), d = sub(p, b.o), z = dot(d, b.f); if (z <= 0.05) return null; const tan = Math.tan((camera.fov || 45) * Math.PI / 360), x = dot(d, b.r) / (z * tan * (camera.aspect || 1)), y = dot(d, b.u) / (z * tan); return { x: (x + 1) * .5 * canvas.clientWidth, y: (1 - y) * .5 * canvas.clientHeight }; }
function cameraBasis(camera, targetHint) { const o = v(camera.position.x, camera.position.y, camera.position.z), f = normalize(sub(targetOf(targetHint || camera.target), o)), r = normalize(cross(f, v(0, 1, 0))), u = normalize(cross(r, f)); return { o, f, r, u }; }
function targetOf(t) { if (Array.isArray(t)) return v(t[0] || 0, t[1] || 0, t[2] || 0); return v(t?.x || 0, t?.y || 0, t?.z || 0); }
function colorArray(hex) { const n = parseInt(String(hex).replace('#', ''), 16); return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255, 1]; }
function ease(t) { return t * t * (3 - 2 * t); }
