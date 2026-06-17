// B"H
export const RECIPES = Object.freeze({ cottage:{ primitive:"house", source:"createCSGHouse" }, branch_house:{ primitive:"branch_house" }, tree:{ primitive:"tree" }, mountain:{ primitive:"mountain" }, fence:{ primitive:"fence" }, path:{ primitive:"path" }, rigged_human:{ primitive:"rigged_human", source:"createRiggedHuman" }, ark:{ primitive:"ark", source:"createArkAssembly" }, cloud:{ primitive:"cloud", source:"createMarchingCloudCluster" } });
export function recipeFor(name) { return RECIPES[name] || { primitive:name || "box" }; }
