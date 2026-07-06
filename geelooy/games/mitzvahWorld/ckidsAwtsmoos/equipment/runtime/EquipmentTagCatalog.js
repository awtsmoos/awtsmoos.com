// B"H
/** @file EquipmentTagCatalog.js @description The Awtsmoos threads item intent into hand, clip, shop, and spark tags. */
export const EQUIPMENT_TAGS = Object.freeze({
  RIGHT_HAND:"held:rightHand", LEFT_HAND:"held:leftHand", TWO_HAND:"held:twoHand", OFFHAND_LATER:"held:leftHandIkLater",
  BLADE:"weapon:blade", SWORD:"weapon:sword", DAGGER:"weapon:dagger", KNIFE:"weapon:knife", STAFF:"weapon:staff",
  WAND:"weapon:wand", CLUB:"weapon:club", SPEAR:"weapon:spear", AXE:"weapon:axe", HAMMER:"weapon:hammer",
  BOW:"weapon:bow", CROSSBOW:"weapon:crossbow", HEBREW_BOW:"weapon:hebrew-letter-bow", SLING:"weapon:sling",
  TOOL:"weapon:tool", HOLY:"weapon:holy", LETTER:"weapon:letter", TRAINING:"weapon:training", FARMING:"weapon:farming", CRAFTING:"weapon:crafting",
  AMMO_HEBREW:"ammo:hebrewLetters", CASTING:"weapon:casting", PROJECTILE:"weapon:projectile",
  STAB:"animation:stab", SLASH:"animation:slash", PUNCH:"animation:punch", CAST:"animation:cast", RANGED:"animation:ranged", BLOCK:"animation:block"
});
export function hasTag(item = {}, tag) { return Boolean(item.tags?.includes(tag)); }
export function tagsForGenre(genre = "hands") {
  const T = EQUIPMENT_TAGS;
  const map = { hands:[T.RIGHT_HAND,T.PUNCH], knife:[T.RIGHT_HAND,T.KNIFE,T.STAB], dagger:[T.RIGHT_HAND,T.DAGGER,T.STAB], shortSword:[T.RIGHT_HAND,T.SWORD,T.SLASH], longSword:[T.RIGHT_HAND,T.SWORD,T.SLASH], greatSword:[T.TWO_HAND,T.SWORD,T.SLASH,T.OFFHAND_LATER], staff:[T.TWO_HAND,T.STAFF,T.CASTING,T.BLOCK], wand:[T.RIGHT_HAND,T.WAND,T.CASTING], stick:[T.RIGHT_HAND,T.CLUB], club:[T.RIGHT_HAND,T.CLUB], spear:[T.TWO_HAND,T.SPEAR,T.STAB,T.OFFHAND_LATER], axe:[T.RIGHT_HAND,T.AXE,T.SLASH], hammer:[T.RIGHT_HAND,T.HAMMER], bow:[T.TWO_HAND,T.BOW,T.RANGED,T.PROJECTILE,T.OFFHAND_LATER], crossbow:[T.TWO_HAND,T.CROSSBOW,T.RANGED,T.PROJECTILE], hebrewBow:[T.TWO_HAND,T.BOW,T.HEBREW_BOW,T.AMMO_HEBREW,T.RANGED,T.PROJECTILE,T.OFFHAND_LATER], sling:[T.RIGHT_HAND,T.SLING,T.RANGED,T.PROJECTILE], throwingStone:[T.RIGHT_HAND,T.PROJECTILE], farmingTool:[T.RIGHT_HAND,T.TOOL,T.FARMING], craftingTool:[T.RIGHT_HAND,T.TOOL,T.CRAFTING], trainingWeapon:[T.RIGHT_HAND,T.TRAINING], holyWeapon:[T.RIGHT_HAND,T.HOLY,T.CASTING], letterWeapon:[T.RIGHT_HAND,T.LETTER,T.CASTING] };
  return map[genre] || map.hands;
}
export default EQUIPMENT_TAGS;
