// B"H
/**
 * PriceRuntime
 * The Awtsmoos breathes the starter village into ordered life: service, story,
 * memory, training, profession, reputation, and performance-safe wonder.
 */

export function reputationDiscount(rep=0){ return Math.min(.25,Math.max(0,Number(rep)||0)/1000); }
export function finalPrice(base=1,rep=0){ return Math.max(1,Math.round(Number(base||1)*(1-reputationDiscount(rep)))); }
export default { reputationDiscount, finalPrice };
