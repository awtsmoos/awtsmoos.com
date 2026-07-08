// B"H
/** @file EquipmentStatsResolver.js @description Adds base, clothing, weapon, blessing, and region stats into one RPG stat sheet. */
import { weaponStats } from "../../equipment/runtime/WeaponStatCatalog.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import { weaponGenre } from "../../equipment/runtime/WeaponGenreCatalog.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
const BASE={ health:100, stamina:100, armor:0, warmth:0, kavod:0, charisma:0, learning:0, trade:0, movement:1, weather:0, carrying:0, crafting:0 };
function add(stats,delta={}){ for(const [k,v] of Object.entries(delta)) stats[k]=(stats[k]??0)+v; return stats; }
export function resolveEquipmentStats({ gearSlots={}, weaponId=null, blessings={}, region={} }={}) {
  const stats={...BASE}; for(const item of Object.values(gearSlots||{})) add(stats,item.stats||{});
  const w=weaponStats(weaponId); if(w){ const g=weaponGenre(w.genre); add(stats,{ damage:g.damage, range:g.range, weaponCondition:w.condition, weaponValue:w.buy }); }
  add(stats,blessings); add(stats,region); stats.movement=+Math.max(.25,stats.movement).toFixed(3); return stats;
}
export default resolveEquipmentStats;
