// B"H
/** @file wildTrees.js @description Chapter 358: Wild trees emerge from deterministic seed. */
const PRESETS = ['Oak', 'Palm', 'Pine', 'Willow', 'Bush'];
export function addWildTrees(n, profile, rand) {
  for (let i = 0; i < profile.wildTrees; i += 1) {
    const angle = rand() * Math.PI * 2, dist = 100 + rand() * (profile.terrainSize * 0.38);
    const preset = PRESETS[Math.floor(rand() * PRESETS.length)], scale = 0.85 + rand() * 0.9;
    n.ProceduralTree[`tree_${i}`] = { name: `Wild_${preset}_${i}`, preset, position: { x: Math.cos(angle) * dist, y: 0, z: Math.sin(angle) * dist }, scale, isRealistic: true, isSolid: true, props: { height: 6.5 * scale, foliageRadius: 2.1 * scale, branchCount: 7 + i % 4 } };
  }
}
