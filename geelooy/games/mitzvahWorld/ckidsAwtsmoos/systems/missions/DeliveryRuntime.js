// B"H
/** @file DeliveryRuntime.js @description Validates and performs simple shlichus deliveries. */
import { progressActiveObjectives } from "./MissionObjectiveRuntime.js";
function playerOf(olam) { return olam?.player || olam?.chossid || null; }
function posOf(entity) { return entity?.mesh?.position || entity?.position || { x:0, z:0 }; }
function distance(a, b) { return Math.hypot((a.x || 0) - (b.x || 0), (a.z || 0) - (b.z || 0)); }
const DELIVERY_TARGETS = Object.freeze({
  letters_to_deliver: { x:0, z:0, radius:999, label:"Village delivery post" },
  healing_herbs: { x:-22, z:12, radius:28, label:"Healer" },
  the_rebbes_first_mission: { x:0, z:0, radius:24, label:"Rebbe" }
});
function activeDeliveries(player) {
  return Object.values(player?.missionState?.active || {}).filter(m => (m.objectives || []).some(o => o.type === "deliver"));
}
function canDeliverMission(player, mission) {
  const target = DELIVERY_TARGETS[mission.id] || { x:0, z:0, radius:999, label:mission.giverNpc || mission.title };
  return { ok: distance(posOf(player), target) <= target.radius, target };
}
export function performDelivery(olam) {
  const player = playerOf(olam); if (!player) return { ok:false, reason:"no-player" };
  const missions = activeDeliveries(player); if (!missions.length) return { ok:false, reason:"no-delivery-objective" };
  const delivered = [], blocked = [];
  for (const mission of missions) {
    const check = canDeliverMission(player, mission);
    if (!check.ok) { blocked.push({ missionId:mission.id, target:check.target.label }); continue; }
    const touched = progressActiveObjectives(olam, "deliver", 1); delivered.push(...touched.filter(t => t.missionId === mission.id));
  }
  const ok = delivered.length > 0;
  olam?.ayshPeula?.("ui event", "delivery", { ok, delivered, blocked });
  return { ok, delivered, blocked };
}
export default { performDelivery };
