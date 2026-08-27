// B"H
// Materials name how light behaves when it meets a thing.
export const MATERIALS = Object.freeze({
  water: { mode: "lighter", alpha: .34, tint: "#8feaff" },
  fog: { mode: "lighter", alpha: .16, tint: "#ffffff" },
  leaf: { mode: "lighter", alpha: .55, tint: "#9dffbc" },
  gold: { mode: "lighter", alpha: .78, tint: "#ffe08a" },
  glow: { mode: "lighter", alpha: .88, tint: "#ff87d7" }
});
export const material = name => MATERIALS[name] || MATERIALS.glow;
