// B"H
/** Inventory, clothes, merchant prices, and animal product sale data. */
export const LEVEL_ONE_ITEMS = Object.freeze({
  siddur_page: { title: 'Siddur Page', type: 'quest', value: 0 },
  wool_bundle: { title: 'Clean Wool Bundle', type: 'animal_product', value: 3 },
  kosher_hide: { title: 'Kosher Hide', type: 'animal_loot', value: 5 },
  wheat_sheaf: { title: 'Wheat Sheaf', type: 'crop', value: 2 },
  blue_bekeshe: { title: 'Blue Bekeshe', type: 'clothing', value: 8 }
});

export const LEVEL_ONE_CLOTHING = Object.freeze({
  weekday_coat: { title: 'Weekday Coat', slot: 'outerwear', default: true },
  blue_bekeshe: { title: 'Blue Bekeshe', slot: 'outerwear', asksBeforeEquip: true }
});

export const LEVEL_ONE_MERCHANTS = Object.freeze({
  market_shliach: { buys: ['wool_bundle', 'kosher_hide', 'wheat_sheaf'], sells: ['blue_bekeshe', 'chumash_bereishis'] }
});
