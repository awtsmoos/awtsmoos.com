// B"H
/** @file hemisphereRig.js @description Chapter 447: Hemisphere light connects sky and ground. */
import * as THREE from '/games/scripts/build/three.module.js';
import { GOLDEN_HOUR } from './goldenHourPalette.js';
export function createEmeraldHemisphere(markLight) { return markLight(new THREE.HemisphereLight(GOLDEN_HOUR.upperSky, GOLDEN_HOUR.ground, 1.35), 'awtsmoos_sky_ground_hemisphere'); }
