// B"H
/** @file fogRig.js @description Distant mist via ThreeAdapter. */
import { Color, Fog } from '../../rendering/ThreeAdapter.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
import { GOLDEN_HOUR } from './goldenHourPalette.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
export function applyEmeraldFog(scene) { scene.background = new Color(GOLDEN_HOUR.sky); scene.fog = new Fog(GOLDEN_HOUR.fog, 360, 5200); }
