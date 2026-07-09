// B"H
/** @file sunRig.js @description Warm directional sun via ThreeAdapter. */
import { DirectionalLight } from '../../rendering/ThreeAdapter.js?compact=true&v=full-chain-cache-bust-20260708-bh10';
import { GOLDEN_HOUR } from './goldenHourPalette.js?compact=true&v=full-chain-cache-bust-20260708-bh10';
import { tuneEmeraldShadow } from './shadowRig.js?compact=true&v=full-chain-cache-bust-20260708-bh10';
export function createEmeraldSun(markLight) { const sun = markLight(new DirectionalLight(GOLDEN_HOUR.sun, 2.05), 'awtsmoos_warm_village_sun'); sun.position.set(-420, 720, 260); return tuneEmeraldShadow(sun); }
