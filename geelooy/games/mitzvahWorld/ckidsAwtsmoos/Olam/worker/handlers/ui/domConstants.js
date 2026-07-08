// B"H
/**
 * @file domConstants.js
 * @description Chapter 639: DOM constants borrow the lava reset fallback from
 * the same resolver that worker physics trusts.
 */
import { DEFAULT_SPIKE_RESET_FEET } from '../../../shared/SpikeResetPosition.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';

export const DIRECT = new Set(['openNpcChallengeOverlay', 'openLevelSelect', 'navigateLevel', 'tzedakahBlessing']);
export const LEVELS = Object.freeze(Array.from({ length: 20 }, (_, i) => [`ladder-${i + 1}`, `Lava Ladder ${i + 1}`]));
export const LEVEL_BASE = '/games/mitzvahWorld/levels/ladder/data/';
export const START_FEET = DEFAULT_SPIKE_RESET_FEET;
