
// B"H
import { CurrencySystem } from "../../../dvarim/currencySystem.js";

export const ITEM_REGISTRY = {
    "Brick": { isBuildable: true, stackSize: 1024, icon: "/games/mitzvahWorld/icons/items/brick.svg", name: "Brick", description: "A sturdy building block.", equipSlot: 'rightHand' },
    "Stairs": { isBuildable: true, stackSize: 64, icon: "/games/mitzvahWorld/icons/items/brick.svg", name: "Stairs", description: "For reaching higher levels.", equipSlot: 'rightHand' },
    "Tool": { stackSize: 1, icon: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA1MTIgNTEyIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImhhbmRsZUdyYWQiIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjAlIj48c3RvcCBvZmZzZXQ9IjAlIiBzdHlsZT0ic3RvcC1jb2xvcjojOEI0NTEzO3N0b3Atb3BhY2l0eToxIiAvPjxzdG9wIG9mZnNldD0iNTAlIiBzdHlsZT0ic3RvcC1jb2xvcjojQTA1MjJEO3N0b3Atb3BhY2l0eToxIiAvPjxzdG9wIG9mZnNldD0iMTAwJSIgc3RvcC1jb2xvcjojOEI0NTEzO3N0b3Atb3BhY2l0eToxIiAvPjwvbGluZWFyR3JhZGllbnQ+PGxpbmVhckdyYWRpZW50IGlkPSJoZWFkR3JhZCIgeDE9IjAlIiB5MT0iMCUiIHgyPSIxMDAlIiB5Mj0iMTAwJSI+PHN0b3Agb2Zmc2V0PSIwJSIgc3RvcC1jb2xvcj0iI0ZGRDcwMDtzdG9wLW9wYWNpdHk6MSIgLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0eWxlPSJzdG9wLWNvbG9yOiNGRkE1MDA7c3RvcC1vcGFjaXR5OjEiIC8+PC9saW5ZWFyR3JhZGllbnQ+PC9kZWZzPjxyZWN0IHg9IjIzNiIgeT0iMTUwIiB3aWR0aD0iNDAiIGhlaWdodD0iMzAwIiByeD0iNSIgZmlsbD0idXJsKCNoYW5kbGVHcmFkKSIgc3Ryb2tlPSIjNWUzMDBkIiBzdHJva2Utd2lkdGg9IjIiIHRyYW5zZm9ybT0icm90YXRlKC0xNSAyNTYgMjU2KSIvPjxnIHRyYW5zZm9ybT0icm90YXRlKC0xNSAyNTYgMjU2KSI+PHJlY3QgeD0iMTY2IiB5PSIxMDAiIHdpZHRoPSI2MCIgaGVpZ2h0PSI4MCIgcng9IjUiIGZpbGw9IiM1NTUiIHN0cm9rZT0iIzMzMyIgc3Ryb2tlLXdpZHRoPSIyIi8+PHJlY3QgeD0iMjI2IiB5PSI4MCIgd2lkdGg9IjEyMCIgaGVpZ2h0PSIxMjAiIHJ4PSIxMCIgZmlsbD0idXJsKCNoZWFkR3JhZCkiIHN0cm9rZT0iI0I4ODYwQiIgc3Ryb2tlLXdpZHRoPSI0Ii8+PC9nPjwvc3ZnPg==", name: "Tool", description: "A generic tool.", equipSlot: 'rightHand' },
    "Teffilin": { isTool: true, stackSize: 1, icon: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj48cmVjdCB4PSIyNSIgeT0iMjUiIHdpZHRoPSI1MCIgaGVpZ2h0PSI1MCIgcng9IjUiIGZpbGw9IiMxMTEiIHN0cm9rZT0iIzMzMyIgc3Ryb2tlLXdpZHRoPSIyIi8+PHJlY3QgeD0iMzUiIHk9IjM1IiB3aWR0aD0iMzAiIGhlaWdodD0iMzAiIGZpbGw9IiMwMDAiLz48cGF0aCBkPSJNNDAgNjAgTDQwIDQ1IEw1MCA2MCBMNjAgNDUgTDYwIDYwIiBzdHJva2U9IiNmZmYiIHN0cm9rZS13aWR0aD0iMiIgZmlsbD0ibm9uZSIgb3BhY2l0eT0iMC44Ii8+PHBhdGggZD0iTTI1IDUwIEwxMCA1MCBNNzUgNTAgTDkwIDUwIiBzdHJva2U9IiMwMDAiIHN0cm9rZS13aWR0aD0iNiIvPjwvc3ZnPg==", name: "Teffilin", description: "Bind the mind and heart.", stats: { power: 5, defense: 2 }, equipSlot: 'rightHand' },
    "Apparel": { stackSize: 1, name: "Apparel", description: "Clothing for the vessel.", equipSlot: 'jacket' },
    "Container": { stackSize: 1, isContainer: true, icon: "📦", name: "Container", description: "Holds items." },
    "ProceduralTree": { isBuildable: true, stackSize: 64, name: "Tree Seed", description: "Plants a tree.", equipSlot: 'rightHand' },
    "ProceduralPool": { isBuildable: true, stackSize: 1, name: "Pool Kit", description: "Builds a mikvah/pool.", equipSlot: 'rightHand' },
    "NatureTool": { isPainter: true, stackSize: 1, name: "Nature Tool", description: "Paints nature.", equipSlot: 'rightHand' },
    "CustomNpc": { isBuildable: true, stackSize: 1, name: "Custom NPC", description: "A created soul.", equipSlot: 'rightHand' },
    "HotAirBalloon": { isBuildable: true, stackSize: 1, name: "Hot Air Balloon", description: "Fly high.", equipSlot: 'rightHand' },
    "ProceduralCar": { isBuildable: true, stackSize: 1, name: "Merkavah", description: "Drive around.", equipSlot: 'rightHand' },
    "Telescope": { isTool: true, stackSize: 1, name: "Telescope", description: "See far.", equipSlot: 'rightHand' },
    "GrapplingHook": { isTool: true, stackSize: 1, name: "Grappling Hook", description: "Pull yourself.", equipSlot: 'rightHand' },
    "FishingRod": { isTool: true, stackSize: 1, name: "Fishing Rod", description: "Catch fish.", equipSlot: 'rightHand' },
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
    "Wood": { stackSize: 128, icon: "🪵", name: "Wood", description: "Collected etz/lumber for building warm homes and completing shlichus.", isQuestItem: true },
    "Chumash": { stackSize: 1, icon: "📘", name: "Chumash", description: "A readable Torah book whose passages can enter the action bar for debate.", isTool: true, readable: true, equipSlot: 'rightHand' },
    "TorahPassage": { stackSize: 24, icon: "📜", name: "Torah Passage", description: "A verse-card used in Torah debate battles.", isDebateCard: true }
};
