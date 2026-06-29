// B"H
<<<<<<< HEAD
/**
 * DeliveryRuntime
 * The Awtsmoos breathes the starter village into ordered life: service, story,
 * memory, training, profession, reputation, and performance-safe wonder.
 */

export function completeDelivery(runtime,id,target){ const m=runtime?.progress?.(id,1); return m?.objectives?.some(o=>o.target===target)?runtime.finish(id):m; }
export function performDelivery(olam={}, target="elder_home"){ const owner=olam.player||olam.chossid||olam, active=owner.activeMissions||{}; const mission=Object.values(active).find(m=>(m.objectives||[]).some(o=>o.kind==="deliver")); if(!mission) return { ok:false, reason:"no-active-delivery", blocked:[{ target }] }; mission.progress=(mission.progress||0)+1; const done=mission.progress>=(mission.objectives?.[0]?.count||1); olam.ayshPeula?.("ui event","deliveryUpdate",{ missionId:mission.id, target, done }); return { ok:true, mission, target, done }; }
=======
/** Delivery helpers for starter chesed quests, now tied into the starter signal river. */
function event(type, detail){ globalThis.dispatchEvent?.(new CustomEvent(type,{detail})); return detail; }
export function completeDelivery(runtime,id,target){ const m=runtime?.progress?.(id,1); const result=m?.objectives?.some(o=>o.target===target)?runtime.finish(id):m; event('mitzvah-world:starter-signal',{ signal:'delivery', evidence:{ id,target,result } }); return result; }
export function performDelivery(id='deliver_bread', target='elder_home', runtime=null) { if(runtime) return completeDelivery(runtime,id,target); const payload={id,target,deliveredAt:Date.now()}; event('mitzvah-world:delivery',payload); event('mitzvah-world:starter-signal',{ signal:'delivery', evidence:payload }); return payload; }
>>>>>>> 203e677cf2795021c8a1f733832a69b99c439c8b
export default { completeDelivery, performDelivery };
