// B"H
/** @file AnimalCombatProfile.js @description Animal levels, stats, moves, and XP value are real runtime data. */
import { statGrowth, xpReward } from "../../progression/runtime/LevelCurveRuntime.js";
import { movesForRole } from "../../progression/runtime/MoveStatCatalog.js";
const ROLE={ sheep:"grazer",cow:"horned",goat:"horned",deer:"horned",gazelle:"grazer",chicken:"bird",turkey:"bird",dove:"bird",pigeon:"bird",duck:"waterfowl",goose:"waterfowl",fish:"waterfowl" };
export function animalRole(species="sheep"){ return ROLE[species]||"grazer"; }
export function animalCombatProfile({species="sheep",level=1,physiology={}}={}){ const base=statGrowth(level), role=animalRole(species), massBonus=Math.min(20,Math.round((physiology.mass||30)/35)); return { level, role, stats:{...base,maxHealth:base.maxHealth+massBonus*3,attack:base.attack+massBonus,defense:base.defense+Math.round(massBonus/2)}, moves:movesForRole(role).map(m=>({...m,damage:Math.round(m.damage*(1+level*.08)),stamina:Math.round(m.stamina*(1+level*.03))})), xpValue:xpReward({victorLevel:level,targetLevel:level,base:12}) }; }
export default animalCombatProfile;
