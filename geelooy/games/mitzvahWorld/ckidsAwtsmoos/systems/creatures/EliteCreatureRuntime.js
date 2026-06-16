// B"H
/** @file EliteCreatureRuntime.js @description Marks elites with solo warnings, health multipliers, and UI payload. */
export const EliteRegistry = Object.freeze({ great_fox:{ id:"great_fox", name:"Great Fox of the Den", levelBonus:4, healthMultiplier:3, hint:"Elite: use range, leash, and rested buffs." }, ancient_stag:{ id:"ancient_stag", name:"Ancient Stag", levelBonus:5, healthMultiplier:4, hint:"Elite: prepare food and repair gear." } });
export function applyElite(creature, eliteId) { const e = EliteRegistry[eliteId]; if (!creature || !e) return false; creature.elite = e; creature.maxHp = Math.floor((creature.maxHp || 100) * e.healthMultiplier); creature.health && (creature.health.current = creature.maxHp); creature.mesh && Object.assign(creature.mesh.userData ||= {}, { elite:true, eliteId }); return creature; }
export function elitePayload(creature) { const e = creature?.elite || EliteRegistry[creature?.mesh?.userData?.eliteId]; return e ? { elite:true, ...e } : { elite:false }; }
export default { EliteRegistry, applyElite, elitePayload };
