// B"H
/** @file lifeCompiler.js @description Chapter 468: Life metadata is attached without mobile geometry cost. */
import { LIFE_MANIFEST } from './lifeManifest.js';
export function applyLifeLayer(n) { n.AmbientLife.emerald_entry_life = LIFE_MANIFEST; return n; }
