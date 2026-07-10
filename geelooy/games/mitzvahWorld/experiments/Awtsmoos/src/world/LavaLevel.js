// B"H
import { Group } from '../../../light-three-gltf/tiny-runtime.js';
import { Aabb } from '../math/Aabb.js';
import { AwtsmoosOctree } from '../collision/AwtsmoosOctree.js';
import { createPrimitiveMesh, primitiveColliders } from './Box3D.js';

export const LAVA_START = { x: -36, z: 28 };
export const ERETZ_RETURN = { x: 0, z: 4 };
const LAVA_Y = -1.18;

/** LavaLevel: red-brick platforms, docs-base gold coins, lava fail/reset. */
export class LavaLevel {
  constructor(scene, assets = {}) { this.group = new Group(); this.group.name = 'Awtsmoos_big_lava_coin_world'; this.group.visible = false; this.assets = assets; this.defs = lavaWorldDefs(assets); this.coins = coinData().map((p, i) => makeCoin(p, assets, i)); this.collected = 0; this.failures = 0; this.active = false; this.notice = ''; this.build(); this.octree = buildOctree(this.colliders); scene.add(this.group); }
  build() { this.colliders = this.defs.flatMap(primitiveColliders); for (const d of this.defs) this.group.add(createPrimitiveMesh(d)); for (const c of this.coins) this.group.add(c.group); }
  heightAt() { return LAVA_Y + .09; }
  enter(state, ground, mover, footOffset) { this.active = true; this.group.visible = true; this.notice = 'Collect the gold coins. Touch lava and the course resets.'; state.level = 'lava-coin-course'; this.resetPlayer(state, ground, footOffset); if (mover) mover.octree = this.octree; }
  leave(state, ground, mover, mainOctree, footOffset) { this.active = false; this.group.visible = false; this.notice = ''; state.level = 'eretz'; state.x = ERETZ_RETURN.x; state.z = ERETZ_RETURN.z; if (mover) mover.octree = mainOctree; state.y = ground.heightAt(state.x, state.z) + footOffset; state.renderY = state.y; state.velY = 0; state.grounded = true; }
  update(state, ground, footOffset) { if (!this.active) return; if (this.touchedLava(state, footOffset)) return this.fail(state, ground, footOffset); for (const c of this.coins) if (!c.got && Math.hypot(state.x - c.x, state.z - c.z) < 1.05 && Math.abs((state.y - footOffset) - c.floorY) < 2.2) { c.got = true; c.group.visible = false; this.collected++; this.notice = `Coin collected: ${this.collected}/${this.coins.length}`; } }
  touchedLava(state, footOffset) { return state.y - footOffset <= LAVA_Y + .30; }
  fail(state, ground, footOffset) { this.failures++; this.notice = `You touched lava. Reset ${this.failures}.`; for (const c of this.coins) { c.got = false; c.group.visible = true; } this.collected = 0; this.resetPlayer(state, ground, footOffset); }
  resetPlayer(state, ground, footOffset) { state.x = LAVA_START.x; state.z = LAVA_START.z; state.y = ground.heightAt(state.x, state.z) + footOffset; state.renderY = state.y; state.velY = 0; state.grounded = true; }
  stats() { return { active: this.active, coins: this.collected, collected: this.collected, total: this.coins.length, failures: this.failures, start: LAVA_START, platformColliders: this.colliders.length, loadedWorld: this.group.visible, notice: this.notice, platformTexture: tex(this.assets.redBrickImage), coinTexture: tex(this.assets.goldImage) }; }
}
export function lavaWorldDefs(assets = {}) {
  const lava = { color: '#ff3512', mapImage: assets.lavaImage || null, textureUrl: tex(assets.lavaImage), mapRepeat: [11, 5] }, brick = { color: '#f47a55', mapImage: assets.redBrickImage || assets.redBrick2Image || assets.brickImage || null, textureUrl: tex(assets.redBrickImage || assets.redBrick2Image || assets.brickImage), mapRepeat: [2.2, 2.2] };
  const out = [{ id: 'lava-big-burning-sea', shape: 'box', solid: false, walkable: false, ...lava, position: { x: -17, y: LAVA_Y, z: 28 }, size: { x: 52, y: .22, z: 26 }, rotation: { y: .02 } }, box('lava-start-red-brick-platform', brick, -36, .38, 28, 4.6, .55, 4.2, 0, true)];
  for (let i = 0; i < 19; i++) { const x = -31 + i * 2.65, z = 28 + Math.sin(i * .73) * 6.4 + (i % 5 === 0 ? 2.4 : 0), y = .55 + (i % 4) * .13, s = i % 6 === 0 ? 2.35 : 1.65; out.push(box(`lava-red-brick-jump-platform-${i + 1}`, brick, x, y, z, s, .52, i % 4 === 1 ? 2.2 : s, i * .18, true)); }
  out.push(box('lava-return-red-brick-platform', brick, 20, .88, 29, 5.0, .65, 4.2, .1, true)); return out;
}
function coinData() { return [[-31,1.6,31.2,.55],[-26.1,1.7,23.5,.68],[-20.6,1.85,32.1,.55],[-15.2,1.95,27.8,.68],[-9.3,2.1,34.1,.55],[-3.5,2.2,24.4,.68],[2.4,2.25,31.2,.55],[8.6,2.3,25.8,.68],[14.2,2.45,32.8,.55]]; }
function makeCoin([x, y, z, floorY], assets, i) { const group = new Group(); group.name = `gold-coin-${i + 1}`; group.add(createPrimitiveMesh({ id: `gold-2-coin-face-${i + 1}`, shape: 'cylinder', color: '#ffd84a', mapImage: assets.goldImage || null, textureUrl: tex(assets.goldImage), mapRepeat: [1, 1], solid: false, position: { x, y, z }, radius: .42, height: .08, segments: 36, rotation: { x: Math.PI / 2 } })); return { x, y, z, floorY, group, got: false }; }
function box(id, material, x, y, z, sx, sy, sz, yaw, walkable) { return { id, shape: 'box', solid: true, walkable, ...material, position: { x, y, z }, size: { x: sx, y: sy, z: sz }, rotation: { y: yaw } }; }
function buildOctree(colliders) { const octree = new AwtsmoosOctree(Aabb.centerSize({ x: -12, y: 2, z: 28 }, { x: 120, y: 60, z: 90 })); for (const tri of colliders) octree.insert(tri); return octree; }
function tex(img) { return img?.dataset?.url || img?.dataset?.publicUrl || img?.src || null; }
