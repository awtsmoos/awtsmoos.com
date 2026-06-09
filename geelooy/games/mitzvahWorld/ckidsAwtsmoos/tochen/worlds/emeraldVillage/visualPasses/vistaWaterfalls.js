// B"H
/**
 * @file vistaWaterfalls.js
 * @description Chapter 305: Waterfall ribbons give vertical motion to the far
 * background.
 */
import { box, p } from './shapeKit.js';
export function addVistaWaterfalls(n, config) {
  for (let i = 0; i < config.waterfallCount; i += 1) box(n, `distant_waterfall_${i}`, 'Distant waterfall ribbon', p(-120 + i * 80, 38, config.baseZ + 12), [6, 55, 2], '#bfe7ff', false);
}
