// B"H
import { Group } from '../../../light-three-gltf/tiny-runtime.js';
import { Aabb } from '../math/Aabb.js';
import { AwtsmoosOctree } from '../collision/AwtsmoosOctree.js';
import { createPrimitiveMesh, primitiveColliders } from './Box3D.js';

export const LAVA_START = { x: -24, z: 22.2 };
export const ERETZ_RETURN = { x: 0, z: 4 };

/** LavaLevel: a separate generated world, not mixed into the main world. */
export class LavaLevel {
  constructor(scene, assets = {}) { this.group = new Group(); this.group.name = 'Awtsmoos_loaded_lava_world_only_when_selected'; this.group.visible = false; this.assets = assets; this.defs = lavaWorldDefs(assets); this.clubs = clubData().map(makeClub); this.collected = 0; this.active = false; this.build(); this.octree = buildOctree(this.colliders); scene.add(this.group); }
  build() { this.colliders = this.defs.flatMap(primitiveColliders); for (const d of this.defs) this.group.add(createPrimitiveMesh(d)); for (const c of this.clubs) this.group.add(c.group); }
  heightAt() { return -1.05; }
  enter(state, ground, mover, footOffset) { this.active = true; this.group.visible = true; state.level = 'lava-club-course'; state.x = LAVA_START.x; state.z = LAVA_START.z; state.y = ground.heightAt(state.x, state.z) + footOffset; state.renderY = state.y; state.velY = 0; state.grounded = true; if (mover) mover.octree = this.octree; }
  leave(state, ground, mover, mainOctree, footOffset) { this.active = false; this.group.visible = false; state.level = 'eretz'; state.x = ERETZ_RETURN.x; state.z = ERETZ_RETURN.z; if (mover) mover.octree = mainOctree; state.y = ground.heightAt(state.x, state.z) + footOffset; state.renderY = state.y; state.velY = 0; state.grounded = true; }
  update(state) { if (!this.active) return; for (const c of this.clubs) if (!c.got && Math.hypot(state.x - c.x, state.z - c.z) < 1.05) { c.got = true; c.group.visible = false; this.collected++; } }
  stats() { return { active: this.active, collected: this.collected, total: this.clubs.length, start: LAVA_START, platformColliders: this.colliders.length, loadedWorld: this.group.visible }; }
}
export function lavaWorldDefs(assets = {}) {
  const lava = { color: '#ff3b14', mapImage: assets.lavaImage || null, textureUrl: assets.lavaImage?.dataset?.url || null, mapRepeat: [7, 3] }, stone = { color: '#6f6657' };
  const out = [{ id: 'lava-new-world-burning-sea', shape: 'box', solid: false, walkable: false, ...lava, position: { x: -13, y: -1.18, z: 22.6 }, size: { x: 35, y: .22, z: 16 }, rotation: { y: .04 } }, box('lava-world-start-safe-platform', stone, -24, .34, 22.2, 3.2, .45, 3.2, 0, true)];
  for (let i = 0; i < 11; i++) out.push(box(`lava-world-floating-stone-${i + 1}`, stone, -20.5 + i * 2.15, .5 + (i % 4) * .18, 22 + Math.sin(i * .85) * 3.6, 1.65, .44, 1.65, i * .21, true));
  out.push(box('lava-world-return-platform', stone, 4.1, .86, 23.5, 4.3, .55, 3.2, .2, true)); return out;
}
function clubData() { return [[-18.9, 1.35, 24.0], [-14.6, 1.55, 19.7], [-10.2, 1.75, 24.5], [-5.2, 1.95, 21.4]]; }
function makeClub([x, y, z], i) { const group = new Group(); group.name = `collectible-club-${i + 1}`; group.add(createPrimitiveMesh({ id: `club-handle-${i}`, shape: 'cylinder', color: '#8b5a2b', solid: false, position: { x, y, z }, radius: .08, height: .9, segments: 12, rotation: { z: .7 } })); group.add(createPrimitiveMesh({ id: `club-head-${i}`, shape: 'sphere', color: '#ffe166', solid: false, position: { x: x + .25, y: y + .33, z }, radius: .22, rotation: {} })); return { x, y, z, group, got: false }; }
function box(id, material, x, y, z, sx, sy, sz, yaw, walkable) { return { id, shape: 'box', solid: true, walkable, ...material, position: { x, y, z }, size: { x: sx, y: sy, z: sz }, rotation: { y: yaw } }; }
function buildOctree(colliders) { const octree = new AwtsmoosOctree(Aabb.centerSize({ x: -10, y: 2, z: 22 }, { x: 90, y: 50, z: 90 })); for (const tri of colliders) octree.insert(tri); return octree; }
