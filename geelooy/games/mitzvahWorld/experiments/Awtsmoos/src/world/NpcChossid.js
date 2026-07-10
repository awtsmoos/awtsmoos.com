// B"H
import { Group } from '../../../light-three-gltf/tiny-runtime.js';
import { TinyAnimationPlayer } from '../../../light-three-gltf/tiny-animation.js';
import { createPrimitiveMesh } from './Box3D.js';
import { alignModelFeetToGround } from './GroundRay.js';
import { add, cross, dot, normalize, scale, sub, v } from '../math/Geometry3D.js';

/** NpcChossid: first click targets, second click opens the level dialogue. */
export class NpcChossid {
  constructor({ gltf, canvas, camera, bus, ground, name = 'Reb Mendel', x = -14.2, z = -18.2 }) {
    Object.assign(this, { canvas, camera, bus, ground, name, health: 100, selected: false, dialogueOpen: false, x, z });
    this.group = new Group(); this.group.name = 'Awtsmoos_clickable_chossid_npc'; this.model = gltf.scene; this.model.scale.set(1.38, 1.38, 1.38); this.model.position.set(x, 0, z); this.model.setBaseTransform();
    const footOffset = alignModelFeetToGround(this.model, 0).offset ?? this.model.position.y; this.model.position.set(x, ground.heightAt(x, z) + footOffset, z); this.model.setBaseTransform();
    this.model.quaternion.set(0, Math.sin(.75), 0, Math.cos(.75)); this.player = new TinyAnimationPlayer(this.model, gltf.animations); this.player.play(pick(this.player.names)); this.highlight = makeHighlight(x, this.model.position.y, z); this.highlight.visible = false; this.group.add(this.model); this.group.add(this.highlight); this.install();
  }
  install() { this.canvas.addEventListener('pointerdown', e => this.onPointer(e)); }
  onPointer(e) { if (!this.hitPointer(e)) return; e.preventDefault(); e.stopPropagation(); e.stopImmediatePropagation?.(); if (!this.selected) this.target(); else this.dialogue(); }
  target() { this.selected = true; this.highlight.visible = true; this.bus.emit('npc:target', this.payload()); }
  dialogue() { this.dialogueOpen = true; this.bus.emit('npc:dialogue', this.payload()); }
  update(dt, playerState) { this.player.update(dt); this.facePlayer(playerState); this.highlight.visible = this.selected; }
  payload() { return { name: this.name, health: this.health, face: '🧔', level: 'Lava club course', selected: this.selected }; }
  hitPointer(e) { const ray = rayFromPointer(e, this.camera, this.canvas, this.targetHint()); return raySphere(ray, v(this.x, this.model.position.y + 1.35, this.z), 1.05); }
  targetHint() { return { x: this.x, y: this.model.position.y + 1.35, z: this.z }; }
  facePlayer(s) { if (!s) return; const dx = s.x - this.x, dz = s.z - this.z, yaw = Math.atan2(dx, dz); this.model.quaternion.set(0, Math.sin(yaw / 2), 0, Math.cos(yaw / 2)); }
  debug() { return { name: this.name, selected: this.selected, dialogueOpen: this.dialogueOpen, health: this.health, position: { x: this.x, y: this.model.position.y, z: this.z } }; }
}
function makeHighlight(x, y, z) { const g = new Group(); g.name = 'yellow_target_change'; g.add(createPrimitiveMesh({ id: 'npc-yellow-ring', shape: 'cylinder', color: '#ffe45e', solid: false, position: { x, y: y + .05, z }, radius: 1.05, height: .05, segments: 36, rotation: {} })); g.add(createPrimitiveMesh({ id: 'npc-yellow-face-halo', shape: 'sphere', color: '#fff16d', solid: false, position: { x, y: y + 2.7, z }, radius: .32, rotation: {} })); return g; }
function pick(names) { return names.find(n => /stand|idle/i.test(n)) || names[0] || ''; }
function raySphere(ray, center, radius) { const oc = sub(ray.origin, center), b = dot(oc, ray.dir), c = dot(oc, oc) - radius * radius, h = b * b - c; return h >= 0 && -b - Math.sqrt(h) > .05; }
function rayFromPointer(e, camera, canvas, targetHint) { const rect = canvas.getBoundingClientRect(); const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1, ny = 1 - ((e.clientY - rect.top) / rect.height) * 2; const b = cameraBasis(camera, targetHint); const tan = Math.tan((camera.fov || 45) * Math.PI / 360); return { origin: b.o, dir: normalize(add(add(b.f, scale(b.r, nx * tan * (camera.aspect || 1))), scale(b.u, ny * tan))) }; }
function cameraBasis(camera, targetHint) { const o = v(camera.position.x, camera.position.y, camera.position.z), f = normalize(sub(targetOf(targetHint || camera.target), o)), r = normalize(cross(f, v(0, 1, 0))), u = normalize(cross(r, f)); return { o, f, r, u }; }
function targetOf(t) { if (Array.isArray(t)) return v(t[0] || 0, t[1] || 0, t[2] || 0); return v(t?.x || 0, t?.y || 0, t?.z || 0); }
