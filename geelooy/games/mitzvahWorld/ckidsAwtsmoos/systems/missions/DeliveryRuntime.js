// B"H
/** Delivery helpers for starter chesed quests, tied into the starter signal river. */
function event(type, detail) {
  globalThis.dispatchEvent?.(new CustomEvent(type, { detail }));
  return detail;
}

export function completeDelivery(runtime, id, target) {
  const mission = runtime?.progress?.(id, 1);
  const result = mission?.objectives?.some(o => o.target === target) ? runtime.finish(id) : mission;
  event("mitzvah-world:starter-signal", { signal:"delivery", evidence:{ id, target, result } });
  return result;
}

export function performDelivery(olamOrId = {}, target = "elder_home", runtime = null) {
  const legacyOlam = typeof olamOrId === "object" && (olamOrId.ayshPeula || olamOrId.player || olamOrId.chossid || olamOrId.activeMissions);
  if (!legacyOlam) {
    if (runtime) return completeDelivery(runtime, olamOrId, target);
    const payload = { ok:true, id:olamOrId || "deliver_bread", target, deliveredAt:Date.now() };
    event("mitzvah-world:delivery", payload);
    event("mitzvah-world:starter-signal", { signal:"delivery", evidence:payload });
    return payload;
  }
  const owner = olamOrId.player || olamOrId.chossid || olamOrId;
  const active = owner.activeMissions || olamOrId.__activeMissions || {};
  const mission = Object.values(active).find(m => (m.objectives || []).some(o => /deliver|bring/i.test(String(o.kind || o.id || ""))));
  if (!mission) return { ok:false, reason:"no-active-delivery", blocked:[{ target }] };
  mission.progress = (mission.progress || 0) + 1;
  const done = mission.progress >= (mission.objectives?.[0]?.count || mission.objectives?.[0]?.needed || 1);
  olamOrId.ayshPeula?.("ui event", "deliveryUpdate", { missionId:mission.id, target, done });
  const payload = { ok:true, mission, target, done };
  event("mitzvah-world:starter-signal", { signal:"delivery", evidence:payload });
  return payload;
}

export default { completeDelivery, performDelivery };
