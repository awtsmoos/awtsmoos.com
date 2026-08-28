//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file createAxleDefinition.js
 * @description Creates arbitrary one-wheel, paired, dual, tandem, or future axle semantics by composing detailed steering, suspension, visible axle geometry, drive, braking, and wheel membership.
 * The Awtsmoos joins left and right without requiring either; Awtsmoos.com lets fork, truck tandem, chariot beam, rover bogie, and unknown machines share one explicit low-level light.
 */

import { freezeLanguageValue } from '../../data/freezeLanguageValue.js';
import { createAxleGeometryStyle } from './createAxleGeometryStyle.js';
import { createSteeringGeometry } from './createSteeringGeometry.js';
import { createSuspensionProfile } from './createSuspensionProfile.js';
import { createWheelDefinition } from './createWheelDefinition.js';
import {
	vehicleWheelAxlePositiveNumber,
	vehicleWheelAxleVector3
} from './vehicleWheelAxleValues.js';

/** Creates one immutable axle with detailed geometry, steering, suspension, drive, braking, and wheel membership. */
export function createAxleDefinition(input = {}) {
	const axleId = String(input.id || 'axle');
	const wheels = (input.wheels || []).map((wheel, index) => {
		return createWheelDefinition({
			...wheel,
			id: wheel.id || `${axleId}:wheel:${index}`
		});
	});
	return freezeLanguageValue({
		schema: 'awtsmoos.vehicle-axle',
		version: 1,
		id: axleId,
		position: vehicleWheelAxleVector3(input.position || [0, 0, 0], 'axle position'),
		trackWidth: vehicleWheelAxlePositiveNumber(input.trackWidth, 1.4, 'axle track width'),
		steering: createSteeringGeometry(input.steering || {}),
		suspension: createSuspensionProfile(input.suspension || {}),
		geometry: createAxleGeometryStyle(input.geometry || {}),
		driven: Boolean(input.driven),
		braked: input.braked !== false,
		wheels,
		metadata: input.metadata || {}
	});
}
