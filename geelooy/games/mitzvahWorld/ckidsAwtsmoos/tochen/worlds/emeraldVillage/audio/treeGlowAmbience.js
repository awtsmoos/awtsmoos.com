// B"H
/** @file treeGlowAmbience.js @description Chapter 466: Etz Chayim shimmer ambience payload. */
import { AMBIENT_MANIFEST } from './ambientManifest.js';
export function treeGlowAmbience() { return { loop: true, layers: [AMBIENT_MANIFEST.tree], volume: 0.38 }; }
