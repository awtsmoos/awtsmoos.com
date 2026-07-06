// B"H
/** @file ClothingSlotCatalog.js @description Clothing slots for visible kavod and real gameplay stats. */
export const CLOTHING_SLOTS = Object.freeze(["hat","yarmulka","glasses","coat","shirt","pants","shoes","belt","gloves"]);
export function isClothingSlot(slot) { return CLOTHING_SLOTS.includes(slot); }
export default CLOTHING_SLOTS;
