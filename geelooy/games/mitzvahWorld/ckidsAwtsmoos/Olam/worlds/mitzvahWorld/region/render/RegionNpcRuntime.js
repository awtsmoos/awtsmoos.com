// B"H
/** @file RegionNpcRuntime.js @description Grounded NPC schedules that drive real walk clips, without parser-clever syntax. */
import { groundY } from "./RegionGround.js";
import { rand } from "./RegionRandom.js";
const NPC_TYPES = new Set(["interactiveNpc", "customNpc", "medabeir"]);
function isNpc(entity) { return entity && NPC_TYPES.has(entity.type); }
function posOf(entity) { return entity && entity.mesh ? entity.mesh.position : null; }
function phaseAt(time) { const day = (time % 96) / 96; return day < .25 ? "morning" : day < .56 ? "noon" : day < .78 ? "evening" : "night"; }
function face(mesh, x, z) { const dx = x - mesh.position.x, dz = z - mesh.position.z; if (Math.hypot(dx, dz) > .001) mesh.rotation.y = Math.atan2(dx, dz); }
function setMotion(npc, role) { npc.__isWalking = role === "walk"; npc.motionRole = role; if (!npc.userData) npc.userData = {}; npc.userData.motionRole = role; if (typeof npc.playNpcMotion === "function") npc.playNpcMotion(role); if (npc.mesh && npc.mesh.userData) npc.mesh.userData.motionRole = role; }
function homeFor(schedule, p) { return schedule && schedule.home ? schedule.home : { x:p.x, z:p.z }; }
function speedFor(schedule) { return schedule && schedule.speed ? schedule.speed : .78; }
function seedNpc(npc, index, olam, schedule) { const p = posOf(npc); if (!p || npc.__livingRegionNpcRuntime) return; const home = homeFor(schedule, p); npc.__livingRegionNpcRuntime = { schedule, homeX:home.x, homeZ:home.z, phase:rand(index,40)*99, speed:speedFor(schedule), activePhase:"morning", destination:{ x:home.x, z:home.z }, wait:rand(index,90)*4, waypoint:0 }; npc.heesHawveh = true; npc.isReady = true; p.y = groundY(olam, p.x, p.z) + (npc.groundLift || .02); setMotion(npc, "idle"); }
function phaseSchedule(motion, phase) { return motion.schedule && motion.schedule.phases && motion.schedule.phases[phase] ? motion.schedule.phases[phase] : { x:motion.homeX, z:motion.homeZ }; }
function chooseDestination(motion, phase) { const s = phaseSchedule(motion, phase); motion.waypoint += 1; const a = rand(motion.waypoint, motion.phase) * Math.PI * 2, r = 1.2 + rand(motion.phase, motion.waypoint) * 3.8; motion.destination = { x:(s.x !== undefined ? s.x : motion.homeX) + Math.cos(a) * r, z:(s.z !== undefined ? s.z : motion.homeZ) + Math.sin(a) * r }; motion.wait = 1.4 + rand(motion.waypoint, 71) * 4.2; }
function livePlayerPosition(olam) { const actor = olam && (olam.player || olam.chossid); return actor && actor.mesh ? actor.mesh.position : null; }
function updateNpc(npc, olam, time, dt) { const mesh = npc.mesh, motion = npc.__livingRegionNpcRuntime; if (!mesh || !motion) return; const pp = livePlayerPosition(olam); if (pp && mesh.position.distanceTo(pp) < (npc.talkDistance || 8)) { face(mesh, pp.x, pp.z); setMotion(npc, "idle"); return; } const phase = phaseAt(time + motion.phase * .02); if (phase !== motion.activePhase) { motion.activePhase = phase; chooseDestination(motion, phase); } const dx = motion.destination.x - mesh.position.x, dz = motion.destination.z - mesh.position.z, distance = Math.hypot(dx, dz); if (distance < .2) { motion.wait -= dt; setMotion(npc, "idle"); if (motion.wait <= 0) chooseDestination(motion, phase); } else { const step = Math.min(distance, dt * motion.speed); mesh.position.x += dx / distance * step; mesh.position.z += dz / distance * step; face(mesh, motion.destination.x, motion.destination.z); setMotion(npc, "walk"); } mesh.position.y = groundY(olam, mesh.position.x, mesh.position.z) + (npc.groundLift || .02); }
function schedulesFromReport(report) { return report && report.npcSchedules && Array.isArray(report.npcSchedules.schedules) ? report.npcSchedules.schedules : []; }
export function installRegionNpcRuntime(olam, report = {}) {
  if (!olam || olam.__livingRegionNpcTicker) return null;
  const npcs = (olam.nivrayim || []).filter(isNpc), schedules = schedulesFromReport(report);
  npcs.forEach((npc, i) => seedNpc(npc, i, olam, schedules[i % Math.max(1, schedules.length)]));
  const ticker = { name:"living_region_npc_schedule_ticker", type:"livingRegionTicker", isReady:true, heesHawveh:true, time:0, heesHawvoos(dt = 1 / 60) { const d = Math.min(.05, Number(dt) || 1 / 60); this.time += d; for (const npc of npcs) updateNpc(npc, olam, this.time, d); } };
  olam.__livingRegionNpcTicker = ticker; olam.__livingRegionNpcRuntimeStats = { npcs:npcs.length, schedules:schedules.length, animationDriven:true };
  if (Array.isArray(olam.nivrayim)) olam.nivrayim.push(ticker);
  return ticker;
}
