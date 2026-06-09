// B"H
/**
 * @file domConstants.js
 * @description Chapter 379: DOM constants are named sparks before interaction
 * begins.
 */
export const DIRECT = new Set(['openNpcChallengeOverlay', 'openLevelSelect', 'navigateLevel', 'tzedakahBlessing']);
export const LEVELS = Object.freeze(Array.from({ length: 20 }, (_, i) => [`ladder-${i + 1}.json`, `Level ${i + 1}`]));
export const LEVEL_BASE = '/games/mitzvahWorld/levels/ladder/data/';
export const START_FEET = Object.freeze({ x: -10.5, y: 0.425, z: 0 });
