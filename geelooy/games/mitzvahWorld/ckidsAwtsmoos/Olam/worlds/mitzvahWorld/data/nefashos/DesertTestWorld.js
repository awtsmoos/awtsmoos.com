// B"H
/**
 * @file DesertTestWorld.js
 * @description
 * Chapter 3: The old desert-test population is empty.
 *
 * This file previously contained standalone desert structures that could be
 * pulled into legacy Mitzvah World blueprint builders. The clean Level 1 path
 * must not receive houses, NPCs, or hidden test geometry from here.
 */

export const DESERT_TEST_STRUCTURES = Object.freeze([]);

export const DESERT_TEST_WORLD_SETTINGS = Object.freeze({
  mode: 'disabled-clean-level',
  disableEmeraldVoidFeatures: true,
  disableGeneratedBattleLayer: true,
  disableNpcPostBuild: true
});
