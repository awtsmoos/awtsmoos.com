// B"H
/**
 * @file RegionWildlifeRenderer.js
 * @description Chapter 969: wildlife becomes a real nivra-ticked runtime, not a monkeypatch hope.
 */
import * as THREE from "/games/scripts/build/three.module.js";
import { regionGeometry } from "./RegionGeometry.js";
import { regionMaterial } from "./RegionMaterials.js";
import { groundY } from "./RegionGround.js";
import { rand } from "./RegionRandom.js";
import { sealRegionVisual } from "./RegionSeal.js";
const SPEC = { rabbit: [.45,.25,.65,"cottonFiber",18], fox: [.75,.38,1.05,"carrotSkin",6], deer: [1,.85,1.45,"barkOak",8], frog: [.32,.18,.32,"cabbageLeaf",12], goat: [.75,.55,1,"linenFabric",6] };
function actor(species, i, olam) {
  const [sx, sy, sz, mat] = SPEC[species]; const g = new THREE.Group(); g.name = `wild_${species}_${i}`;
  const body = new THREE.Mesh(regionGeometry("rock"), regionMaterial(mat)); body.scale.set(sx, sy, sz); body.position.y = sy * .5;
  const head = new THREE.Mesh(regionGeometry("rock"), regionMaterial(mat)); head.scale.set(sx * .42, sy * .55, sz * .42); head.position.set(0, sy * .75, sz * .55); g.add(body, head);
  const x = (rand(i, 1) - .5) * 320, z = (rand(i, 2) - .5) * 160; g.position.set(x, groundY(olam, x, z) + .04, z);
  g.userData.motion = { species, baseX: x, baseZ: z, phase: rand(i, 3) * 100, radius: 8 + rand(i, 4) * 22, speed: .15 + rand(i, 5) * .35, hop: species === "rabbit" || species === "frog" };
  return sealRegionVisual(g, { wildlifeActor: true });
}
function tickRoot(root, olam, dt = 1 / 60) {
  root.userData.time = (root.userData.time || 0) + Math.min(.08, Math.max(.001, Number(dt) || 1 / 60));
  for (const c of root.children) {
    const m = c.userData.motion; if (!m) continue;
    const a = root.userData.time * m.speed + m.phase;
    const x = m.baseX + Math.cos(a) * m.radius, z = m.baseZ + Math.sin(a * .8) * m.radius * .45;
    const bounce = m.hop ? Math.abs(Math.sin(a * 7)) * .12 : Math.abs(Math.sin(a * 2)) * .035;
    c.position.set(x, groundY(olam, x, z) + .04 + bounce, z); c.rotation.y = Math.atan2(Math.sin(a * .8) * m.radius * .45, -Math.sin(a) * m.radius) + Math.PI / 2;
  }
}
export function buildWildlifeRenderer(olam) {
  const root = new THREE.Group(); root.name = "living_region_wildlife_runtime";
  for (const [species, data] of Object.entries(SPEC)) for (let i = 0; i < data[4]; i++) root.add(actor(species, i, olam));
  root.userData.tick = dt => tickRoot(root, olam, dt); root.userData.stats = { wildlife: root.children.length }; return sealRegionVisual(root);
}
export function installWildlifeTicker(olam, root) {
  if (!olam || !root?.userData?.tick || olam.__livingRegionWildlifeTicker) return;
  const ticker = { name: "living_region_wildlife_ticker", type: "livingRegionTicker", isReady: true, heesHawveh: true, heesHawvoos: dt => root.userData.tick(dt) };
  olam.__livingRegionWildlifeTicker = ticker; olam.__livingRegionWildlifeRoot = root;
  if (Array.isArray(olam.nivrayim) && !olam.nivrayim.includes(ticker)) olam.nivrayim.push(ticker);
}
