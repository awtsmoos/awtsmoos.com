// B"H
/**
 * @file architecturePass.js
 * @description Chapter 476: Architecture accents now scale by density, so old
 * phones do not pay for every banner, porch, and dormer.
 */
import { addArchitectureBanner } from './architectureBanners.js';
import { addArchitectureChimney } from './architectureChimneys.js';
import { ARCHITECTURE_LIMIT, DORMER_EVERY, PORCH_EVERY } from './architectureConfig.js';
import { addArchitectureDormer } from './architectureDormers.js';
import { addArchitecturePorch } from './architecturePorches.js';
import { addArchitectureRoof } from './architectureRoofs.js';
import { scaledCount } from './visualDensityConfig.js';
export function addArchitecture(n, properties, density = {}) {
  const limit = scaledCount(Math.min(properties.length, ARCHITECTURE_LIMIT), density.houseScale ?? 1, 8);
  properties.slice(0, limit).forEach((prop, i) => {
    addArchitectureBanner(n, prop, i); addArchitectureRoof(n, prop, i); addArchitectureChimney(n, prop);
    if (i % PORCH_EVERY === 0) addArchitecturePorch(n, prop);
    if (i % DORMER_EVERY === 0) addArchitectureDormer(n, prop);
  });
}
