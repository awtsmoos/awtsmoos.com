// B"H
/**
 * @file pathCenterCobblePass.js
 * @description Chapter 485: Center cobbles scale by density while still
 * pointing the player's eyes from spawn to guide.
 */
import { box, p } from '../shapeKit.js';
import { PATH_CENTER_STONES } from './pathCenterConfig.js';
import { scaledCount } from '../visualDensityConfig.js';
export function addPathCenterCobbles(n, density = {}) {
  PATH_CENTER_STONES.slice(0, scaledCount(PATH_CENTER_STONES.length, density.pathScale ?? 1, 10)).forEach((stone, i) => box(n, stone.id, 'Entry path center cobble', p(stone.x + (i % 2 ? 0.22 : -0.18), stone.y, stone.z), stone.size, i % 2 ? '#8b8275' : '#70695f', true));
}
