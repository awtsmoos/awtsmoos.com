// B"H
/**
 * @file NpcScheduleDirector.js
 * @description Chapter 1003: every villager path is carved at load time; during play
 * the NPC merely remembers the next simple point, like a quiet spark orbiting home.
 */
import { npcRouteNetwork } from "./NpcRouteNetwork.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import { NPC_PROFESSION_BEHAVIORS, NPC_ROLE_ORDER } from "./NpcProfessionBehaviors.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
const NAMES = Object.freeze(["Reb Mendel", "Reb Levi", "Shmerel", "Reb Yitzchak", "Chaya", "Bentzion", "Mushkie"]);
const PHASES = Object.freeze(["morning", "noon", "evening", "night"]);
function point(id, x, z) { return { id, x:Number(x)||0, z:Number(z)||0 }; }
function dist(a, b) { const dx = (a.x||0) - (b.x||0), dz = (a.z||0) - (b.z||0); return Math.hypot(dx, dz); }
function lerp(a, b, t) { return point(`${a.id}_${b.id}_${Math.round(t*100)}`, a.x + (b.x - a.x) * t, a.z + (b.z - a.z) * t); }
function homeCount(routes) { return Math.max(1, Object.keys(routes.destinations).filter(k => k.startsWith("home")).length); }
function destination(routes, id, home) { return id === "home" ? home : routes.destinations[id] || home; }
function simplePath(from, to) {
  if (!from || !to) return [];
  const steps = Math.max(1, Math.min(8, Math.ceil(dist(from, to) / 36)));
  const route = [point(from.id || "from", from.x, from.z)];
  for (let i = 1; i < steps; i++) route.push(lerp(from, to, i / steps));
  route.push(point(to.id || "to", to.x, to.z));
  return route;
}
function phasePaths(phases, home) {
  const out = {}; let previous = home;
  for (const phase of PHASES) { out[phase] = simplePath(previous, phases[phase]); previous = phases[phase]; }
  out.loop = simplePath(previous, home); return out;
}
function makeSchedule(role, index, routes) {
  const behavior = NPC_PROFESSION_BEHAVIORS[role] || NPC_PROFESSION_BEHAVIORS.child;
  const home = routes.destinations[`home${index % homeCount(routes)}`] || point("home", -22 + index * 7, -14);
  const phases = Object.fromEntries(PHASES.map(phase => [phase, destination(routes, behavior[phase], home)]));
  const paths = phasePaths(phases, home);
  return { id:`npc_schedule_${role}_${index}`, name:NAMES[index % NAMES.length], role, home, work:phases.noon, speed:behavior.speed || .78, phases, paths, precomputed:true };
}
export function buildNpcSchedulePlan(ctx = {}) {
  const routes = npcRouteNetwork(ctx.roads, ctx.houses || []), schedules = NPC_ROLE_ORDER.map((role, i) => makeSchedule(role, i, routes));
  return { version:"npc-schedule-plan-v3-precomputed-simple-routes", dayPhases:PHASES.slice(), routes, behaviors:NPC_PROFESSION_BEHAVIORS, schedules, summary:{ schedules:schedules.length, precomputedPaths:schedules.reduce((n,s)=>n+Object.keys(s.paths).length,0), roles:schedules.map(s=>s.role) } };
}
