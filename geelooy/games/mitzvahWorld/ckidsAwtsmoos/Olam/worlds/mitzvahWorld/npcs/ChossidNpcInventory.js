// B"H
/** @file ChossidNpcInventory.js @description Inventory and equipment helpers for real chossid.glb NPCs. */
const DEFAULT_EQUIPPED = Object.freeze({ head:"hat_basic_black", yamulka:"yamulka_black", torso:"jacket_basic", shirt:"shirt_white", legs:"pants_black", feet:"shoes_leather", accessory:"gartel_simple" });
const DEFAULT_ITEMS = Object.freeze([{ id:"challah_small", amount:2 }, { id:"scroll_chumash", amount:1 }, { id:"coin_gold", amount:10 }]);
function cloneItem(item) { return { ...item }; }
export function createChossidNpcInventory(def = {}) { return { equipped:{ ...DEFAULT_EQUIPPED, ...(def.equipped || {}) }, items:[...DEFAULT_ITEMS.map(cloneItem), ...(def.inventory || []).map(cloneItem)], coins:def.coins !== undefined ? def.coins : 10 }; }
