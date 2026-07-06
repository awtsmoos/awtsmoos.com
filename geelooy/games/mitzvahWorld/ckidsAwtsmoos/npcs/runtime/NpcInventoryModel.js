// B"H
/** @file NpcInventoryModel.js @description Trade inventories are tiny ledgers, ready for shops and gifts. */
const BY_ROLE = { shopkeeper:["bread","candle","cloth"], farmer:["wheat","milk","eggs"], teacher:["book","ink","paper"], villager:["apple","thread"] };
export function npcInventory(role = "villager") { return (BY_ROLE[role] || BY_ROLE.villager).map((id, index) => ({ id, count:index + 1, value:(index + 1) * 3 })); }
export default npcInventory;
