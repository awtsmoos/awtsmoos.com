// B"H
/** Delivery helpers for starter chesed quests, now tied into the starter signal river. */
function event(type, detail){ globalThis.dispatchEvent?.(new CustomEvent(type,{detail})); return detail; }
export function completeDelivery(runtime,id,target){ const m=runtime?.progress?.(id,1); const result=m?.objectives?.some(o=>o.target===target)?runtime.finish(id):m; event('mitzvah-world:starter-signal',{ signal:'delivery', evidence:{ id,target,result } }); return result; }
export function performDelivery(id='deliver_bread', target='elder_home', runtime=null) { if(runtime) return completeDelivery(runtime,id,target); const payload={id,target,deliveredAt:Date.now()}; event('mitzvah-world:delivery',payload); event('mitzvah-world:starter-signal',{ signal:'delivery', evidence:payload }); return payload; }
export default { completeDelivery, performDelivery };
