// B"H
/** @file wildTrees.js @description Chapter 1030: wild trees compile only to VillageHeroTree. */
const KINDS = ['oak', 'pine', 'apple', 'oak', 'pine'];
export function addWildTrees(n, profile, rand) {
  n.VillageHeroTree ||= {};
  for (let i = 0; i < profile.wildTrees; i += 1) {
    const angle = rand() * Math.PI * 2, dist = 100 + rand() * (profile.terrainSize * .38), kind = KINDS[Math.floor(rand() * KINDS.length)], scale = .85 + rand() * .9;
    n.VillageHeroTree[`advanced_tree_${i}`] = { name: `Advanced_${kind}_${i}`, kind, position: { x: Math.cos(angle) * dist, y: 0, z: Math.sin(angle) * dist }, scale, isSolid: false, useAuthoredY: true, treeSource: "/libs/awtsmoos3d/tree/heroTree.js" };
  }
}
