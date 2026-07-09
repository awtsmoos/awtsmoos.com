// B"H
/** @file hemisphereRig.js @description Hemisphere light via ThreeAdapter. */
import { HemisphereLight } from '../../rendering/ThreeAdapter.js?compact=true&v=full-chain-cache-bust-20260708-bh10';
import { GOLDEN_HOUR } from './goldenHourPalette.js?compact=true&v=full-chain-cache-bust-20260708-bh10';
export function createEmeraldHemisphere(markLight) { return markLight(new HemisphereLight(GOLDEN_HOUR.upperSky, GOLDEN_HOUR.ground, 1.35), 'awtsmoos_sky_ground_hemisphere'); }
