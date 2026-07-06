// B"H
/** @file ClothingStatCatalog.js @description Clothes are not cosmetic; they bend warmth, armor, kavod, trade, and movement. */
export const CLOTHING_STATS = Object.freeze({
  blackHat:{ slot:"hat", buy:30, sell:15, stats:{ kavod:3, charisma:1, warmth:1 } },
  velvetYarmulka:{ slot:"yarmulka", buy:12, sell:6, stats:{ kavod:2, learning:1 } },
  roundGlasses:{ slot:"glasses", buy:24, sell:12, stats:{ learning:2, charisma:1 } },
  longCoat:{ slot:"coat", buy:55, sell:28, stats:{ warmth:4, armor:2, kavod:2, movement:-.03 } },
  whiteShirt:{ slot:"shirt", buy:18, sell:9, stats:{ kavod:1, charisma:1 } },
  darkPants:{ slot:"pants", buy:20, sell:10, stats:{ armor:1, kavod:1 } },
  leatherShoes:{ slot:"shoes", buy:34, sell:17, stats:{ movement:.05, weather:1 } },
  simpleBelt:{ slot:"belt", buy:16, sell:8, stats:{ armor:1, carrying:2 } },
  workGloves:{ slot:"gloves", buy:22, sell:11, stats:{ armor:1, crafting:2 } }
});
export function clothingStats(id) { return CLOTHING_STATS[id] || null; }
export default CLOTHING_STATS;
