// B"H
/** @file StatsUiState.js @description Icon-first stat sheet for player, weapons, animals, and Klipah. */
import { iconStat } from "./IconUiHelpers.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
const STAT_KEYS=["level","health","stamina","attack","defense","speed","focus","damage","range","weight","crit","block"];
function sourceStats(entity={}){ const stats=entity.stats||{}; return { level:entity.level, health:stats.maxHealth, stamina:stats.maxStamina, attack:stats.attack, defense:stats.defense, speed:stats.speed, focus:stats.focus, damage:entity.damage, range:entity.range, weight:entity.weight, crit:entity.criticalChance, block:entity.blockStrength }; }
export function statsUiState({ entity={}, compare=null }={}){ const base=sourceStats(entity), other=compare?sourceStats(compare):{}; const icons=STAT_KEYS.filter(k=>base[k]!=null).map(k=>iconStat(k,base[k],compare?Number(base[k]||0)-Number(other[k]||0):0)); return { id:entity.id||"stats", kind:entity.kind||entity.genre||"entity", iconGrid:icons, compact:true, minimalText:true, titleIcon:entity.genre?.includes("bow")?"🏹":entity.genre?.includes("staff")?"杖":entity.genre?.includes("sword")?"🗡️":"✦" }; }
export default statsUiState;
