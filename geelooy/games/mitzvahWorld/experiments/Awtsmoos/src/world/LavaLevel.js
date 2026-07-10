// B"H
import { Group } from '../../../light-three-gltf/tiny-runtime.js';
import { Aabb } from '../math/Aabb.js';
import { AwtsmoosOctree } from '../collision/AwtsmoosOctree.js';
import { createPrimitiveMesh, primitiveColliders } from './Box3D.js';
export const LAVA_START = { x: -62, z: 42 };
export const ERETZ_RETURN = { x: 0, z: 4 };
const LAVA_Y = -1.18;

/** LavaLevel: longer lava sea, bigger route, forgiving platforms, counted coins. */
export class LavaLevel {
  constructor(scene, assets = {}) { this.group = new Group(); this.group.name = 'Awtsmoos_long_lava_coin_world_easy_extended'; this.group.visible = false; this.assets = assets; this.defs = lavaWorldDefs(assets); this.coins = coinData().map((p, i) => makeCoin(p, assets, i)); this.collected = 0; this.failures = 0; this.active = false; this.notice = ''; this.build(); this.octree = buildOctree(this.colliders); scene.add(this.group); }
  build() { this.colliders = this.defs.flatMap(primitiveColliders); for (const d of this.defs) this.group.add(createPrimitiveMesh(d)); for (const c of this.coins) this.group.add(c.group); }
  heightAt() { return LAVA_Y + .09; }
  enter(state, ground, mover, footOffset) { this.active = true; this.group.visible = true; this.notice = 'Long lava course: collect every coin; lava resets the count.'; state.level = 'lava-coin-course'; this.resetPlayer(state, ground, footOffset); if (mover) mover.octree = this.octree; }
  leave(state, ground, mover, mainOctree, footOffset) { this.active = false; this.group.visible = false; this.notice = ''; state.level = 'eretz'; state.x = ERETZ_RETURN.x; state.z = ERETZ_RETURN.z; if (mover) mover.octree = mainOctree; state.y = ground.heightAt(state.x, state.z) + footOffset; state.renderY = state.y; state.velY = 0; state.grounded = true; }
  update(state, ground, footOffset) { if (!this.active) return; if (this.touchedLava(state, footOffset)) return this.fail(state, ground, footOffset); for (const c of this.coins) if (!c.got && Math.hypot(state.x - c.x, state.z - c.z) < 1.35 && Math.abs((state.y - footOffset) - c.floorY) < 2.8) { c.got = true; c.group.visible = false; this.collected++; this.notice = `Coin collected: ${this.collected}/${this.coins.length}`; } }
  touchedLava(state, footOffset) { return state.y - footOffset <= LAVA_Y + .30; }
  fail(state, ground, footOffset) { this.failures++; this.notice = `Lava reset ${this.failures}; coins 0/${this.coins.length}.`; for (const c of this.coins) { c.got = false; c.group.visible = true; } this.collected = 0; this.resetPlayer(state, ground, footOffset); }
  resetPlayer(state, ground, footOffset) { state.x = LAVA_START.x; state.z = LAVA_START.z; state.y = ground.heightAt(state.x, state.z) + footOffset; state.renderY = state.y; state.velY = 0; state.grounded = true; }
  stats() { return { active: this.active, coins: this.collected, collected: this.collected, total: this.coins.length, failures: this.failures, start: LAVA_START, platformColliders: this.colliders.length, loadedWorld: this.group.visible, notice: this.notice, platformTexture: tex(this.assets.redBrickImage), coinTexture: tex(this.assets.goldImage), easierCourse: true, extendedCourse: true }; }
}
export function lavaWorldDefs(assets = {}) { const lava = { color: '#ff3512', mapImage: assets.lavaImage || null, textureUrl: tex(assets.lavaImage), mapRepeat: [18, 7] }, brick = brickMaterial(assets); const out = [{ id: 'lava-huge-extended-burning-sea', shape: 'box', solid: false, walkable: false, ...lava, position: { x: -18, y: LAVA_Y, z: 42 }, size: { x: 118, y: .22, z: 46 }, rotation: { y: .01 } }]; for (const [i, p] of courseNodes().entries()) out.push(box(`lava-long-red-brick-platform-${i+1}`, brick, p.x, p.y, p.z, p.sx, .58, p.sz, p.yaw || 0, true)); return out; }
function coinData() { return courseNodes().filter((_, i) => i > 0 && i % 2 === 0).map(p => [p.x, p.y + 1.05, p.z, p.y + .29]); }
function courseNodes() { const out = [{ x:-62,y:.48,z:42,sx:6.2,sz:5.2,yaw:0 }]; for (let i=1;i<=30;i++) { const x=-62+i*3.2, z=42+Math.sin(i*.48)*6.4+Math.cos(i*.21)*2.2, big=i%5===0 || i%7===0; out.push({ x, y:.56+(i%4)*.08, z, sx:big?4.4:3.0, sz:i%3===0?3.8:(big?4.1:2.85), yaw:i*.08 }); } out.push({ x:39.5,y:1.02,z:43,sx:7.4,sz:5.6,yaw:.08 }); return out; }
function makeCoin([x, y, z, floorY], assets, i) { const group = new Group(); group.name = `long-gold-coin-${i + 1}`; group.add(createPrimitiveMesh({ id: `gold-2-long-course-coin-${i + 1}`, shape: 'cylinder', color: '#ffd84a', mapImage: assets.goldImage || null, textureUrl: tex(assets.goldImage), mapRepeat: [1, 1], solid: false, position: { x, y, z }, radius: .48, height: .08, segments: 32, rotation: { x: Math.PI / 2 } })); return { x, y, z, floorY, group, got: false }; }
function brickMaterial(assets) { const img = assets.redBrickImage || assets.redBrick2Image || assets.brickImage; return { color: '#f47a55', mapImage: img || null, textureUrl: tex(img), mapRepeat: [2.4, 2.4] }; }
function box(id, material, x, y, z, sx, sy, sz, yaw, walkable) { return { id, shape: 'box', solid: true, walkable, noEdge: true, ...material, position: { x, y, z }, size: { x: sx, y: sy, z: sz }, rotation: { y: yaw } }; }
function buildOctree(colliders) { const octree = new AwtsmoosOctree(Aabb.centerSize({ x: -18, y: 2, z: 42 }, { x: 170, y: 70, z: 92 })); for (const tri of colliders) octree.insert(tri); return octree; }
function tex(img) { return img?.dataset?.url || img?.dataset?.publicUrl || img?.src || null; }
