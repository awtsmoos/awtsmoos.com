// B"H
/** Repair runtime with repairThing compatibility. */
export function repairCost(item={}){ return Math.max(1,Math.round((100-(item.durability??100))*0.4)); }
export function repair(item={}){ return {...item,durability:100,repairedAt:Date.now(),cost:repairCost(item)}; }
export function repairThing(item={}) { const fixed=repair(item); globalThis.dispatchEvent?.(new CustomEvent('mitzvah-world:repair',{detail:fixed})); return fixed; }
export default { repairCost, repair, repairThing };
