// B"H
/** @file KeyRegistry.js @description Keys for houses, gates, yards, and permission quests. */
export const KeyRegistry = Object.freeze({
  village_master_key: { id: "village_master_key", name: "Village Master Key", opens: ["all"] },
  farmer_key: { id: "farmer_key", name: "Farmer's Yard Key", opens: ["farmer"] },
  baker_key: { id: "baker_key", name: "Bakery Delivery Key", opens: ["baker"] },
  orchardKeeper_key: { id: "orchardKeeper_key", name: "Orchard Gate Key", opens: ["orchardKeeper"] },
  kohenTeacher_key: { id: "kohenTeacher_key", name: "Kohen Courtyard Key", opens: ["kohenTeacher"] },
  leviTeacher_key: { id: "leviTeacher_key", name: "Levi Storehouse Key", opens: ["leviTeacher"] }
});
export function keyItem(id) { const k = KeyRegistry[id]; return k ? { ...k, category: "Quest Items", icon: "🗝", quantity: 1 } : null; }
export function hasKey(player, keyId) { return !keyId || (player?.inventory?.slots || []).some(i => i?.id === keyId) || (player?.bag?.categories?.["Quest Items"] || []).some(i => i?.id === keyId); }
export default KeyRegistry;
