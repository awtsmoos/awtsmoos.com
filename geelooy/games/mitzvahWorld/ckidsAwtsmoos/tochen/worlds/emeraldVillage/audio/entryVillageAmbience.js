// B"H
/** @file entryVillageAmbience.js @description Chapter 463: Entry ambience mix payload. */
import { AMBIENT_MANIFEST } from './ambientManifest.js';
export function entryVillageAmbience() { return { loop: true, layers: [AMBIENT_MANIFEST.birds, AMBIENT_MANIFEST.wind, AMBIENT_MANIFEST.tree], volume: 0.72 }; }
