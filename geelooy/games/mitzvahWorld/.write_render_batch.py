from pathlib import Path
base=Path('ckidsAwtsmoos/Olam/worlds/mitzvahWorld/region/render')
files={}
def add(name, content): files[base/name]=content.strip()+"\n"
add('RegionSeal.js', r'''// B"H
/** @file RegionSeal.js @description Seals region visuals away from octree and raycast. */
export function sealRegionVisual(root, extra = {}) {
  root?.traverse?.(child => Object.assign(child.userData ||= {}, { regionVisual: true, skipOctree: true, noOctree: true, skipRaycast: true, addToOctree: false, ...extra }));
  Object.assign(root.userData ||= {}, { regionVisual: true, skipOctree: true, noOctree: true, skipRaycast: true, addToOctree: false, ...extra });
  return root;
}
export function sealHardCollider(root, extra = {}) {
  root?.traverse?.(child => Object.assign(child.userData ||= {}, { regionCollider: true, isSolid: true, addToOctree: true, skipOctree: false, noOctree: false, ...extra }));
  Object.assign(root.userData ||= {}, { regionCollider: true, isSolid: true, addToOctree: true, skipOctree: false, noOctree: false, ...extra });
  return root;
}
''')
add('RegionGround.js', r'''// B"H
/** @file RegionGround.js @description Terrain-aware grounding helpers for every region object. */
import * as THREE from "/games/scripts/build/three.module.js";
import TerrainMath from "../../../../../dvarim/terrain/core/TerrainMath.js";
const num = (v, f = 0) => Number.isFinite(Number(v)) ? Number(v) : f;
export function groundY(olam, x = 0, z = 0, fallback = 0) {
  const law = olam?.awtsmoosTerrainLaw;
  if (law?.data) return num(law.position?.y) + TerrainMath.calculateHeightAt(x - num(law.position?.x), z - num(law.position?.z), law.data);
  const hit = olam?.worldOctree?.rayIntersect?.(new THREE.Ray(new THREE.Vector3(x, 500, z), new THREE.Vector3(0, -1, 0)));
  return Number.isFinite(hit?.position?.y) ? hit.position.y : fallback;
}
export function groundedMatrix(olam, x, z, sx, sy, sz, yaw = 0, lift = 0) {
  const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, yaw, 0));
  const p = new THREE.Vector3(x, groundY(olam, x, z) + lift + sy * 0.5, z);
  return new THREE.Matrix4().compose(p, q, new THREE.Vector3(sx, sy, sz));
}
export function groundGroup(olam, group, x, z, lift = 0) { group.position.set(x, groundY(olam, x, z) + lift, z); return group; }
''')
add('RegionRandom.js', r'''// B"H
/** @file RegionRandom.js @description Deterministic random helpers for living-region placement. */
export const fract = x => x - Math.floor(x);
export function rand(x = 0, z = 0, s = 1) { return fract(Math.sin(x * 12.9898 + z * 78.233 + s * 37.719) * 43758.5453); }
export function jitter(x, z, radius = 1, seed = 1) { return [(rand(x, z, seed) - .5) * radius, (rand(x, z, seed + 9) - .5) * radius]; }
export function choose(list, x, z, seed = 1) { return list[Math.floor(rand(x, z, seed) * list.length) % list.length]; }
export function range(count, fn) { const out = []; for (let i = 0; i < count; i++) out.push(fn(i)); return out; }
''')
add('RegionGeometry.js', r'''// B"H
/** @file RegionGeometry.js @description Shared geometry cache for high-performance region visuals. */
import * as THREE from "/games/scripts/build/three.module.js";
const cache = new Map();
export function regionGeometry(kind = "box") {
  if (cache.has(kind)) return cache.get(kind);
  const g = kind === "blade" ? new THREE.PlaneGeometry(.09, 1, 1, 1) : kind === "flower" ? new THREE.SphereGeometry(.5, 8, 5) : kind === "stem" ? new THREE.CylinderGeometry(.08, .08, 1, 6) : kind === "rock" ? new THREE.SphereGeometry(.5, 10, 7) : kind === "trunk" ? new THREE.CylinderGeometry(.5, .65, 1, 8) : kind === "canopy" ? new THREE.SphereGeometry(.5, 10, 8) : kind === "road" ? new THREE.BoxGeometry(1, 1, 1) : kind === "cone" ? new THREE.ConeGeometry(.5, 1, 10) : new THREE.BoxGeometry(1, 1, 1);
  g.computeBoundingBox(); g.computeBoundingSphere(); cache.set(kind, g); return g;
}
export function geometryStats() { return { geometries: cache.size }; }
''')
add('RegionMaterials.js', r'''// B"H
/** @file RegionMaterials.js @description Shared region material bridge. */
import * as THREE from "/games/scripts/build/three.module.js";
import { ecologyMaterial } from "../../../../../dvarim/nature/villagePicture/EcologySpecialMaterials.js?v=complete-v3-ecology-materials-20260612-bh3";
import { rvMaterial } from "../../../../../dvarim/nature/villagePicture/RealisticVillageMaterials.js?v=webgl-progress-materials-20260612-bh1";
const cache = new Map();
export function regionMaterial(kind = "grass", options = {}) {
  const key = `${kind}:${options.simple ? 1 : 0}:${options.unlit ? 1 : 0}`;
  if (cache.has(key)) return cache.get(key);
  const ecology = ["barkOak", "barkPine", "graniteRock", "slateStone", "mossPatch", "daisyPetal", "lavenderFlower", "cabbageLeaf", "carrotSkin", "potatoSkin", "onionSkin", "goldHammered", "marbleWhite", "cottonFiber", "linenFabric", "mushroomCap"];
  const mat = ecology.includes(kind) ? ecologyMaterial(kind, { simple: options.simple ?? true, unlit: options.unlit, repeat: options.repeat || 2 }) : rvMaterial(kind, { simple: options.simple ?? true, unlit: options.unlit, repeat: options.repeat || 2 });
  mat.side = options.side ?? mat.side ?? THREE.FrontSide; cache.set(key, mat); return mat;
}
export function materialStats() { return { materials: cache.size }; }
''')
add('RegionInstancer.js', r'''// B"H
/** @file RegionInstancer.js @description InstancedMesh creation with terrain-grounded matrices. */
import * as THREE from "/games/scripts/build/three.module.js";
import { regionGeometry } from "./RegionGeometry.js";
import { regionMaterial } from "./RegionMaterials.js";
import { groundedMatrix } from "./RegionGround.js";
import { sealRegionVisual } from "./RegionSeal.js";
export function makeInstancedLayer({ olam, name, geometry = "box", material = "grass", count = 1, build, simple = true }) {
  const mesh = new THREE.InstancedMesh(regionGeometry(geometry), regionMaterial(material, { simple }), count);
  mesh.name = name; mesh.frustumCulled = true; mesh.castShadow = false; mesh.receiveShadow = true;
  const color = new THREE.Color();
  for (let i = 0; i < count; i++) { const spec = build(i); mesh.setMatrixAt(i, groundedMatrix(olam, spec.x, spec.z, spec.sx, spec.sy, spec.sz, spec.yaw || 0, spec.lift || 0)); if (spec.color) mesh.setColorAt?.(i, color.set(spec.color)); }
  mesh.instanceMatrix.needsUpdate = true; if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true; return sealRegionVisual(mesh, { instancedRegionLayer: true });
}
''')
add('RegionPolyline.js', r'''// B"H
/** @file RegionPolyline.js @description Samples path polylines for roads, lamps, trails, and flowers. */
export function samplePolyline(points = [], spacing = 3) {
  const out = []; for (let i = 0; i < points.length - 1; i++) { const [x1, z1] = points[i], [x2, z2] = points[i + 1]; const dx = x2 - x1, dz = z2 - z1, dist = Math.hypot(dx, dz); const steps = Math.max(1, Math.floor(dist / spacing)); for (let s = 0; s < steps; s++) { const t = (s + .5) / steps; out.push({ x: x1 + dx * t, z: z1 + dz * t, yaw: Math.atan2(dx, dz), segment: i, t }); } } return out;
}
export function offsetPoint(p, distance) { return { x: p.x + Math.cos(p.yaw) * distance, z: p.z - Math.sin(p.yaw) * distance, yaw: p.yaw }; }
''')
add('RegionRoadRenderer.js', r'''// B"H
/** @file RegionRoadRenderer.js @description Actual yellow brick road, dirt trails, and lamps. */
import * as THREE from "/games/scripts/build/three.module.js";
import { makeInstancedLayer } from "./RegionInstancer.js";
import { samplePolyline, offsetPoint } from "./RegionPolyline.js";
import { regionGeometry } from "./RegionGeometry.js";
import { regionMaterial } from "./RegionMaterials.js";
import { groundY } from "./RegionGround.js";
import { sealRegionVisual } from "./RegionSeal.js";
export function buildRoadRenderer(olam, roads) {
  const root = new THREE.Group(); root.name = "living_region_roads_yellow_brick_and_trails";
  const main = samplePolyline(roads.main?.points || [], 2.8); root.add(makeInstancedLayer({ olam, name: "instanced_yellow_brick_road", geometry: "road", material: "yellowBrick", count: main.length, simple: false, build: i => ({ ...main[i], sx: 2.8, sy: .055, sz: 3.25, lift: .035 }) }));
  const farm = samplePolyline(roads.farm?.points || [], 4); root.add(makeInstancedLayer({ olam, name: "instanced_packed_dirt_farm_road", geometry: "road", material: "dirt", count: farm.length, build: i => ({ ...farm[i], sx: 2.4, sy: .045, sz: 4.2, lift: .025 }) }));
  const lampGeo = regionGeometry("trunk"), lampMat = regionMaterial("darkWood"), shadeGeo = regionGeometry("cone"), shadeMat = regionMaterial("lampShade", { unlit: true }); let lamps = 0;
  for (let i = 2; i < main.length; i += 8) { const p = offsetPoint(main[i], 3.9), y = groundY(olam, p.x, p.z); const post = new THREE.Mesh(lampGeo, lampMat); post.name = "road_lamp_post"; post.position.set(p.x, y + 1.05, p.z); post.scale.set(.12, 2.1, .12); const shade = new THREE.Mesh(shadeGeo, shadeMat); shade.name = "road_lamp_shade"; shade.position.set(p.x, y + 2.15, p.z); shade.scale.set(.55, .46, .55); root.add(post, shade); if (lamps++ % 3 === 0) { const light = new THREE.PointLight(0xffd28a, .32, 7, 2); light.position.set(p.x, y + 2, p.z); root.add(light); } }
  root.userData.stats = { roadPieces: main.length + farm.length, lamps }; return sealRegionVisual(root);
}
''')
add('RegionGrassRenderer.js', r'''// B"H
/** @file RegionGrassRenderer.js @description Dense instanced grass and wheat blades. */
import { makeInstancedLayer } from "./RegionInstancer.js";
import { rand } from "./RegionRandom.js";
export function buildGrassRenderer(olam) {
  const count = 5200;
  return makeInstancedLayer({ olam, name: "living_region_dense_grass_blades", geometry: "blade", material: "grass", count, build: i => { const ring = Math.sqrt(i / count) * 210, a = i * 2.399963; const x = Math.cos(a) * ring + (rand(i, 2) - .5) * 10, z = Math.sin(a) * ring * .62 + (rand(i, 3) - .5) * 10; return { x, z, sx: .45 + rand(i, 4) * .45, sy: .55 + rand(i, 5) * 1.4, sz: .45, yaw: a, lift: .02 }; } });
}
export function buildWheatRenderer(olam) {
  const count = 2800;
  return makeInstancedLayer({ olam, name: "living_region_farm_wheat_field", geometry: "blade", material: "straw", count, build: i => { const row = i % 70, col = Math.floor(i / 70); return { x: -165 + row * 1.05 + (rand(i, 1) - .5) * .25, z: -64 + col * 1.25 + (rand(i, 2) - .5) * .4, sx: .35, sy: 1.25 + rand(i, 6) * .55, sz: .35, yaw: rand(i, 7) * 6.28, lift: .02 }; } });
}
''')
add('RegionFlowerRenderer.js', r'''// B"H
/** @file RegionFlowerRenderer.js @description Wildflowers along roads and fertile fields. */
import * as THREE from "/games/scripts/build/three.module.js";
import { makeInstancedLayer } from "./RegionInstancer.js";
import { samplePolyline, offsetPoint } from "./RegionPolyline.js";
import { rand } from "./RegionRandom.js";
import { sealRegionVisual } from "./RegionSeal.js";
export function buildFlowerRenderer(olam, roads) {
  const root = new THREE.Group(); root.name = "living_region_wildflower_fields";
  const path = samplePolyline(roads.main?.points || [], 5), spots = [];
  path.forEach((p, i) => { spots.push(offsetPoint(p, 3.4 + rand(i, 1) * 2)); spots.push(offsetPoint(p, -3.4 - rand(i, 2) * 2)); });
  const count = Math.min(1600, spots.length * 6 + 500);
  root.add(makeInstancedLayer({ olam, name: "instanced_daisy_petal_heads", geometry: "flower", material: "daisyPetal", count, build: i => { const base = spots[i % spots.length] || { x: 0, z: 0 }; return { x: base.x + (rand(i, 3) - .5) * 4, z: base.z + (rand(i, 4) - .5) * 4, sx: .16, sy: .07, sz: .16, yaw: rand(i, 5) * 6.28, lift: .42 + rand(i, 6) * .18 }; } }));
  root.add(makeInstancedLayer({ olam, name: "instanced_lavender_flower_heads", geometry: "flower", material: "lavenderFlower", count: Math.floor(count * .5), build: i => ({ x: -130 + (i % 50) * 2.4 + (rand(i, 8) - .5), z: 10 + Math.floor(i / 50) * 2.2 + (rand(i, 9) - .5), sx: .13, sy: .18, sz: .13, yaw: rand(i, 10) * 6.28, lift: .55 }) }));
  root.userData.stats = { flowers: count + Math.floor(count * .5) }; return sealRegionVisual(root);
}
''')
add('RegionBushRenderer.js', r'''// B"H
/** @file RegionBushRenderer.js @description Shrubs and cabbage-like leaf clusters. */
import { makeInstancedLayer } from "./RegionInstancer.js";
import { rand } from "./RegionRandom.js";
export function buildBushRenderer(olam) {
  const count = 640;
  return makeInstancedLayer({ olam, name: "living_region_bush_and_shrub_clusters", geometry: "canopy", material: "cabbageLeaf", count, build: i => { const a = i * 1.71, radius = 72 + rand(i, 2) * 130; return { x: Math.cos(a) * radius + (rand(i, 3) - .5) * 22, z: Math.sin(a) * radius * .7 + (rand(i, 4) - .5) * 18, sx: .9 + rand(i, 5) * 1.5, sy: .45 + rand(i, 6) * .9, sz: .9 + rand(i, 7) * 1.5, yaw: a, lift: .08 }; } });
}
''')
add('RegionRockRenderer.js', r'''// B"H
/** @file RegionRockRenderer.js @description Rock fields, moss stones, and hard-collider candidates. */
import { makeInstancedLayer } from "./RegionInstancer.js";
import { rand } from "./RegionRandom.js";
export function buildRockRenderer(olam) {
  const count = 520;
  return makeInstancedLayer({ olam, name: "living_region_granite_slate_rocks", geometry: "rock", material: "graniteRock", count, simple: false, build: i => { const side = i % 2 ? 1 : -1, x = side * (120 + rand(i, 1) * 95), z = -105 + rand(i, 2) * 220; const big = rand(i, 3) > .86; return { x, z, sx: big ? 2.6 : .7 + rand(i, 4) * 1.2, sy: big ? 1.25 : .35 + rand(i, 5) * .55, sz: big ? 2.1 : .55 + rand(i, 6) * 1.0, yaw: rand(i, 7) * 6.28, lift: .04 }; } });
}
''')
add('RegionTreeRenderer.js', r'''// B"H
/** @file RegionTreeRenderer.js @description Instanced forest/orchard trunks and canopies. */
import * as THREE from "/games/scripts/build/three.module.js";
import { makeInstancedLayer } from "./RegionInstancer.js";
import { rand } from "./RegionRandom.js";
import { sealRegionVisual } from "./RegionSeal.js";
export function buildTreeRenderer(olam) {
  const root = new THREE.Group(); root.name = "living_region_forest_and_orchard_trees"; const count = 620;
  const spec = i => { const forest = i < 420; const a = i * 2.399, r = forest ? 150 + rand(i, 1) * 80 : 80 + rand(i, 2) * 50; const x = forest ? -90 + Math.cos(a) * r : 105 + (i % 24) * 4.6; const z = forest ? 45 + Math.sin(a) * r * .55 : 35 + Math.floor(i / 24) * 7.2; const h = forest ? 5 + rand(i, 3) * 7 : 3 + rand(i, 4) * 3; return { x, z, h, a }; };
  root.add(makeInstancedLayer({ olam, name: "instanced_tree_trunks", geometry: "trunk", material: "barkOak", count, build: i => { const s = spec(i); return { x: s.x, z: s.z, sx: .35 + s.h * .045, sy: s.h, sz: .35 + s.h * .045, yaw: s.a, lift: 0 }; } }));
  root.add(makeInstancedLayer({ olam, name: "instanced_tree_canopies", geometry: "canopy", material: "leaf", count, build: i => { const s = spec(i); return { x: s.x, z: s.z, sx: 2.5 + s.h * .35, sy: 1.8 + s.h * .18, sz: 2.5 + s.h * .35, yaw: s.a, lift: s.h }; } }));
  root.userData.stats = { trees: count }; return sealRegionVisual(root);
}
''')
add('RegionFarmRenderer.js', r'''// B"H
/** @file RegionFarmRenderer.js @description Vegetable beds, cloth sacks, and farm rows. */
import * as THREE from "/games/scripts/build/three.module.js";
import { makeInstancedLayer } from "./RegionInstancer.js";
import { sealRegionVisual } from "./RegionSeal.js";
export function buildFarmRenderer(olam) {
  const root = new THREE.Group(); root.name = "living_region_farms_and_vegetable_beds";
  const beds = 360;
  root.add(makeInstancedLayer({ olam, name: "instanced_carrots", geometry: "stem", material: "carrotSkin", count: beds, simple: false, build: i => ({ x: -150 + (i % 36) * 1.4, z: -42 + Math.floor(i / 36) * 2.1, sx: .16, sy: .52, sz: .16, yaw: 0, lift: .02 }) }));
  root.add(makeInstancedLayer({ olam, name: "instanced_cabbages", geometry: "canopy", material: "cabbageLeaf", count: 180, build: i => ({ x: -135 + (i % 30) * 1.55, z: -15 + Math.floor(i / 30) * 2.15, sx: .46, sy: .32, sz: .46, yaw: i, lift: .02 }) }));
  root.add(makeInstancedLayer({ olam, name: "instanced_linen_sacks", geometry: "road", material: "linenFabric", count: 28, build: i => ({ x: -82 + (i % 7) * .75, z: -30 + Math.floor(i / 7) * .7, sx: .48, sy: .38, sz: .55, yaw: i * .2, lift: .03 }) }));
  root.userData.stats = { vegetables: beds + 180, sacks: 28 }; return sealRegionVisual(root);
}
''')
add('RegionLandmarkRenderer.js', r'''// B"H
/** @file RegionLandmarkRenderer.js @description Landmarks: ancient tree, stone circle, marble/gold markers. */
import * as THREE from "/games/scripts/build/three.module.js";
import { regionGeometry } from "./RegionGeometry.js";
import { regionMaterial } from "./RegionMaterials.js";
import { groundY } from "./RegionGround.js";
import { sealRegionVisual } from "./RegionSeal.js";
function add(root, olam, kind, mat, x, z, s, yoff = 0) { const m = new THREE.Mesh(regionGeometry(kind), regionMaterial(mat, { simple: false })); m.position.set(x, groundY(olam, x, z) + yoff + s[1] * .5, z); m.scale.set(s[0], s[1], s[2]); root.add(m); return m; }
export function buildLandmarkRenderer(olam) { const root = new THREE.Group(); root.name = "living_region_landmarks"; add(root, olam, "trunk", "barkOak", -205, 112, [2.2, 14, 2.2]); add(root, olam, "canopy", "leaf", -205, 112, [11, 6, 11], 12); for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; add(root, olam, "rock", i % 3 ? "slateStone" : "marbleWhite", 168 + Math.cos(a) * 11, -88 + Math.sin(a) * 11, [1.2, 1.4, .8]); } add(root, olam, "rock", "goldHammered", 0, 10, [.42, .25, .42], .05); root.userData.stats = { landmarks: 14 }; return sealRegionVisual(root); }
''')
add('RegionWildlifeRenderer.js', r'''// B"H
/** @file RegionWildlifeRenderer.js @description Lightweight animated wildlife actors for the living region. */
import * as THREE from "/games/scripts/build/three.module.js";
import { regionGeometry } from "./RegionGeometry.js";
import { regionMaterial } from "./RegionMaterials.js";
import { groundY } from "./RegionGround.js";
import { rand } from "./RegionRandom.js";
import { sealRegionVisual } from "./RegionSeal.js";
const SPEC = { rabbit: [.45,.25,.65,"cottonFiber",18], fox: [.75,.38,1.05,"carrotSkin",6], deer: [1.0,.85,1.45,"barkOak",8], frog: [.32,.18,.32,"cabbageLeaf",12], goat: [.75,.55,1.0,"linenFabric",6] };
function actor(species, i, olam) { const [sx, sy, sz, mat] = SPEC[species]; const g = new THREE.Group(); g.name = `wild_${species}_${i}`; const body = new THREE.Mesh(regionGeometry("rock"), regionMaterial(mat)); body.scale.set(sx, sy, sz); body.position.y = sy * .5; const head = new THREE.Mesh(regionGeometry("rock"), regionMaterial(mat)); head.scale.set(sx * .42, sy * .55, sz * .42); head.position.set(0, sy * .75, sz * .55); g.add(body, head); const x = (rand(i, 1) - .5) * 320, z = (rand(i, 2) - .5) * 160; g.position.set(x, groundY(olam, x, z) + .04, z); g.userData.motion = { species, baseX: x, baseZ: z, phase: rand(i, 3) * 100, radius: 8 + rand(i, 4) * 22, speed: .15 + rand(i, 5) * .35 }; return sealRegionVisual(g, { wildlifeActor: true }); }
export function buildWildlifeRenderer(olam) { const root = new THREE.Group(); root.name = "living_region_wildlife_runtime"; for (const [species, data] of Object.entries(SPEC)) for (let i = 0; i < data[4]; i++) root.add(actor(species, i, olam)); root.userData.tick = time => { for (const c of root.children) { const m = c.userData.motion; if (!m) continue; const a = time * .001 * m.speed + m.phase; const x = m.baseX + Math.cos(a) * m.radius, z = m.baseZ + Math.sin(a * .8) * m.radius * .45; c.position.set(x, groundY(olam, x, z) + .04 + Math.abs(Math.sin(a * 3)) * .08, z); c.rotation.y = -a; } }; root.userData.stats = { wildlife: root.children.length }; return sealRegionVisual(root); }
export function installWildlifeTicker(olam, root) { if (!olam || !root?.userData?.tick || olam.__livingRegionWildlifeTicker) return; olam.__livingRegionWildlifeTicker = root; const old = olam.heesHawvoos?.bind(olam); if (old) olam.heesHawvoos = function(...args) { old(...args); root.userData.tick(performance.now?.() || Date.now()); }; }
''')
add('RegionColliderRuntime.js', r'''// B"H
/** @file RegionColliderRuntime.js @description Conservative merged collider runtime for major blockers. */
import * as THREE from "/games/scripts/build/three.module.js";
import { groundY } from "./RegionGround.js";
import { sealHardCollider, sealRegionVisual } from "./RegionSeal.js";
function boxMesh(x, y, z, sx, sy, sz, name) { const m = new THREE.Mesh(new THREE.BoxGeometry(1,1,1), new THREE.MeshBasicMaterial({ visible:false })); m.name = name; m.position.set(x, y + sy * .5, z); m.scale.set(sx, sy, sz); return m; }
export function buildRegionColliderRuntime(olam, report = {}) {
  const root = new THREE.Group(); root.name = "living_region_conservative_merged_collider_candidates"; let accepted = 0;
  for (const h of report.houses || []) root.add(boxMesh(h.x, groundY(olam, h.x, h.z), h.z, 8, 4.2, 6, `${h.id}_region_house_collider`));
  for (const p of [[-205,112,4,10,4],[168,-88,18,1.4,18]]) root.add(boxMesh(p[0], groundY(olam,p[0],p[1]), p[1], p[2], p[3], p[4], "region_landmark_collider"));
  sealHardCollider(root, { mergedRegionColliderRoot:true });
  for (const child of root.children) { child.updateMatrixWorld(true); if (olam?.worldOctree?.addObject?.(child)) accepted++; }
  root.visible = false; root.userData.stats = { colliderBodies: root.children.length, accepted }; return sealRegionVisual(root, { colliderDebugVisual:false, skipOctree:true, addToOctree:false });
}
''')
add('LivingRegionRuntime.js', r'''// B"H
/** @file LivingRegionRuntime.js @description Builds the actual visible living region from the region plan. */
import * as THREE from "/games/scripts/build/three.module.js";
import { buildRoadRenderer } from "./RegionRoadRenderer.js";
import { buildGrassRenderer, buildWheatRenderer } from "./RegionGrassRenderer.js";
import { buildFlowerRenderer } from "./RegionFlowerRenderer.js";
import { buildBushRenderer } from "./RegionBushRenderer.js";
import { buildRockRenderer } from "./RegionRockRenderer.js";
import { buildTreeRenderer } from "./RegionTreeRenderer.js";
import { buildFarmRenderer } from "./RegionFarmRenderer.js";
import { buildLandmarkRenderer } from "./RegionLandmarkRenderer.js";
import { buildWildlifeRenderer, installWildlifeTicker } from "./RegionWildlifeRenderer.js";
import { buildRegionColliderRuntime } from "./RegionColliderRuntime.js";
import { sealRegionVisual } from "./RegionSeal.js";
const KEY = "__awtsmoosLivingRegionRuntime";
export async function ensureLivingRegionRuntime(context = {}, report = {}) {
  const olam = context.olam || context, scene = context.scene || olam.scene; if (!scene || !olam || olam[KEY]) return olam?.[KEY] || null;
  const root = new THREE.Group(); root.name = "AWTSMOOS_LIVING_REGION_REAL_RUNTIME";
  const roads = report.roads || { main:{points:[[-145,-42],[-90,-8],[-25,8],[45,22],[135,72]]}, farm:{points:[[-40,5],[-100,-25],[-155,-45]]} };
  const layers = [buildRoadRenderer(olam, roads), buildGrassRenderer(olam), buildWheatRenderer(olam), buildFlowerRenderer(olam, roads), buildBushRenderer(olam), buildRockRenderer(olam), buildTreeRenderer(olam), buildFarmRenderer(olam), buildLandmarkRenderer(olam), buildWildlifeRenderer(olam), buildRegionColliderRuntime(olam, report)];
  for (const layer of layers) root.add(layer); sealRegionVisual(root, { livingRegionRuntime: true }); scene.add(root); installWildlifeTicker(olam, layers[9]);
  const stats = {}; root.traverse(o => { if (o.userData?.stats) Object.assign(stats, o.userData.stats); }); root.userData.stats = stats; olam[KEY] = root; return root;
}
''')
for p,c in files.items():
    p=Path(p); p.parent.mkdir(parents=True,exist_ok=True); p.write_text(c)
print('B"H wrote render batch', len(files))
