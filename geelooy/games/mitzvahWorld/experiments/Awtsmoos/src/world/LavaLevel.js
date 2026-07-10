// B"H
import { Group } from '../../../light-three-gltf/tiny-runtime.js';
import { Aabb } from '../math/Aabb.js';
import { AwtsmoosOctree } from '../collision/AwtsmoosOctree.js';
import { createPrimitiveMesh, primitiveColliders } from './Box3D.js';

export const LAVA_START = { x: -36, z: 28 };
export const ERETZ_RETURN = { x: 0, z: 4 };
const LAVA_Y = -1.18;

/** LavaLevel: easier red-brick stepping stones, aligned gold coins, fail/reset covenant. */
export class LavaLevel {
  constructor(scene, assets = {}) { this.group = new Group(); this.group.name = 'Awtsmoos_big_lava_coin_world_easy_path'; this.group.visible = false; this.assets = assets; this.defs = lavaWorldDefs(assets); this.coins = coinData().map((p, i) => makeCoin(p, assets, i)); this.collected = 0; this.failures = 0; this.active = false; this.notice = ''; this.build(); this.octree = buildOctree(this.colliders); scene.add(this.group); }
  build() { this.colliders = this.defs.flatMap(primitiveColliders); for (const d of this.defs) this.group.add(createPrimitiveMesh(d)); for (const c of this.coins) this.group.add(c.group); }
  heightAt() { return LAVA_Y + .09; }
  enter(state, ground, mover, footOffset) { this.active = true; this.group.visible = true; this.notice = 'Collect the gold coins. Touch lava and the course resets.'; state.level = 'lava-coin-course'; this.resetPlayer(state, ground, footOffset); if (mover) mover.octree = this.octree; }
  leave(state, ground, mover, mainOctree, footOffset) { this.active = false; this.group.visible = false; this.notice = ''; state.level = 'eretz'; state.x = ERETZ_RETURN.x; state.z = ERETZ_RETURN.z; if (mover) mover.octree = mainOctree; state.y = ground.heightAt(state.x, state.z) + footOffset; state.renderY = state.y; state.velY = 0; state.grounded = true; }
  update(state, ground, footOffset) { if (!this.active) return; if (this.touchedLava(state, footOffset)) return this.fail(state, ground, footOffset); for (const c of this.coins) if (!c.got && Math.hypot(state.x - c.x, state.z - c.z) < 1.18 && Math.abs((state.y - footOffset) - c.floorY) < 2.4) { c.got = true; c.group.visible = false; this.collected++; this.notice = `Coin collected: ${this.collected}/${this.coins.length}`; } }
  touchedLava(state, footOffset) { return state.y - footOffset <= LAVA_Y + .30; }
  fail(state, ground, footOffset) { this.failures++; this.notice = `You touched lava. Reset ${this.failures}.`; for (const c of this.coins) { c.got = false; c.group.visible = true; } this.collected = 0; this.resetPlayer(state, ground, footOffset); }
  resetPlayer(state, ground, footOffset) { state.x = LAVA_START.x; state.z = LAVA_START.z; state.y = ground.heightAt(state.x, state.z) + footOffset; state.renderY = state.y; state.velY = 0; state.grounded = true; }
  stats() { return { active: this.active, coins: this.collected, collected: this.collected, total: this.coins.length, failures: this.failures, start: LAVA_START, platformColliders: this.colliders.length, loadedWorld: this.group.visible, notice: this.notice, platformTexture: tex(this.assets.redBrickImage), coinTexture: tex(this.assets.goldImage), easierCourse: true }; }
}
export function lavaWorldDefs(assets = {}) {
  const lava = { color: '#ff3512', mapImage: assets.lavaImage || null, textureUrl: tex(assets.lavaImage), mapRepeat: [11, 5] }, brick = brickMaterial(assets);
  const out = [{ id: 'lava-big-burning-sea', shape: 'box', solid: false, walkable: false, ...lava, position: { x: -17, y: LAVA_Y, z: 28 }, size: { x: 58, y: .22, z: 30 }, rotation: { y: .02 } }];
  for (const [i, p] of courseNodes().entries()) out.push(box(`lava-easy-red-brick-platform-${i+1}`, brick, p.x, p.y, p.z, p.sx, .56, p.sz, p.yaw || 0, true));
  return out;
}
function coinData() { return courseNodes().filter((_, i) => [2,4,6,8,10,12,14,16,18].includes(i)).map(p => [p.x, p.y + .95, p.z, p.y + .28]); }
function courseNodes() { const out = [{ x:-36,y:.42,z:28,sx:5.2,sz:4.5,yaw:0 }]; for (let i=1;i<=19;i++) { const x=-34+i*2.55, z=28+Math.sin(i*.62)*4.1+(i%6===0?1.2:0), big=i%5===0; out.push({ x, y:.52+(i%3)*.10, z, sx:big?3.1:2.35, sz:i%4===0?2.85:(big?2.8:2.25), yaw:i*.11 }); } out.push({ x:19.5,y:.86,z:29,sx:5.6,sz:4.8,yaw:.1 }); return out; }
function makeCoin([x, y, z, floorY], assets, i) { const group = new Group(); group.name = `gold-coin-${i + 1}`; group.add(createPrimitiveMesh({ id: `gold-2-coin-face-${i + 1}`, shape: 'cylinder', color: '#ffd84a', mapImage: assets.goldImage || null, textureUrl: tex(assets.goldImage), mapRepeat: [1, 1], solid: false, position: { x, y, z }, radius: .42, height: .08, segments: 36, rotation: { x: Math.PI / 2 } })); return { x, y, z, floorY, group, got: false }; }
function brickMaterial(assets) { const img = assets.redBrickImage || assets.redBrick2Image || assets.brickImage; return { color: '#f47a55', mapImage: img || null, textureUrl: tex(img), mapRepeat: [2.4, 2.4] }; }
function box(id, material, x, y, z, sx, sy, sz, yaw, walkable) { return { id, shape: 'box', solid: true, walkable, ...material, position: { x, y, z }, size: { x: sx, y: sy, z: sz }, rotation: { y: yaw } }; }
function buildOctree(colliders) { const octree = new AwtsmoosOctree(Aabb.centerSize({ x: -12, y: 2, z: 28 }, { x: 125, y: 70, z: 95 })); for (const tri of colliders) octree.insert(tri); return octree; }
function tex(img) { return img?.dataset?.url || img?.dataset?.publicUrl || img?.src || null; }
