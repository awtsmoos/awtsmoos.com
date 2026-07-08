// B"H
/**
 * @file architecturePass.js
 * @description Chapter 476: Architecture accents now scale by density, so old
 * phones do not pay for every banner, porch, and dormer.
 */
import { addArchitectureBanner } from './architectureBanners.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
import { addArchitectureChimney } from './architectureChimneys.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
import { ARCHITECTURE_LIMIT, DORMER_EVERY, PORCH_EVERY } from './architectureConfig.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
import { addArchitectureDormer } from './architectureDormers.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
import { addArchitecturePorch } from './architecturePorches.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
import { addArchitectureRoof } from './architectureRoofs.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
import { scaledCount } from './visualDensityConfig.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
export function addArchitecture(n, properties, density = {}) {
  const limit = scaledCount(Math.min(properties.length, ARCHITECTURE_LIMIT), density.houseScale ?? 1, 8);
  properties.slice(0, limit).forEach((prop, i) => {
    addArchitectureBanner(n, prop, i); addArchitectureRoof(n, prop, i); addArchitectureChimney(n, prop);
    if (i % PORCH_EVERY === 0) addArchitecturePorch(n, prop);
    if (i % DORMER_EVERY === 0) addArchitectureDormer(n, prop);
  });
}
