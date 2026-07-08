// B"H
/**
 * @file marketPass.js
 * @description Chapter 479: Market clutter and produce are density-aware, so
 * the square remains lively without forcing every device to carry the whole bazaar.
 */
import { MARKET_STALLS } from './marketConfig.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
import { addMarketClutter } from './marketClutter.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
import { addMarketLanterns } from './marketLanterns.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
import { addMarketProduce } from './marketProduce.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
import { addMarketStallFrame } from './marketStallFrame.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
import { scaledCount } from './visualDensityConfig.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
export function addMarket(n, density = {}) {
  const stalls = MARKET_STALLS.slice(0, scaledCount(MARKET_STALLS.length, density.marketScale ?? 1, 1));
  stalls.forEach(stall => { addMarketStallFrame(n, stall); addMarketProduce(n, stall, density); });
  addMarketLanterns(n, stalls);
  addMarketClutter(n, density);
}
