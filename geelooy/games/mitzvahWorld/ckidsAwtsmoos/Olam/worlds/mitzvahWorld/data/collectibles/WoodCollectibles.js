/**
 * B"H
 * Chapter 11: The Branches That Answered Back.
 *
 * Wood is not scenery here. Each log is clickable, touchable, collectible,
 * and bound to shlichus progress. When gathered, it vanishes from the street
 * and rises as inventory data, proving that the world has real doors to build.
 */

export const WOOD_COLLECTIBLE_CONTRACT = Object.freeze({
  itemId: 'Wood',
  className: 'Wood',
  interactable: true,
  touchable: true,
  disappearsOnCollect: true,
  progressEvent: Object.freeze({ type: 'collect', target: 'Wood' })
});

export const EMERALD_WOOD_NODES = Object.freeze([
  Object.freeze({ id: 'wood_emerald_1', position: [-9, 0.25, -32], amount: 1 }),
  Object.freeze({ id: 'wood_emerald_2', position: [-4, 0.25, -34], amount: 1 }),
  Object.freeze({ id: 'wood_emerald_3', position: [4, 0.25, -34], amount: 1 }),
  Object.freeze({ id: 'wood_emerald_4', position: [9, 0.25, -32], amount: 1 }),
  Object.freeze({ id: 'wood_emerald_5', position: [-7, 0.25, 32], amount: 1 }),
  Object.freeze({ id: 'wood_emerald_6', position: [7, 0.25, 32], amount: 1 })
]);
