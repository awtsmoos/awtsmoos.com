// B"H
import { CurrencySystem } from "../../../dvarim/currencySystem.js";
export const ITEM_REGISTRY = {
  "Brick": { isBuildable: true, stackSize: 1024, icon: "/games/mitzvahWorld/icons/items/brick.svg", name: "Brick", description: "A sturdy building block.", equipSlot: 'rightHand' },
  "Stairs": { isBuildable: true, stackSize: 64, icon: "/games/mitzvahWorld/icons/items/brick.svg", name: "Stairs", description: "For reaching higher levels.", equipSlot: 'rightHand' },
  "Tool": { stackSize: 1, name: "Tool", description: "A generic tool.", equipSlot: 'rightHand' },
  "Teffilin": { isTool: true, stackSize: 1, name: "Teffilin", description: "Bind the mind and heart.", stats: { power: 5, defense: 2 }, equipSlot: 'rightHand' },
  "Apparel": { stackSize: 1, name: "Apparel", description: "Clothing for the vessel.", equipSlot: 'jacket' },
  "Container": { stackSize: 1, isContainer: true, icon: "📦", name: "Container", description: "Holds items." },
  "VillageHeroTree": { isBuildable: true, stackSize: 64, name: "Advanced Tree Seed", description: "Plants only an approved geelooy/libs hero tree.", equipSlot: 'rightHand', className: "VillageHeroTree" },
  "TreeSeed": { isBuildable: true, stackSize: 64, name: "Advanced Tree Seed", description: "Plants only an approved geelooy/libs hero tree.", equipSlot: 'rightHand', className: "VillageHeroTree" },
  "ProceduralPool": { isBuildable: true, stackSize: 1, name: "Pool Kit", description: "Builds a mikvah/pool.", equipSlot: 'rightHand' },
  "NatureTool": { isPainter: true, stackSize: 1, name: "Nature Tool", description: "Paints nature.", equipSlot: 'rightHand' },
  "CustomNpc": { isBuildable: true, stackSize: 1, name: "Custom NPC", description: "A created soul.", equipSlot: 'rightHand' },
  "ProceduralCar": { isBuildable: true, stackSize: 1, name: "Merkavah", description: "Drive around.", equipSlot: 'rightHand' },
  "Pickaxe": { isTool: true, stackSize: 1, name: "Pickaxe", description: "Mine sparks.", stats: { power: 3 }, equipSlot: 'rightHand' },
  "Shovel": { isTool: true, stackSize: 1, name: "Shovel", description: "Dig earth.", equipSlot: 'rightHand' },
  "RoadTool": { isTool: true, stackSize: 1, name: "Road Tool", description: "Build paths.", equipSlot: 'rightHand' },
  "Blueprint": { isBuildable: true, stackSize: 1, name: "Blueprint", description: "Building plan.", equipSlot: 'rightHand' },
  "Wheat": { stackSize: 64, icon: "🌾", name: "Wheat", description: "Sustainance.", equipSlot: 'rightHand' },
  "Mill": { isBuildable: true, stackSize: 1, name: "Mill", description: "Grind wheat.", equipSlot: 'rightHand' },
  "Oven": { isBuildable: true, stackSize: 1, name: "Oven", description: "Bake bread.", equipSlot: 'rightHand' },
  "Fire": { isBuildable: true, stackSize: 1, name: "Fire", description: "Warmth and light.", equipSlot: 'rightHand' },
  "Fruit": { stackSize: 64, icon: "🍎", name: "Fruit", description: "Sweet nosh." },
  "Lava": { isBuildable: true, stackSize: 1, name: "Lava", description: "Molten earth.", equipSlot: 'rightHand' },
  "CharacterMaker": { stackSize: 1, name: "Neshama Maker", description: "Create souls.", equipSlot: 'rightHand' },
  "Wood": { stackSize: 128, icon: "🪵", name: "Wood", description: "Collected lumber for building warm homes and completing shlichus.", isQuestItem: true },
  "Chumash": { stackSize: 1, icon: "📘", name: "Chumash", description: "A readable Torah book whose passages can enter the action bar for debate.", isTool: true, readable: true, equipSlot: 'rightHand' },
  "TorahPassage": { stackSize: 24, icon: "📜", name: "Torah Passage", description: "A verse-card used in Torah debate battles.", isDebateCard: true }
};
export { CurrencySystem };
