// B"H
/**
 * @file NpcScheduleDirector.js
 * @description Chapter 1002: villagers receive home, work, and time-shaped routes.
 */
import { npcRouteNetwork } from "./NpcRouteNetwork.js";
import { NPC_PROFESSION_BEHAVIORS, NPC_ROLE_ORDER } from "./NpcProfessionBehaviors.js";

const NAMES = Object.freeze(["Reb Mendel", "Reb Levi", "Shmerel", "Reb Yitzchak", "Chaya", "Bentzion", "Mushkie"]);

export function buildNpcSchedulePlan(ctx = {}) {
  const routes = npcRouteNetwork(ctx.roads, ctx.houses || []);
  const schedules = NPC_ROLE_ORDER.map((role, i) => makeSchedule(role, i, routes));
  return {
    version: "npc-schedule-plan-v2-real-daily-routes",
    dayPhases: ["morning", "noon", "evening", "night"],
    routes,
    behaviors: NPC_PROFESSION_BEHAVIORS,
    schedules,
    summary: { schedules: schedules.length, roles: schedules.map(s => s.role) }
  };
}

function makeSchedule(role, index, routes) {
  const behavior = NPC_PROFESSION_BEHAVIORS[role] || NPC_PROFESSION_BEHAVIORS.child;
  const home = routes.destinations[`home${index % Math.max(1, Object.keys(routes.destinations).filter(k => k.startsWith("home")).length)}`] || point("home", -22 + index * 7, -14);
  const phases = Object.fromEntries(["morning", "noon", "evening", "night"].map(phase => [phase, destination(routes, behavior[phase], home)]));
  return { id: `npc_schedule_${role}_${index}`, name: NAMES[index % NAMES.length], role, home, work: phases.noon, speed: behavior.speed || .78, phases };
}

function destination(routes, id, home) { return id === "home" ? home : routes.destinations[id] || home; }
function point(id, x, z) { return { id, x, z }; }
