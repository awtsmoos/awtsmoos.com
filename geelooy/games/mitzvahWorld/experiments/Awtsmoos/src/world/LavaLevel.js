// B"H
import { Group } from '../../../light-three-gltf/tiny-runtime.js';
import { createPrimitiveMesh } from './Box3D.js';

export const LAVA_START = { x: -24, z: 22.2 };
export function lavaCourseDefs() {
  const out = [box('lava-course-start-stone', '#6f6657', -24, .34, 22.2, 2.4, .42, 2.4, 0, true)];
  for (let i = 0; i < 9; i++) out.push(box(`lava-course-jump-stone-${i + 1}`, '#6e6254', -21 + i * 2.2, .42 + (i % 3) * .16, 22 + Math.sin(i * .85) * 2.8, 1.55, .42, 1.55, i * .18, true));
  out.push(box('lava-course-finish-stone', '#7a6f5f', -.3, .7, 23.5, 3.2, .5, 2.8, .2, true));
  return out;
}
export class LavaLevel {
  constructor(scene) { this.group = new Group(); this.group.name = 'Awtsmoos_lava_obstacle_course_with_clubs'; this.clubs = clubData().map(makeClub); this.collected = 0; this.active = false; this.build(); scene.add(this.group); }
  build() { this.group.add(createPrimitiveMesh({ id: 'lava-glowing-field', shape: 'box', solid: false, walkable: false, color: '#ff3b14', position: { x: -13, y: -.08, z: 22.6 }, size: { x: 27, y: .12, z: 10 }, rotation: { y: .05 } })); for (const c of this.clubs) this.group.add(c.group); }
  enter(state, ground, footOffset) { this.active = true; state.level = 'lava-club-course'; state.x = LAVA_START.x; state.z = LAVA_START.z; state.y = ground.heightAt(state.x, state.z) + footOffset; state.renderY = state.y; state.velY = 0; state.grounded = true; }
  update(state) { if (!this.active) return; for (const c of this.clubs) if (!c.got && Math.hypot(state.x - c.x, state.z - c.z) < 1.05) { c.got = true; c.group.visible = false; this.collected++; } }
  stats() { return { active: this.active, collected: this.collected, total: this.clubs.length, start: LAVA_START }; }
}
function clubData() { return [[-18.9, 1.25, 24.0], [-14.6, 1.45, 19.7], [-10.2, 1.65, 24.5], [-5.2, 1.9, 21.4]]; }
function makeClub([x, y, z], i) { const group = new Group(); group.name = `collectible-club-${i + 1}`; group.add(createPrimitiveMesh({ id: `club-handle-${i}`, shape: 'cylinder', color: '#8b5a2b', solid: false, position: { x, y, z }, radius: .08, height: .9, segments: 12, rotation: { z: .7 } })); group.add(createPrimitiveMesh({ id: `club-head-${i}`, shape: 'sphere', color: '#ffe166', solid: false, position: { x: x + .25, y: y + .33, z }, radius: .22, rotation: {} })); return { x, y, z, group, got: false }; }
function box(id, color, x, y, z, sx, sy, sz, yaw, walkable) { return { id, shape: 'box', solid: true, walkable, color, position: { x, y, z }, size: { x: sx, y: sy, z: sz }, rotation: { y: yaw } }; }
