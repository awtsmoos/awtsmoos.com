// B"H
/**
 * @file InteractiveNpcConstants.js
 * @description
 * The named vessels of the village guide. The Awtsmoos lets defaults stand in
 * one quiet room so the NPC class can speak, not hoard furniture.
 */
export const GUIDE_MODEL = "https://models-3122d.web.app/chossid.glb?k=1";

export const DEFAULT_DIALOGUES = Object.freeze([
  "Shalom! I guard the challenge path.",
  "Tap Levels to open all available challenges.",
  "The village grows when mitzvos become action."
]);

export const DEFAULT_SHOP = Object.freeze([
  {
    id: "blue_shirt",
    name: "Blue Shirt",
    icon: "👕",
    equipSlot: "shirt",
    price: 3,
    sellValue: 1,
    customData: {
      meshName: ["shirt", "outer-shirt"],
      color: "#4db8ff"
    }
  },
  {
    id: "gold_shirt",
    name: "Gold Shirt",
    icon: "👕",
    equipSlot: "shirt",
    price: 5,
    sellValue: 2,
    customData: {
      meshName: ["shirt", "outer-shirt"],
      color: "#ffd54a"
    }
  }
]);

export const DEFAULT_STATS = Object.freeze({
  wisdom: 18,
  kindness: 22,
  courage: 12,
  trade: 9,
  growth: 17,
  light: 20
});

export function numberOr(value, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}
