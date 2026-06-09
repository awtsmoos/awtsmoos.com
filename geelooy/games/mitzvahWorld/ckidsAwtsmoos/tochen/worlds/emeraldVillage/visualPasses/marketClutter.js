// B"H
/**
 * @file marketClutter.js
 * @description Chapter 481: Market clutter is now a scaled budget bucket.
 */
import { box, p } from './shapeKit.js';
import { P } from './palette.js';
import { MARKET_BARREL_COUNT, MARKET_CRATE_COUNT, MARKET_SACK_COUNT } from './marketConfig.js';
import { scaledCount } from './visualDensityConfig.js';
export function addMarketClutter(n, density = {}) {
  const scale = density.marketScale ?? 1;
  for (let i = 0; i < scaledCount(MARKET_CRATE_COUNT, scale, 2); i += 1) box(n, `market_crate_${i}`, 'Market crate', p(-22 + i * 2.6, 0.42, 15 + (i % 4)), [0.75, 0.84, 0.75], i % 2 ? P.wood : P.darkWood, false);
  for (let i = 0; i < scaledCount(MARKET_BARREL_COUNT, scale, 1); i += 1) box(n, `market_barrel_${i}`, 'Market barrel', p(-20 + i * 5.4, 0.62, 12 + (i % 2) * 3.8), [0.7, 1.25, 0.7], '#5c3920', false);
  for (let i = 0; i < scaledCount(MARKET_SACK_COUNT, scale, 1); i += 1) box(n, `market_sack_${i}`, 'Market sack', p(-18 + i * 4, 0.38, 18 + (i % 3)), [0.82, 0.76, 0.62], '#b99b63', false);
}
