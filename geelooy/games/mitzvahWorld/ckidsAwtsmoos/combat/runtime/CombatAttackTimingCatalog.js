// B"H
/** @file CombatAttackTimingCatalog.js @description Startup, charge, cast, active, recovery, cooldown, and stamina by weapon family. */
import { weaponGenreKeys } from "../../equipment/runtime/WeaponGenreCatalog.js";
import { weaponList } from "../../equipment/runtime/WeaponStatCatalog.js";
const T=(startup,chargeTime,castTime,active,recovery,cooldown,stamina,interruptible=true)=>Object.freeze({startup,chargeTime,castTime,active,recovery,cooldown,stamina,interruptible});
export const ATTACK_TIMINGS = Object.freeze({ hands:T(70,0,0,120,180,260,4), knife:T(90,0,0,130,210,330,6), dagger:T(85,0,0,125,200,320,6), shortSword:T(130,180,0,180,320,520,10), longSword:T(190,420,0,230,430,760,16), greatSword:T(260,520,0,280,620,980,22), staff:T(160,240,380,260,360,820,12), wand:T(110,180,420,120,260,700,9), stick:T(110,120,0,150,260,420,6), club:T(180,250,0,190,420,700,12), spear:T(170,260,0,170,340,620,12), axe:T(200,320,0,210,460,760,15), hammer:T(220,360,0,220,500,820,16), bow:T(120,900,0,90,360,760,10), crossbow:T(180,500,280,95,460,1000,12,false), hebrewBow:T(160,1200,0,100,420,900,14), sling:T(140,520,0,100,320,690,7), throwingStone:T(100,220,0,80,260,520,4), farmingTool:T(150,180,0,150,330,560,8), craftingTool:T(120,80,0,110,220,420,4), trainingWeapon:T(100,100,0,130,240,390,4), holyWeapon:T(160,260,460,130,340,840,13), letterWeapon:T(130,260,360,110,300,780,10) });
export function attackTiming(genre="hands") { return ATTACK_TIMINGS[genre] || ATTACK_TIMINGS.hands; }
export function itemAttackTiming(itemId){ const item=weaponList().find(w=>w.id===itemId); return item ? {...attackTiming(item.genre), itemId, genre:item.genre} : {...ATTACK_TIMINGS.hands, itemId:null, genre:"hands"}; }
export function missingTimingGenres(){ return weaponGenreKeys().filter(key => !ATTACK_TIMINGS[key]); }
export default ATTACK_TIMINGS;
