// B"H
/** TreeSpeciesRegistry: many branches, one root in the Awtsmoos. */
export const TREE_SPECIES = Object.freeze({
  cedar: { trunk: 0x7a4a2b, leaf: 0x0f6f3b, tiers: 5, height: [4, 8], radius: [0.8, 1.8] },
  olive: { trunk: 0x8a6844, leaf: 0x7da36a, tiers: 3, height: [2.4, 4.3], radius: [1.2, 2.4] },
  pine: { trunk: 0x6d4127, leaf: 0x0d5732, tiers: 6, height: [5, 10], radius: [0.7, 1.6] },
  willow: { trunk: 0x76563c, leaf: 0x6bbf6a, tiers: 4, height: [3.2, 6.5], radius: [1.4, 2.9] }
});
export const speciesNames = () => Object.keys(TREE_SPECIES);
export const getSpecies = name => TREE_SPECIES[name] || TREE_SPECIES.cedar;
