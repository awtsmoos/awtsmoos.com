// B"H
/** @file marketAmbience.js @description Chapter 464: Market chatter ambience payload. */
import { AMBIENT_MANIFEST } from './ambientManifest.js';
export function marketAmbience() { return { loop: true, layers: [AMBIENT_MANIFEST.market], volume: 0.44 }; }
