/**
 * B"H
 * @file index.js — MASTER ITEM REGISTRY
 * All items unified — searchable, filterable, price-normalized.
 */
import { APPAREL_REGISTRY, APPAREL_LIST }       from './apparel.js';
import { CONSUMABLES_REGISTRY, CONSUMABLES_LIST } from './consumables.js';
import { WEAPONS_REGISTRY, WEAPONS_LIST }         from './weapons.js';

export { APPAREL_REGISTRY, CONSUMABLES_REGISTRY, WEAPONS_REGISTRY };

/** Flat master list of all items */
export const ALL_ITEMS = [...APPAREL_LIST, ...CONSUMABLES_LIST, ...WEAPONS_LIST];

/** Index by ID for O(1) lookup */
export const ITEM_BY_ID = Object.fromEntries(ALL_ITEMS.map(i => [i.id, i]));

/** Items grouped by category */
export const ITEMS_BY_CATEGORY = ALL_ITEMS.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
}, {});

/** Items grouped by rarity */
export const ITEMS_BY_RARITY = ALL_ITEMS.reduce((acc, item) => {
    if (!acc[item.rarity]) acc[item.rarity] = [];
    acc[item.rarity].push(item);
    return acc;
}, {});

/**
 * @function getShopInventory
 * Build a filtered shop inventory by rarity, category, max price
 */
export function getShopInventory({ categories = null, maxRarity = 'EPIC', maxPrice = Infinity } = {}) {
    const rarityOrder = ['COMMON','UNCOMMON','RARE','EPIC','LEGENDARY'];
    const maxIdx = rarityOrder.indexOf(maxRarity);
    return ALL_ITEMS.filter(i => {
        const rarityOk = rarityOrder.indexOf(i.rarity) <= maxIdx;
        const priceOk  = i.price <= maxPrice;
        const catOk    = !categories || categories.includes(i.category);
        return rarityOk && priceOk && catOk;
    });
}

/**
 * @function getStarterKit
 * Returns the default items a new Chossid begins with.
 */
export function getStarterKit() {
    return [
        { ...ITEM_BY_ID['yamulka_black'],  amount: 1, equipped: true  },
        { ...ITEM_BY_ID['hat_basic_black'],amount: 1, equipped: true  },
        { ...ITEM_BY_ID['jacket_basic'],   amount: 1, equipped: true  },
        { ...ITEM_BY_ID['shirt_white'],    amount: 1, equipped: true  },
        { ...ITEM_BY_ID['pants_black'],    amount: 1, equipped: true  },
        { ...ITEM_BY_ID['shoes_leather'],  amount: 1, equipped: true  },
        { ...ITEM_BY_ID['challah_small'],  amount: 3, equipped: false },
        { ...ITEM_BY_ID['scroll_chumash'],amount: 1, equipped: true  }
    ];
}
