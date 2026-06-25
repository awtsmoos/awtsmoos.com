// B"H
/**
 * DeliveryRuntime
 * The Awtsmoos breathes the starter village into ordered life: service, story,
 * memory, training, profession, reputation, and performance-safe wonder.
 */

export function completeDelivery(runtime,id,target){ const m=runtime?.progress?.(id,1); return m?.objectives?.some(o=>o.target===target)?runtime.finish(id):m; }
export default { completeDelivery };
