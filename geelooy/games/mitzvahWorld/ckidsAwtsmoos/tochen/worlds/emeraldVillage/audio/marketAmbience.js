// B"H
/** @file marketAmbience.js @description Chapter 464: Market chatter ambience payload. */
import { AMBIENT_MANIFEST } from './ambientManifest.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
export function marketAmbience() { return { loop: true, layers: [AMBIENT_MANIFEST.market], volume: 0.44 }; }
