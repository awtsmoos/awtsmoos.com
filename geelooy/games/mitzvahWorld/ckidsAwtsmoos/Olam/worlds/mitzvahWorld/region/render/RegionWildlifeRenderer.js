// B"H
/**
 * @file RegionWildlifeRenderer.js
 * @description Chapter 1010: animals now flee, hunt, graze, drink, climb, and flock.
 */
import * as THREE from "/games/scripts/build/three.module.js";
import { regionGeometry } from "./RegionGeometry.js";
import { regionMaterial } from "./RegionMaterials.js?v=fast-region-materials-20260612-bh1";
import { groundY } from "./RegionGround.js";
import { rand } from "./RegionRandom.js";
import { sealRegionVisual } from "./RegionSeal.js";
import { advanceNeeds } from "../wildlife/AnimalNeedsModel.js";

const SPEC = { rabbit: [.45, .25, .65, "cottonFiber"], fox: [.75, .38, 1.05, "carrotSkin"], deer: [1, .85, 1.45, "barkOak"], frog: [.32, .18, .32, "cabbageLeaf"], goat: [.75, .55, 1, "linenFabric"], bird: [.32, .18, .5, "daisyPetal"] };
const DEFAULT_COUNTS = { rabbit: 18, fox: 6, deer: 8, frog: 12, goat: 6 };
function animalsFromReport(report) { return report.wildlife?.animals?.length ? report.wildlife.animals : fallbackAnimals(); }
function fallbackAnimals() { const out = []; for (const [species, count] of Object.entries(DEFAULT_COUNTS)) for (let i = 0; i < count; i++) out.push({ id: `${species}_${i}`, species, x: (rand(i, 1) - .5) * 320, z: (rand(i, 2) - .5) * 160, state: "wander", needs: {} }); return out; }
function actor(animal, i, olam) {
  const [sx, sy, sz, mat] = SPEC[animal.species] || SPEC.rabbit, g = new THREE.Group(); g.name = `wild_${animal.id || `${animal.species}_${i}`}`;
  const body = new THREE.Mesh(regionGeometry("rock"), regionMaterial(mat)); body.scale.set(sx, sy, sz); body.position.y = sy * .5;
  const head = new THREE.Mesh(regionGeometry("rock"), regionMaterial(mat)); head.scale.set(sx * .42, sy * .55, sz * .42); head.position.set(0, sy * .75, sz * .55); g.add(body, head);
  const x = animal.x ?? 0, z = animal.z ?? 0; g.position.set(x, groundY(olam, x, z) + .04, z);
  g.userData.motion = { ...animal, baseX: x, baseZ: z, phase: rand(i, 3) * 100, radius: animal.territory?.radius || 22, speed: animal.traits?.speed || .8, needs: { ...(animal.needs || {}) } };
  return sealRegionVisual(g, { wildlifeActor: true, species: animal.species });
}
function nearest(root, species, from) { let best = null, d = Infinity; for (const c of root.children) { const m = c.userData.motion; if (!m || m.species !== species) continue; const n = c.position.distanceTo(from.position); if (n < d) { best = c; d = n; } } return { best, d }; }
function chooseState(root, animal, m, olam) {
  advanceNeeds(m.needs, .016);
  const player = olam.player || olam.chossid, pp = player?.mesh?.position;
  if (animal.species === "fox") { const r = nearest(root, "rabbit", animal); return r.best && r.d < 42 ? { state: r.d < 2.4 ? "attack" : "hunt", target: r.best.position } : { state: "patrol" }; }
  if (animal.species === "rabbit") { const f = nearest(root, "fox", animal); return f.best && f.d < 50 ? { state: "flee", target: f.best.position } : { state: m.needs.hunger > .55 ? "graze" : "hide" }; }
  if (animal.species === "deer" && pp && animal.position.distanceTo(pp) < 20) return { state: "fleePlayer", target: pp };
  if (animal.species === "frog") return { state: "drink" };
  if (animal.species === "goat") return { state: "climb" };
  if (animal.species === "bird") return { state: "flock" };
  return { state: "graze" };
}
function tickRoot(root, olam, dt = 1 / 60) {
  root.userData.time = (root.userData.time || 0) + Math.min(.08, Math.max(.001, Number(dt) || 1 / 60));
  const t = root.userData.time;
  for (const c of root.children) {
    const m = c.userData.motion; if (!m) continue;
    const decision = chooseState(root, c, m, olam); m.state = decision.state;
    let x = m.baseX + Math.cos(t * m.speed + m.phase) * m.radius, z = m.baseZ + Math.sin(t * m.speed * .8 + m.phase) * m.radius * .45;
    if (decision.target && decision.state.startsWith("flee")) { x += (c.position.x - decision.target.x) * .035; z += (c.position.z - decision.target.z) * .035; }
    if (decision.target && ["hunt", "attack"].includes(decision.state)) { x += (decision.target.x - c.position.x) * .055; z += (decision.target.z - c.position.z) * .055; }
    const bounce = ["rabbit", "frog", "bird"].includes(m.species) ? Math.abs(Math.sin(t * 7 + m.phase)) * .14 : Math.abs(Math.sin(t * 2 + m.phase)) * .04;
    c.position.set(x, groundY(olam, x, z) + .04 + bounce + (m.species === "bird" ? 5 + Math.sin(t + m.phase) * 2 : 0), z);
    c.rotation.y = Math.atan2(z - m.baseZ, x - m.baseX) - Math.PI / 2; c.userData.state = m.state;
  }
  root.userData.stats = summarize(root);
}
function summarize(root) { const states = {}; for (const c of root.children) states[c.userData.state || c.userData.motion?.state || "unknown"] = (states[c.userData.state || c.userData.motion?.state || "unknown"] || 0) + 1; return { wildlife: root.children.length, states }; }
export function buildWildlifeRenderer(olam, report = {}) { const root = new THREE.Group(); root.name = "living_region_wildlife_runtime"; animalsFromReport(report).forEach((a, i) => root.add(actor(a, i, olam))); root.userData.tick = dt => tickRoot(root, olam, dt); root.userData.stats = summarize(root); return sealRegionVisual(root); }
export function installWildlifeTicker(olam, root) { if (!olam || !root?.userData?.tick || olam.__livingRegionWildlifeTicker) return; const ticker = { name: "living_region_wildlife_ticker", type: "livingRegionTicker", isReady: true, heesHawveh: true, heesHawvoos: dt => root.userData.tick(dt) }; olam.__livingRegionWildlifeTicker = ticker; olam.__livingRegionWildlifeRoot = root; if (Array.isArray(olam.nivrayim) && !olam.nivrayim.includes(ticker)) olam.nivrayim.push(ticker); }
