// B"H
/** @file CombatRangeAudit.js @description Static/behavioral contract audit for close Shema and ranged Amidah attack rules. */
import { quoteMove } from "../../tochen/torah/AbilityIndex.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import { WEAPON_REGISTRY } from "./WeaponRegistry.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
export function runCombatRangeAudit() {
  const shema = quoteMove("shemaUnity"), amidah = quoteMove("amidahArrow"), bow = WEAPON_REGISTRY.keshes_haemes, sword = WEAPON_REGISTRY.cherev_hakodesh;
  return { ok:Boolean(shema && amidah && bow && sword && shema.rangeStyle === "close" && shema.weaponHint === "cherev_hakodesh" && shema.meleeSeries === 2 && amidah.rangeStyle === "long" && amidah.weaponHint === "keshes_haemes" && amidah.projectileRefine === true && amidah.maxRange >= 70), shema:{ id:shema?.id, rangeStyle:shema?.rangeStyle, weaponHint:shema?.weaponHint, maxRange:shema?.maxRange, meleeSeries:shema?.meleeSeries }, amidah:{ id:amidah?.id, rangeStyle:amidah?.rangeStyle, weaponHint:amidah?.weaponHint, minRange:amidah?.minRange, maxRange:amidah?.maxRange, projectileRefine:amidah?.projectileRefine }, weapons:{ sword:{ type:sword?.type, range:sword?.range }, bow:{ type:bow?.type, range:bow?.range } } };
}
export default { runCombatRangeAudit };
