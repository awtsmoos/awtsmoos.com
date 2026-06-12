// B"H
/**
 * @file RegionNpcRuntime.js
 * @description Chapter 970: village NPCs receive tiny daily motion instead of statue silence.
 */
import { groundY } from "./RegionGround.js";
import { rand } from "./RegionRandom.js";
function isNpc(n) { return ["interactiveNpc", "customNpc", "medabeir"].includes(n?.type); }
function posOf(n) { return n?.mesh?.position || null; }
function seedNpc(npc, i, olam) {
  const p = posOf(npc); if (!p || npc.__livingRegionNpcRuntime) return;
  npc.__livingRegionNpcRuntime = { homeX: p.x, homeZ: p.z, phase: rand(i, 40) * 99, radius: 1.4 + rand(i, 41) * 2.8, speed: .22 + rand(i, 42) * .18, wait: rand(i, 43) * 3 };
  npc.heesHawveh = true; npc.isReady = true;
  p.y = groundY(olam, p.x, p.z) + (npc.groundLift || .02);
}
function face(mesh, x, z) { const dx = x - mesh.position.x, dz = z - mesh.position.z; if (Math.hypot(dx, dz) > .001) mesh.rotation.y = Math.atan2(dx, dz); }
function updateNpc(npc, olam, time, dt) {
  const mesh = npc.mesh, m = npc.__livingRegionNpcRuntime; if (!mesh || !m) return;
  const player = olam.player || olam.chossid, pp = player?.mesh?.position;
  if (pp && mesh.position.distanceTo(pp) < (npc.talkDistance || 8)) { face(mesh, pp.x, pp.z); return; }
  const a = time * m.speed + m.phase, tx = m.homeX + Math.cos(a) * m.radius, tz = m.homeZ + Math.sin(a * .7) * m.radius;
  const dx = tx - mesh.position.x, dz = tz - mesh.position.z, dist = Math.hypot(dx, dz);
  if (dist > .04) { const step = Math.min(dist, dt * .85); mesh.position.x += dx / dist * step; mesh.position.z += dz / dist * step; face(mesh, tx, tz); }
  mesh.position.y = groundY(olam, mesh.position.x, mesh.position.z) + (npc.groundLift || .02);
  mesh.userData ||= {}; mesh.userData.livingRegionScheduledNpc = true;
}
export function installRegionNpcRuntime(olam) {
  if (!olam || olam.__livingRegionNpcTicker) return null;
  const npcs = (olam.nivrayim || []).filter(isNpc); npcs.forEach((n, i) => seedNpc(n, i, olam));
  const ticker = { name: "living_region_npc_schedule_ticker", type: "livingRegionTicker", isReady: true, heesHawveh: true, heesHawvoos(dt = 1 / 60) { this.time = (this.time || 0) + Math.min(.08, Number(dt) || 1 / 60); for (const npc of npcs) updateNpc(npc, olam, this.time, Math.min(.08, Number(dt) || 1 / 60)); } };
  olam.__livingRegionNpcTicker = ticker; olam.__livingRegionNpcRuntimeStats = { npcs: npcs.length, mode: "small-schedule-wander-and-face-player" };
  if (Array.isArray(olam.nivrayim)) olam.nivrayim.push(ticker);
  return ticker;
}
