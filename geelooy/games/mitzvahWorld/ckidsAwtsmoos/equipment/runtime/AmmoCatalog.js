// B"H
/** @file AmmoCatalog.js @description Arrows and letters are inventory items with levels, effects, and projectile stats. */
const A=(id,label,rarity,minLevel,damage,effect)=>Object.freeze({id,label,kind:"ammo",genre:"arrow",rarity,minLevel,damage,effect,stack:20,shopCategory:"Ammo",icon:"➵"});
export const AMMO_ITEMS=Object.freeze({ reedArrow:A("reedArrow","Reed Arrow","common",1,3,"plain"), cedarArrow:A("cedarArrow","Cedar Arrow","common",2,5,"steady"), ironTipArrow:A("ironTipArrow","Iron Tip Arrow","uncommon",4,8,"pierce"), silverArrow:A("silverArrow","Silver Arrow","rare",7,11,"klipah-weak"), glowingLetterArrow:A("glowingLetterArrow","Glowing Letter Arrow","rare",8,9,"purify"), alefArrow:A("alefArrow","Alef Arrow","holy",10,13,"letter-pulse") });
export function ammoList(){ return Object.values(AMMO_ITEMS); }
export function ammoById(id){ return AMMO_ITEMS[id]||null; }
export default AMMO_ITEMS;
