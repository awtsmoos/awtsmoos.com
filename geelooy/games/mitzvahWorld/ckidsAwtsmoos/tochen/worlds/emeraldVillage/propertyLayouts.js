// B"H
/**
 * @module propertyLayouts
 * @description THE PARCELS OF THE HOLY LAND — 10 property lots
 */
export const PROPERTY_LAYOUTS = [
    { id: "property_rabbiLevi", name: "Rabbi Levi Yitzchak's Dwelling",
      center: { x: 35, z: 25 }, lot: { width: 40, depth: 45 },
      housePreset: "TwoBedroom", houseOffset: { x: 0, z: 5 },
      fenceType: "wood", fenceHeight: 2.5,
      yardTrees: [
          { preset: "Oak Medium", offset: { x: 12, z: 15 } },
          { preset: "Oak Medium", offset: { x: -14, z: -12 } },
          { preset: "Birch Small", offset: { x: -10, z: 14 } }
      ],
      hedges: [{ offset: { x: 0, z: -18 }, width: 30, height: 1.5, depth: 1.5, color: "#1a5e20" }],
      backyard: {
          flowerPatch: { offset: { x: 5, z: -15 }, radius: 6, count: 80 },
          collectables: [
              { itemId: "apple_red", itemName: "Red Apple", itemType: "food", meshType: "fruit", color: 0xff0000, amount: 1, offset: { x: 13, z: 16 } },
              { itemId: "apple_red", itemName: "Red Apple", itemType: "food", meshType: "fruit", color: 0xff0000, amount: 1, offset: { x: -12, z: 10 } }
          ]
      } },
    { id: "property_merchantMoshe", name: "Moshe the Merchant's Shop",
      center: { x: -35, z: 25 }, lot: { width: 35, depth: 40 },
      housePreset: "SingleRoom", houseOffset: { x: 0, z: 3 },
      fenceType: "stone", fenceHeight: 2,
      yardTrees: [{ preset: "Birch Small", offset: { x: 10, z: 12 } }, { preset: "Oak Medium", offset: { x: -12, z: -10 } }],
      hedges: [],
      backyard: { collectables: [
          { itemId: "coin_silver", itemName: "Silver Shekel", itemType: "currency", meshType: "coin", color: 0xc0c0c0, amount: 5, offset: { x: -5, z: -12 } }
      ] } },
    { id: "property_sarahBaker", name: "Sarah's Bakery",
      center: { x: 35, z: -40 }, lot: { width: 38, depth: 42 },
      housePreset: "HouseWithPatio", houseOffset: { x: 0, z: 5 },
      fenceType: "hedge", fenceHeight: 2,
      yardTrees: [
          { preset: "Oak Medium", offset: { x: 14, z: 15 } }, { preset: "Birch Small", offset: { x: -13, z: 13 } },
          { preset: "Oak Medium", offset: { x: 10, z: -14 } }, { preset: "Birch Small", offset: { x: -11, z: -12 } }
      ],
      hedges: [
          { offset: { x: 8, z: 0 }, width: 1.5, height: 1.8, depth: 20, color: "#2d6b30" },
          { offset: { x: -8, z: -10 }, width: 14, height: 1.2, depth: 1.5, color: "#1a5e20" }
      ],
      backyard: {
          flowerPatch: { offset: { x: -8, z: -14 }, radius: 5, count: 60 },
          collectables: [
              { itemId: "wheat_bundle", itemName: "Wheat Bundle", itemType: "resource", meshType: "box", color: 0xdaa520, amount: 1, offset: { x: 5, z: -16 } },
              { itemId: "wheat_bundle", itemName: "Wheat Bundle", itemType: "resource", meshType: "box", color: 0xdaa520, amount: 1, offset: { x: -6, z: -14 } },
              { itemId: "wheat_bundle", itemName: "Wheat Bundle", itemType: "resource", meshType: "box", color: 0xdaa520, amount: 1, offset: { x: 10, z: -18 } }
          ]
      } },
    { id: "property_shmuelScribe", name: "Shmuel the Scribe's Study",
      center: { x: -35, z: -40 }, lot: { width: 36, depth: 40 },
      housePreset: "TwoStoryWithStairs", houseOffset: { x: 0, z: 4 },
      fenceType: "wood", fenceHeight: 2.5,
      yardTrees: [{ preset: "Oak Medium", offset: { x: 13, z: 14 } }, { preset: "Oak Medium", offset: { x: -12, z: 14 } }, { preset: "Birch Small", offset: { x: 0, z: -14 } }],
      hedges: [{ offset: { x: 0, z: -16 }, width: 28, height: 1.5, depth: 1.5, color: "#2d6b30" }],
      backyard: { collectables: [
          { itemId: "ink_bottle", itemName: "Sacred Ink", itemType: "resource", meshType: "box", color: 0x1a1a2e, amount: 1, offset: { x: -8, z: -14 } }
      ] } },
    { id: "property_dovid", name: "Dovid's Garden Home",
      center: { x: 80, z: 0 }, lot: { width: 42, depth: 45 },
      housePreset: "TwoBedroom", houseOffset: { x: 0, z: 5 },
      fenceType: "hedge", fenceHeight: 2.2,
      yardTrees: [
          { preset: "Oak Medium", offset: { x: 15, z: 16 } }, { preset: "Birch Small", offset: { x: -16, z: 15 } },
          { preset: "Oak Medium", offset: { x: 14, z: -14 } }, { preset: "Birch Small", offset: { x: -15, z: -13 } },
          { preset: "Oak Medium", offset: { x: 0, z: -17 } }
      ],
      hedges: [
          { offset: { x: 0, z: -18 }, width: 30, height: 1.5, depth: 1.5, color: "#1a5e20" },
          { offset: { x: 14, z: 0 }, width: 1.5, height: 1.5, depth: 25, color: "#2d6b30" }
      ],
      backyard: {
          flowerPatch: { offset: { x: -10, z: -14 }, radius: 8, count: 120 },
          collectables: [{ itemId: "harp_string", itemName: "Harp String", itemType: "resource", meshType: "box", color: 0xffd700, amount: 1, offset: { x: 12, z: -16 } }]
      } },
    { id: "property_synagogue", name: "The Beis Medrash",
      center: { x: -80, z: 0 }, lot: { width: 50, depth: 50 },
      housePreset: "generateSkyscraper", housePresetArg: 3,
      houseOffset: { x: 0, z: 0 },
      fenceType: "stone", fenceHeight: 3,
      yardTrees: [
          { preset: "Oak Medium", offset: { x: 20, z: 20 } }, { preset: "Oak Medium", offset: { x: -20, z: 20 } },
          { preset: "Oak Medium", offset: { x: 20, z: -20 } }, { preset: "Oak Medium", offset: { x: -20, z: -20 } },
          { preset: "Birch Small", offset: { x: 10, z: 22 } }, { preset: "Birch Small", offset: { x: -10, z: 22 } }
      ],
      hedges: [{ offset: { x: 0, z: -22 }, width: 40, height: 2, depth: 2, color: "#1a5e20" }],
      backyard: { flowerPatch: { offset: { x: 0, z: -18 }, radius: 10, count: 150 } } },
    // ═══ NEW PROPERTIES ═══
    { id: "property_blacksmith", name: "Yosef's Forge",
      center: { x: 0, z: -65 }, lot: { width: 35, depth: 35 },
      housePreset: "SingleRoom", houseOffset: { x: 0, z: 3 },
      fenceType: "stone", fenceHeight: 2,
      yardTrees: [{ preset: "Oak Medium", offset: { x: 12, z: 12 } }, { preset: "Birch Small", offset: { x: -12, z: 12 } }],
      hedges: [],
      backyard: { collectables: [
          { itemId: "gem_emerald", itemName: "Emerald Gem", itemType: "resource", meshType: "sphere", color: 0x50c878, amount: 1, offset: { x: 5, z: -12 } }
      ] } },
    { id: "property_healer", name: "Miriam's Healing House",
      center: { x: 0, z: 55 }, lot: { width: 35, depth: 38 },
      housePreset: "HouseWithPatio", houseOffset: { x: 0, z: 4 },
      fenceType: "hedge", fenceHeight: 1.8,
      yardTrees: [
          { preset: "Birch Small", offset: { x: 12, z: 14 } }, { preset: "Birch Small", offset: { x: -12, z: 14 } },
          { preset: "Oak Medium", offset: { x: 0, z: -14 } }
      ],
      hedges: [{ offset: { x: 0, z: -15 }, width: 25, height: 1.2, depth: 1.5, color: "#2d6b30" }],
      backyard: {
          flowerPatch: { offset: { x: 0, z: -12 }, radius: 8, count: 100 },
          collectables: [
              { itemId: "oil_olive", itemName: "Olive Oil", itemType: "resource", meshType: "box", color: 0x808000, amount: 1, offset: { x: 8, z: -10 } },
              { itemId: "oil_olive", itemName: "Olive Oil", itemType: "resource", meshType: "box", color: 0x808000, amount: 1, offset: { x: -8, z: -12 } }
          ]
      } },
    { id: "property_lumberyard", name: "Baruch's Lumber Yard",
      center: { x: 110, z: -40 }, lot: { width: 45, depth: 45 },
      housePreset: "SingleRoom", houseOffset: { x: 0, z: 5 },
      fenceType: "wood", fenceHeight: 2.5,
      yardTrees: [
          { preset: "Oak Large", offset: { x: 15, z: 15 } }, { preset: "Oak Large", offset: { x: -15, z: 15 } },
          { preset: "Oak Medium", offset: { x: 15, z: -15 } }, { preset: "Oak Medium", offset: { x: -15, z: -15 } },
          { preset: "Birch Small", offset: { x: 0, z: 18 } }, { preset: "Birch Small", offset: { x: 8, z: -18 } }
      ],
      hedges: [],
      backyard: { collectables: [
          { itemId: "wood_plank", itemName: "Wood Plank", itemType: "resource", meshType: "box", color: 0x8b4513, amount: 3, offset: { x: 10, z: -10 } }
      ] } },
    { id: "property_gemShop", name: "Shlomo's Gem Emporium",
      center: { x: -110, z: -40 }, lot: { width: 35, depth: 35 },
      housePreset: "TwoBedroom", houseOffset: { x: 0, z: 3 },
      fenceType: "stone", fenceHeight: 2.5,
      yardTrees: [{ preset: "Birch Small", offset: { x: 12, z: 12 } }, { preset: "Birch Small", offset: { x: -12, z: 12 } }],
      hedges: [{ offset: { x: 0, z: -14 }, width: 25, height: 1.5, depth: 1.5, color: "#1a5e20" }],
      backyard: { collectables: [
          { itemId: "gem_ruby", itemName: "Ruby Gem", itemType: "resource", meshType: "sphere", color: 0xe0115f, amount: 1, offset: { x: -5, z: -12 } },
          { itemId: "scroll_torah", itemName: "Torah Scroll Fragment", itemType: "resource", meshType: "box", color: 0xf5f5dc, amount: 1, offset: { x: 8, z: -10 } }
      ] } }
];
