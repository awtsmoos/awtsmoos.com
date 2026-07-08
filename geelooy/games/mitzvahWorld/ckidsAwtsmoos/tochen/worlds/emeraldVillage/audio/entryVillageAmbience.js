// B"H
/** @file entryVillageAmbience.js @description Chapter 463: Entry ambience mix payload. */
import { AMBIENT_MANIFEST } from './ambientManifest.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
export function entryVillageAmbience() { return { loop: true, layers: [AMBIENT_MANIFEST.birds, AMBIENT_MANIFEST.wind, AMBIENT_MANIFEST.tree], volume: 0.72 }; }
