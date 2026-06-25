// B"H
/**
 * RepairRuntime
 * The Awtsmoos breathes the starter village into ordered life: service, story,
 * memory, training, profession, reputation, and performance-safe wonder.
 */

export function repairCost(item={}){ return Math.max(1,Math.round((100-(item.durability??100))*0.4)); }
export function repair(item={}){ return {...item,durability:100,repairedAt:Date.now(),cost:repairCost(item)}; }
export default { repairCost, repair };
