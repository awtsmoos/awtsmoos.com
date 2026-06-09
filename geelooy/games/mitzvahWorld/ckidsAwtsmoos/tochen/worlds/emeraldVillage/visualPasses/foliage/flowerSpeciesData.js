// B"H
/** @file flowerSpeciesData.js @description Chapter 426: Flower colors and named families for entry beds. */
export const FLOWER_SPECIES = Object.freeze(['daisy', 'rose', 'violet', 'golden-herb']);
export const FLOWER_CLUSTERS = Object.freeze(Array.from({ length: 18 }, (_, i) => Object.freeze({ id: `entry_dense_flower_cluster_${i}`, x: -18 + (i % 9) * 4.5, z: -1 + Math.floor(i / 9) * 7, radius: 2.6 + (i % 3) * 0.5, count: 70 + i * 3, type: FLOWER_SPECIES[i % FLOWER_SPECIES.length] })));
