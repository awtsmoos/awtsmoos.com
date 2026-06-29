// B"H
/**
 * @typedef {Object} StarterAction
 * @property {number} slot Visible hotbar slot, matching the old 1-6 keyboard rhythm.
 * @property {string} id Stable ability id used by combat, UI, and tests.
 * @property {string} label Short player-facing label.
 * @property {string} icon Emoji or compact glyph; every usable thing must have one.
 * @property {"attack"|"interact"|"loot"|"ui"} kind Gameplay category.
 * @property {"melee"|"ranged"=} style Attack delivery. Missing for non-attacks.
 * @property {number=} range Maximum useful range in world meters.
 * @property {number=} damage Direct health damage before armor/resists.
 * @property {number=} cooldownMs Cooldown target for real UI scheduling.
 * @property {number=} facingDot Minimum forward-dot; higher means stricter facing.
 * @property {number=} koachCost Player resource cost.
 * @property {string=} effect Hebrew-letter or UI effect hook.
 */

/**
 * A deliberately small action bar, like a first-generation MMO starter zone.
 *
 * The important part is not having fifty buttons. It is that each button has a
 * data contract the renderer can trust: icon, range, facing rule, cooldown, and
 * a stable id. Additional learned abilities should append rows with this shape.
 *
 * @type {ReadonlyArray<StarterAction>}
 */
export const STARTER_ACTION_BAR = Object.freeze([
  { slot:1, id:"melee_strike", label:"Strike", icon:"⚔️", kind:"attack", style:"melee", range:4.2, damage:34, cooldownMs:650, facingDot:0.25, koachCost:4, effect:"אות-קרוב" },
  { slot:2, id:"ranged_shot", label:"Bow", icon:"🏹", kind:"attack", style:"ranged", range:42, damage:22, cooldownMs:850, facingDot:0.35, koachCost:7, effect:"אות-רחוק" },
  { slot:3, id:"staff_letters", label:"Staff", icon:"✨", kind:"attack", style:"ranged", range:28, damage:18, cooldownMs:1200, facingDot:0.2, koachCost:9, effect:"א-ב-ג" },
  { slot:4, id:"talk_interact", label:"Talk", icon:"💬", kind:"interact", range:6, cooldownMs:250, facingDot:0.3 },
  { slot:5, id:"loot_all", label:"Loot", icon:"🎒", kind:"loot", range:5, cooldownMs:200 },
  { slot:6, id:"open_bag", label:"Bag", icon:"🧳", kind:"ui", cooldownMs:150 }
]);

export default STARTER_ACTION_BAR;
