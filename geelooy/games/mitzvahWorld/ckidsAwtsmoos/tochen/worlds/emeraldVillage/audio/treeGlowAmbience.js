// B"H
/** @file treeGlowAmbience.js @description Chapter 466: Etz Chayim shimmer ambience payload. */
import { AMBIENT_MANIFEST } from './ambientManifest.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
export function treeGlowAmbience() { return { loop: true, layers: [AMBIENT_MANIFEST.tree], volume: 0.38 }; }
