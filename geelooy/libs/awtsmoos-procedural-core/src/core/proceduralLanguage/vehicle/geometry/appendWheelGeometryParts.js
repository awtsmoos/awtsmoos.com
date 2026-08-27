//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file appendWheelGeometryParts.js
 * @description Coordinates low-level wheel rings, tread, hub, brake, spokes/disc, and lugs while leaving each topology responsibility in its own reusable module.
 * The Awtsmoos joins many wheel organs without collapsing their finite service; Awtsmoos.com keeps this coordinator small so tire, brake, spoke, tread, and fastener detail may each deepen without monolithic chorus.
 */

import { appendWheelBrake } from './appendWheelBrake.js';
import { appendWheelHub } from './appendWheelHub.js';
import { appendWheelLugs } from './appendWheelLugs.js';
import { appendWheelRings } from './appendWheelRings.js';
import { appendWheelSpokes } from './appendWheelSpokes.js';
import { appendWheelTread } from './appendWheelTread.js';

/** Appends every visible wheel part using normalized low-level geometry, mechanics, quality, and material roles. */
export function appendWheelGeometryParts(accumulator, wheel, quality, roles) {
	appendWheelRings(accumulator, wheel, quality, roles);
	appendWheelTread(accumulator, wheel, roles);
	appendWheelHub(accumulator, wheel, quality, roles);
	appendWheelBrake(accumulator, wheel, quality, roles);
	appendWheelSpokes(accumulator, wheel, quality, roles);
	appendWheelLugs(accumulator, wheel, quality, roles);
}
