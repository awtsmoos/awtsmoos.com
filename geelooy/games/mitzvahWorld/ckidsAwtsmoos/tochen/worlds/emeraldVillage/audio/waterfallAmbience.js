// B"H
/** @file waterfallAmbience.js @description Chapter 465: Waterfall and brook ambience payload. */
import { AMBIENT_MANIFEST } from './ambientManifest.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
export function waterfallAmbience() { return { loop: true, layers: [AMBIENT_MANIFEST.water], volume: 0.48 }; }
