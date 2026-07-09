// B"H
import { createPrimitiveMesh, primitiveColliders } from './Box3D.js';
import { add, cross, dot, normalize, scale, sub, transformPoint, v } from '../math/Geometry3D.js';
import { tallDoorDef } from './DoorwaySpecs.js';

const CLOSED = 0, OPEN = -Math.PI * .58;

/** DynamicDoor3D: exact doorway seal, tapped by ray, screen box, or near soul. */
export class DynamicDoor3D {
  constructor(def = tallDoorDef()) { this.def = def; this.state = 'closed'; this.t = 0; this.hovered = false; this.context = {}; this.lastScreenBox = null; this.mesh = createPrimitiveMesh(this.localMeshDef()); this.mesh.name = `${def.id}-dynamic-door`; this.setPose(CLOSED); }
  setInteractionContext(context = {}) { this.context = context; return this; }
  install(canvas, camera) { canvas.addEventListener('pointermove', e => this.pointer(e, camera, false)); canvas.addEventListener('pointerdown', e => this.pointer(e, camera, true)); return this; }
  pointer(e, camera, click) { if (e.pointerType !== 'mouse' && !click) return; const hit = this.pointerHit(e, camera, click); this.setHover(hit && e.pointerType === 'mouse'); if (click && hit) { e.preventDefault(); e.stopPropagation(); this.toggle(); } }
  pointerHit(e, camera, click) { const ray = rayFromPointer(e, camera, e.currentTarget, this.context.getCameraTarget?.()); return this.hitTest(ray) || this.screenHit(e, camera, e.currentTarget) || (click && this.nearPlayer()); }
  toggle() { if (this.state === 'closed') this.state = 'opening'; else if (this.state === 'open') this.state = 'closing'; }
  update(dt) { const s = 1.75; if (this.state === 'opening') this.t = Math.min(1, this.t + dt * s); if (this.state === 'closing') this.t = Math.max(0, this.t - dt * s); if (this.t >= 1) this.state = 'open'; if (this.t <= 0) this.state = 'closed'; this.setPose(CLOSED + (OPEN - CLOSED) * ease(this.t)); }
  activeColliders() { return this.state === 'closed' ? primitiveColliders(this.colliderDef(CLOSED)) : []; }
  setHover(on) { this.hovered = !!on; this.mesh.material.color = this.hovered ? [1, .78, .26, 1] : [.42, .24, .12, 1]; }
  setPose(angle) { const yaw = this.def.yaw + angle, c = this.centerFor(yaw); this.mesh.position.set(c.x, c.y, c.z); this.mesh.quaternion.set(0, Math.sin(yaw / 2), 0, Math.cos(yaw / 2)); }
  centerFor(yaw) { const h = this.hingeWorld(), right = v(Math.cos(yaw), 0, Math.sin(yaw)); return add(h, scale(right, this.def.width / 2)); }
  hingeWorld() { return transformPoint(v(-this.def.width / 2, this.def.centerY, this.def.depth || 0), this.def.position, this.def.yaw); }
  localMeshDef() { return { id: `${this.def.id}-local-door`, shape: 'box', color: '#6b3d1e', position: v(0, 0, 0), size: { x: this.def.width, y: this.def.height, z: this.def.thickness }, rotation: { y: 0 } }; }
  colliderDef(angle = CLOSED) { const yaw = this.def.yaw + angle, c = this.centerFor(yaw); return { id: `${this.def.id}-door`, shape: 'box', solid: true, walkable: false, color: '#6b3d1e', position: c, size: { x: this.def.width, y: this.def.height, z: this.def.thickness }, rotation: { y: yaw } }; }
  hitTest(ray) { const yaw = this.yaw(), c = this.centerFor(yaw), n = v(Math.sin(yaw), 0, -Math.cos(yaw)); const den = dot(ray.dir, n); if (Math.abs(den) < .0001) return false; const d = dot(sub(c, ray.origin), n) / den; if (d < .1 || d > 60) return false; const p = add(ray.origin, scale(ray.dir, d)), local = sub(p, c), right = v(Math.cos(yaw), 0, Math.sin(yaw)); return Math.abs(dot(local, right)) <= this.def.width / 2 + .12 && Math.abs(local.y) <= this.def.height / 2 + .12; }
  screenHit(e, camera, canvas) { const box = this.screenBox(camera, canvas); this.lastScreenBox = box; return !!box && e.clientX >= box.x0 && e.clientX <= box.x1 && e.clientY >= box.y0 && e.clientY <= box.y1; }
  screenBox(camera, canvas) { const pts = this.corners(), out = pts.map(p => project(p, camera, canvas, this.context.getCameraTarget?.())).filter(Boolean); if (out.length < 2) return null; const pad = Math.max(28, Math.min(80, canvas.clientWidth * .045)); return { x0: Math.min(...out.map(p => p.x)) - pad, x1: Math.max(...out.map(p => p.x)) + pad, y0: Math.min(...out.map(p => p.y)) - pad, y1: Math.max(...out.map(p => p.y)) + pad }; }
  corners() { const yaw = this.yaw(), c = this.centerFor(yaw), r = v(Math.cos(yaw), 0, Math.sin(yaw)), pts = []; for (const sx of [-1, 1]) for (const sy of [-1, 1]) pts.push(add(add(c, scale(r, sx * this.def.width / 2)), v(0, sy * this.def.height / 2, 0))); return pts; }
  nearPlayer() { const p = this.context.getPlayerPosition?.(); if (!p) return false; const c = this.centerFor(this.def.yaw); return Math.hypot(p.x - c.x, p.z - c.z) <= 5.5; }
  yaw() { return this.def.yaw + (OPEN - CLOSED) * ease(this.t); }
  debug() { return { state: this.state, width: this.def.width, height: this.def.height, opening: this.def.opening, colliders: this.activeColliders().length, screenBox: this.lastScreenBox }; }
}
export const highDoorDef = tallDoorDef;
function rayFromPointer(e, camera, canvas, targetHint) { const rect = canvas.getBoundingClientRect(), nx = ((e.clientX - rect.left) / rect.width) * 2 - 1, ny = 1 - ((e.clientY - rect.top) / rect.height) * 2; const basis = cameraBasis(camera, targetHint), tan = Math.tan((camera.fov || 45) * Math.PI / 360); return { origin: basis.o, dir: normalize(add(add(basis.f, scale(basis.r, nx * tan * (camera.aspect || 1))), scale(basis.u, ny * tan))) }; }
function project(p, camera, canvas, targetHint) { const b = cameraBasis(camera, targetHint), d = sub(p, b.o), z = dot(d, b.f); if (z <= .05) return null; const tan = Math.tan((camera.fov || 45) * Math.PI / 360), x = dot(d, b.r) / (z * tan * (camera.aspect || 1)), y = dot(d, b.u) / (z * tan); return { x: (x + 1) * .5 * canvas.clientWidth, y: (1 - y) * .5 * canvas.clientHeight }; }
function cameraBasis(camera, targetHint) { const o = v(camera.position.x, camera.position.y, camera.position.z), t = targetOf(targetHint || camera.target); const f = normalize(sub(t, o)), r = normalize(cross(f, v(0, 1, 0))), u = normalize(cross(r, f)); return { o, f, r, u }; }
function targetOf(t) { if (Array.isArray(t)) return v(t[0] || 0, t[1] || 0, t[2] || 0); return v(t?.x || 0, t?.y || 0, t?.z || 0); }
function ease(t) { return t * t * (3 - 2 * t); }
