// B"H
/**
 * @file NpcScheduleRuntime.js
 * @description
 * Chapter 634: A villager is not a signpost. The Awtsmoos gives the NPC a
 * rhythm: walk between waypoints, idle when stopped, and turn toward the shliach
 * when conversation becomes the whole world.
 */
function emit(olam, name, payload) { olam?.ayshPeula?.("ui event", name, payload); }
function pos(npc) { return npc?.mesh?.position || npc?.modelMesh?.position || npc?.position || null; }
function playerPos(olam) { return (olam?.player || olam?.chossid)?.mesh?.position || null; }
function waypointVector(w) { return { x: Number(w?.x || 0), y: Number(w?.y || 0), z: Number(w?.z || 0) }; }
function dist(a, b) { return Math.hypot((a.x || 0) - (b.x || 0), (a.z || 0) - (b.z || 0)); }
export function ensureNpcSchedule(npc, data = {}) {
  if (!npc) return null;
  const home = waypointVector(pos(npc) || data.home || {});
  npc.npcSchedule ||= { waypoints: data.waypoints || [home], index: 0, speed: Number(data.speed || 1.2), state: "idle", waitUntil: 0, lastUpdate: Date.now() };
  return npc.npcSchedule;
}
export function updateNpcSchedule(npc, olam, dt = 1 / 60) {
  const schedule = ensureNpcSchedule(npc); const p = pos(npc); if (!schedule || !p) return false;
  if (npc.__conversationActive || olam?.__selectedFriendlyNpc === npc) return facePlayer(npc, olam), setNpcAnim(npc, "idle"), false;
  const now = Date.now(); if (now < schedule.waitUntil || schedule.waypoints.length < 2) return setNpcAnim(npc, "idle"), false;
  const target = waypointVector(schedule.waypoints[schedule.index]); const d = dist(p, target);
  if (d < 0.35) { schedule.index = (schedule.index + 1) % schedule.waypoints.length; schedule.waitUntil = now + 1400; schedule.state = "idle"; setNpcAnim(npc, "idle"); emit(olam, "npcSchedule", { npcId: npc.id, name: npc.name, state: "idle", waypoint: schedule.index }); return true; }
  const step = Math.min(d, schedule.speed * Number(dt || 1 / 60)); p.x += ((target.x || 0) - (p.x || 0)) / d * step; p.z += ((target.z || 0) - (p.z || 0)) / d * step; if (Number.isFinite(target.y)) p.y += (target.y - (p.y || 0)) * 0.05;
  if (npc.mesh) npc.mesh.rotation.y = Math.atan2((target.x || 0) - p.x, (target.z || 0) - p.z);
  schedule.state = "walking"; setNpcAnim(npc, "walk"); return true;
}
export function facePlayer(npc, olam) { const a = pos(npc), b = playerPos(olam); if (!a || !b || !npc?.mesh) return false; npc.mesh.rotation.y = Math.atan2((b.x || 0) - (a.x || 0), (b.z || 0) - (a.z || 0)); return true; }
export function setNpcAnim(npc, state = "idle") { const clip = state === "walk" ? (npc?.chaweeyoosMap?.walk || "walk") : (npc?.chaweeyoosMap?.idle || npc?.chaweeyoosMap?.stand || "stand"); npc?.playChaweeyoos?.(clip, { duration: 0.12, loop: true, force: false, timeScale: state === "walk" ? 1 : 0.7 }); npc.__npcAnimationState = state; return clip; }
export default { ensureNpcSchedule, updateNpcSchedule, facePlayer, setNpcAnim };
