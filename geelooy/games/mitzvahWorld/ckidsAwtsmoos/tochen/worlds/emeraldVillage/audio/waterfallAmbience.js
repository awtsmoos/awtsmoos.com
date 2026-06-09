// B"H
/** @file waterfallAmbience.js @description Chapter 465: Waterfall and brook ambience payload. */
import { AMBIENT_MANIFEST } from './ambientManifest.js';
export function waterfallAmbience() { return { loop: true, layers: [AMBIENT_MANIFEST.water], volume: 0.48 }; }
