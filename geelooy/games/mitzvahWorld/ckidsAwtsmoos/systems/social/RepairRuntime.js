// B"H
/** Repair runtime with repairThing compatibility. */
export function repairCost(item={}){ return Math.max(1,Math.round((100-(item.durability??100))*0.4)); }
export function repair(item={}){ return {...item,durability:100,repairedAt:Date.now(),cost:repairCost(item)}; }
<<<<<<< HEAD
export function repairThing(olam={}, id="gear"){ const owner=olam.player||olam.chossid||olam; owner.repairs ||= []; const result={ id, durability:100, repairedAt:Date.now(), cost:1 }; owner.repairs.push(result); olam.ayshPeula?.("ui event","repairScreen",{ open:true, repaired:result }); return result; }
export default { repairCost, repair };
=======
export function repairThing(item={}) { const fixed=repair(item); globalThis.dispatchEvent?.(new CustomEvent('mitzvah-world:repair',{detail:fixed})); return fixed; }
export default { repairCost, repair, repairThing };
>>>>>>> 203e677cf2795021c8a1f733832a69b99c439c8b
