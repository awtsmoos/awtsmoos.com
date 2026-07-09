// B"H
import { Ray } from '../math/Ray.js';

/** Orbit camera: full yaw, broad pitch, far wheel/pinch zoom, triangle ray clip. */
export class CameraOrbitController {
  constructor(canvas, { distance = 7, pitch = 0.36, yaw = Math.PI, min = 1.35, max = 48 } = {}) {
    Object.assign(this, { canvas, distance, pitch, yaw, min, max });
    this.pointers = new Map();
    this.drag = null;
    this.pinch = null;
    this.pinchReady = true;
    this.bind();
  }

  bind() {
    this.canvas.style.touchAction = 'none';
    this.canvas.addEventListener('pointerdown', (e) => this.down(e));
    this.canvas.addEventListener('pointermove', (e) => this.move(e));
    this.canvas.addEventListener('pointerup', (e) => this.up(e));
    this.canvas.addEventListener('pointercancel', (e) => this.up(e));
    this.canvas.addEventListener('wheel', (e) => this.wheel(e), { passive: false });
  }

  down(e) { this.canvas.setPointerCapture?.(e.pointerId); this.pointers.set(e.pointerId, point(e)); this.beginGesture(e); }
  up(e) { this.pointers.delete(e.pointerId); this.drag = null; this.pinch = null; if (this.pointers.size === 1) this.beginSingle([...this.pointers.values()][0]); }
  move(e) { if (!this.pointers.has(e.pointerId)) return; this.pointers.set(e.pointerId, point(e)); this.pointers.size > 1 ? this.updatePinch() : this.updateDrag(e); }
  wheel(e) { e.preventDefault(); this.distance = clamp(this.distance * Math.exp(e.deltaY * 0.001), this.min, this.max); }

  beginGesture(e) { this.pointers.size > 1 ? this.beginPinch() : this.beginSingle(point(e)); }
  beginSingle(p) { this.drag = { x: p.x, y: p.y, yaw: this.yaw, pitch: this.pitch }; }
  beginPinch() { const [a, b] = [...this.pointers.values()]; this.pinch = { distance: dist(a, b), cameraDistance: this.distance }; }
  updateDrag(e) { if (!this.drag) return; this.yaw = this.drag.yaw - (e.clientX - this.drag.x) * 0.007; this.pitch = clamp(this.drag.pitch + (e.clientY - this.drag.y) * 0.006, -1.35, 1.42); }
  updatePinch() { if (!this.pinch) this.beginPinch(); const [a, b] = [...this.pointers.values()]; this.distance = clamp(this.pinch.cameraDistance * (this.pinch.distance / Math.max(18, dist(a, b))), this.min, this.max); }

  forward() { return { x: Math.sin(this.yaw), z: Math.cos(this.yaw) }; }
  right() { return { x: Math.cos(this.yaw), z: -Math.sin(this.yaw) }; }

  apply(camera, target, octree) {
    const cp = Math.cos(this.pitch), desired = { x: target.x - Math.sin(this.yaw) * this.distance * cp, y: target.y + Math.sin(this.pitch) * this.distance, z: target.z - Math.cos(this.yaw) * this.distance * cp };
    const eye = this.clipCamera(target, desired, octree);
    camera.position.set(eye.x, eye.y, eye.z);
    camera.target = [target.x, target.y, target.z];
  }

  clipCamera(target, desired, octree) {
    if (!octree) return desired;
    const dir = { x: desired.x - target.x, y: desired.y - target.y, z: desired.z - target.z };
    const len = Math.hypot(dir.x, dir.y, dir.z) || 1;
    const hit = octree.raycast(new Ray(target, dir), len);
    if (!hit) return desired;
    const safe = Math.max(0.75, hit.distance - 0.42);
    return { x: target.x + dir.x / len * safe, y: target.y + dir.y / len * safe, z: target.z + dir.z / len * safe };
  }
}
function point(e) { return { x: e.clientX, y: e.clientY }; }
function dist(a, b) { return Math.hypot(a.x - b.x, a.y - b.y); }
function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }
