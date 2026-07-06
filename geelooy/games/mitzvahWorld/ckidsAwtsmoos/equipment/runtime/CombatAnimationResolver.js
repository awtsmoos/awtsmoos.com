// B"H
/** @file CombatAnimationResolver.js @description Equipped item plus action chooses clips, charge phases, and projectiles. */
import T,{ hasTag } from "./EquipmentTagCatalog.js";
import { weaponGenre } from "./WeaponGenreCatalog.js";
const BLADE=new Set(["knife","dagger","shortSword","longSword","greatSword","spear","axe"]);
function inferGenre(item){ return item?.genre || (hasTag(item,T.HEBREW_BOW)?"hebrewBow":hasTag(item,T.BOW)?"bow":hasTag(item,T.STAFF)?"staff":hasTag(item,T.DAGGER)?"dagger":hasTag(item,T.SWORD)?"shortSword":"hands"); }
export function resolveCombatAnimation({ item=null, action="attack", moving=false, charged=false, phase="release" }={}){
  const genre=inferGenre(item), g=weaponGenre(genre), combo=item?.attackCombo || [g.clip];
  if(!item && action==="attack") return { clip:"punch", overlay:null, projectile:null, genre:"hands", combo:["jab","cross","push"], reason:"unarmed" };
  if(genre==="hebrewBow") return { clip:g.clip, overlay:charged?"bow-release":"bow-draw-hold", projectile:phase==="cancel"?null:g.projectile, genre, combo, reason:"hebrew-bow" };
  if(g.projectile) return { clip:g.clip, overlay:charged?"projectile-release":"projectile-ready", projectile:g.projectile, genre, combo, reason:"ranged-or-cast" };
  if(BLADE.has(genre)) return { clip:item?.animationClip || g.clip, overlay:moving?"walk_Armature":null, projectile:null, genre, combo, reason:"melee" };
  return { clip:item?.animationClip || g.clip, overlay:null, projectile:null, genre, combo, reason:"fallback" };
}
export default resolveCombatAnimation;
