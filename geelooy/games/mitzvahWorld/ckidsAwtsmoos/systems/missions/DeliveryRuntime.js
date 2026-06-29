// B"H
/**
 * DeliveryRuntime
 * The Awtsmoos breathes the starter village into ordered life: service, story,
 * memory, training, profession, reputation, and performance-safe wonder.
 */

export function completeDelivery(runtime,id,target){ const m=runtime?.progress?.(id,1); return m?.objectives?.some(o=>o.target===target)?runtime.finish(id):m; }
export function performDelivery(olam={}, target="elder_home"){ const owner=olam.player||olam.chossid||olam, active=owner.activeMissions||{}; const mission=Object.values(active).find(m=>(m.objectives||[]).some(o=>o.kind==="deliver")); if(!mission) return { ok:false, reason:"no-active-delivery", blocked:[{ target }] }; mission.progress=(mission.progress||0)+1; const done=mission.progress>=(mission.objectives?.[0]?.count||1); olam.ayshPeula?.("ui event","deliveryUpdate",{ missionId:mission.id, target, done }); return { ok:true, mission, target, done }; }
export default { completeDelivery, performDelivery };
