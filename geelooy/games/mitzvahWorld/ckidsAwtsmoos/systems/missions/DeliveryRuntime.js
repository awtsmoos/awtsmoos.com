// B"H
/** Delivery helpers for starter chesed quests. */
export function completeDelivery(runtime,id,target){ const m=runtime?.progress?.(id,1); return m?.objectives?.some(o=>o.target===target)?runtime.finish(id):m; }
export function performDelivery(id='deliver_bread', target='elder_home', runtime=null) { if(runtime) return completeDelivery(runtime,id,target); const payload={id,target,deliveredAt:Date.now()}; globalThis.dispatchEvent?.(new CustomEvent('mitzvah-world:delivery',{detail:payload})); return payload; }
export default { completeDelivery, performDelivery };
