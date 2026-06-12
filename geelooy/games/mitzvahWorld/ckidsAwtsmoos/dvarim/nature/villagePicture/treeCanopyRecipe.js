// B"H
/**
 * @file treeCanopyRecipe.js
 * @description
 * Chapter 169: The tree crown stops being a toy cloud and becomes a breathing
 * orchard. The Awtsmoos layers leaf masses like green syllables: lower shade,
 * middle fruiting body, high crown, and tiny glints of life between them.
 */
import * as THREE from "/games/scripts/build/three.module.js";
import { add } from "./geometryKit.js";
import { foliageBatch, setFoliageInstance } from "./FoliageAtlas.js";
const FRUIT = [0xc5442f, 0xe0b547, 0x8e55c7];
function fruit(group, i, p) {
  const mesh = add(group, "sphere", FRUIT[i % FRUIT.length], p, [0.12, 0.12, 0.12], [0, 0, 0], { textureMode: "fruit" });
  mesh.name = `tiny_hidden_fruit_${i}`;
}
export function addDenseCanopy(group) {
  const masses = [
    [[0, 5.85, 0], [2.35, 1.05, 1.95]], [[-1.38, 5.72, 0.35], [1.55, 0.9, 1.35]],
    [[1.38, 5.78, -0.22], [1.62, 0.92, 1.32]], [[-0.28, 6.55, -1.08], [1.55, 0.86, 1.2]],
    [[0.68, 6.62, 1.02], [1.45, 0.86, 1.18]], [[0, 7.22, 0], [1.35, 0.78, 1.18]],
    [[-1.85, 6.32, -0.72], [0.95, 0.62, 0.85]], [[1.92, 6.28, 0.62], [0.95, 0.62, 0.85]],
    [[0.1, 6.05, 1.82], [1.05, 0.68, 0.78]], [[-0.12, 6.02, -1.82], [1.05, 0.68, 0.78]]
  ];
  for (let variant = 0; variant < 4; variant += 1) {
    const rows = masses.map((entry, index) => ({ entry, index })).filter(row => row.index % 4 === variant);
    const mesh = foliageBatch({ file: "leaf-atlas.png", cell: variant, count: rows.length, planes: 2, wind: 0.022, alphaTest: 0.32, name: `orchard_leaf_atlas_${variant}` });
    rows.forEach(({ entry: [p, s], index: sourceIndex }, index) => setFoliageInstance(mesh, index, new THREE.Vector3(...p), new THREE.Euler(0.04 * sourceIndex, 0.31 * sourceIndex, 0.02 * sourceIndex), new THREE.Vector3(s[0] * 1.15, s[1] * 1.55, s[2] * 1.15)));
    mesh.instanceMatrix.needsUpdate = true; mesh.computeBoundingSphere?.(); group.add(mesh);
  }
  [[-0.5, 5.75, 1.0], [0.75, 6.1, -0.9], [1.25, 5.9, 0.45], [-1.18, 6.35, -0.25], [0.15, 6.7, 0.95]].forEach((p, i) => fruit(group, i, p));
}
