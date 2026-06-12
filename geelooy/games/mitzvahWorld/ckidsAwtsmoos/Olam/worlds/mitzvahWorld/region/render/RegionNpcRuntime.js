// B"H
/**
 * @file RegionNpcRuntime.js
 * @description Chapter 1003: NPCs follow daily schedules, face the player, and report motion.
 */
import { groundY } from "./RegionGround.js";
import { rand } from "./RegionRandom.js";
function isNpc(n) { return ["interactiveNpc", "customNpc", "medabeir"].includes(n?.type); }
function posOf(n) { return n?.mesh?.position || null; }
function phaseAt(time) { const day = (time % 96) / 96; return day < .25 ? "morning" : day < .56 ? "noon" : day < .78 ? "evening" : "night"; }
function face(mesh, x, z) { const dx = x - mesh.position.x, dz = z - mesh.position.z; if (Math.hypot(dx, dz) > .001) mesh.rotation.y = Math.atan2(dx, dz); }

function seedNpc(npc, i, olam, schedule) {
  const p = posOf(npc); if (!p || npc.__livingRegionNpcRuntime) return;
  const home = schedule?.home || { x: p.x, z: p.z };
  npc.__livingRegionNpcRuntime = { schedule, homeX: home.x, homeZ: home.z, phase: rand(i, 40) * 99, speed: schedule?.speed || .78, activePhase: "morning", target: schedule?.phases?.morning || home };
  npc.heesHawveh = true; npc.isReady = true; p.y = groundY(olam, p.x, p.z) + (npc.groundLift || .02);
  Object.assign(npc.mesh.userData ||= {}, { npcRole: schedule?.role || "villager", npcScheduleId: schedule?.id || null });
}
function updateNpc(npc, olam, time, dt) {
  const mesh = npc.mesh, m = npc.__livingRegionNpcRuntime; if (!mesh || !m) return;
  const player = olam.player || olam.chossid, pp = player?.mesh?.position;
  if (pp && mesh.position.distanceTo(pp) < (npc.talkDistance || 8)) { face(mesh, pp.x, pp.z); return; }
  const phase = phaseAt(time + m.phase * .02), scheduled = m.schedule?.phases?.[phase];
  m.activePhase = phase; m.target = scheduled || m.target;
  const wobble = Math.sin(time * .7 + m.phase) * 1.2;
  const tx = (m.target?.x ?? m.homeX) + wobble, tz = (m.target?.z ?? m.homeZ) + Math.cos(time * .5 + m.phase) * 1.2;
  const dx = tx - mesh.position.x, dz = tz - mesh.position.z, dist = Math.hypot(dx, dz);
  if (dist > .08) { const step = Math.min(dist, dt * m.speed * 2.2); mesh.position.x += dx / dist * step; mesh.position.z += dz / dist * step; face(mesh, tx, tz); }
  mesh.position.y = groundY(olam, mesh.position.x, mesh.position.z) + (npc.groundLift || .02);
  Object.assign(mesh.userData ||= {}, { livingRegionScheduledNpc: true, activePhase: phase, destination: m.target?.id || "home" });
}
export function installRegionNpcRuntime(olam, report = {}) {
  if (!olam || olam.__livingRegionNpcTicker) return null;
  const npcs = (olam.nivrayim || []).filter(isNpc);
  const schedules = report.npcSchedules?.schedules || [];
  npcs.forEach((n, i) => seedNpc(n, i, olam, schedules[i % Math.max(1, schedules.length)]));
  const ticker = { name: "living_region_npc_schedule_ticker", type: "livingRegionTicker", isReady: true, heesHawveh: true, heesHawvoos(dt = 1 / 60) { this.time = (this.time || 0) + Math.min(.08, Number(dt) || 1 / 60); for (const npc of npcs) updateNpc(npc, olam, this.time, Math.min(.08, Number(dt) || 1 / 60)); } };
  olam.__livingRegionNpcTicker = ticker; olam.__livingRegionNpcRuntimeStats = { npcs: npcs.length, schedules: schedules.length, mode: "daily-role-routes-home-work-phase" };
  if (Array.isArray(olam.nivrayim)) olam.nivrayim.push(ticker);
  return ticker;
}
