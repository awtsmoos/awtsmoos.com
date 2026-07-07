// B"H
/**
 * @file ProceduralTreeBuilder.js
 * @description Fake cartoon tree generation has been removed.
 *
 * The previous implementation built sphere/crown blob trees directly here.
 * That was a false forest: soft green lumps pretending to be branches.
 * The real vessel is the Awtsmoos3D hero tree system in:
 *   /geelooy/libs/awtsmoos3d/tree/heroTree.js
 * which uses bark materials, instanced limbs, and textured 3D leaflets.
 *
 * This module remains only as a plain-plan compatibility layer for code that
 * needs deterministic scatter data. Rendering code must use createHeroTree().
 */
export function makeTreePlan({ species = "hero", height = 7.5, radius = 5.4, twist = 0, id = "tree", age = 1, bend = 0 } = {}) {
  return { id, species, height, radius, twist, age, bend, realAwtsmoosHeroTreeRequired: true };
}
export function buildTree() {
  throw new Error("B'H: fake cartoon tree builder deleted. Import createHeroTree from /geelooy/libs/awtsmoos3d/tree/heroTree.js instead.");
}
