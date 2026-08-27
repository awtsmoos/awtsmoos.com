//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file createWheelMechanics.js
 * @description Normalizes physical tire, brake, and contact intent independently from visual wheel topology or vehicle ownership.
 * The Awtsmoos turns every wheel beyond rubber or iron while Awtsmoos.com lets pressure, compound, stiffness, brake construction, grip, load, and rolling loss remain portable truth for renderer and physics choirs.
 */

import { freezeLanguageValue } from '../../data/freezeLanguageValue.js';
import {
	vehicleBoundedNumber,
	vehicleNonNegativeNumber
} from './vehicleComponentValues.js';

/** Creates immutable tire/contact/brake records using wheel dimensions only for safe defaults. */
export function createWheelMechanics(input = {}, dimensions = {}) {
	const radius = Number(dimensions.radius || 0.35);
	const width = Number(dimensions.width || radius * 0.32);
	return freezeLanguageValue({
		tire: createTireMechanics(input.tire || {}, width),
		brake: createBrakeMechanics(input.brake || {}, radius),
		contact: createContactMechanics(input.contact || {}, width)
	});
}

/** Creates low-level tire mechanics without deciding visible tire topology. */
function createTireMechanics(input, width) {
	return {
		pressure: vehicleNonNegativeNumber(input.pressure, 220, 'wheel tire pressure'),
		treadType: String(input.treadType || 'road'),
		treadDepth: vehicleNonNegativeNumber(input.treadDepth, 0.008, 'wheel tread depth'),
		punctured: Boolean(input.punctured),
		compound: String(input.compound || 'general'),
		aspectRatio: vehicleBoundedNumber(input.aspectRatio, 0.55, 0.1, 2, 'wheel tire aspect ratio'),
		sidewallStiffness: vehicleNonNegativeNumber(input.sidewallStiffness, 1, 'wheel sidewall stiffness'),
		wear: vehicleBoundedNumber(input.wear, 0, 0, 1, 'wheel tire wear'),
		nominalTreadWidth: vehicleNonNegativeNumber(input.nominalTreadWidth, width, 'wheel nominal tread width')
	};
}

/** Creates low-level brake mechanics suitable for discs, drums, regenerative intent, or custom adapters. */
function createBrakeMechanics(input, radius) {
	return {
		type: String(input.type || 'disc'),
		enabled: input.enabled !== false,
		radius: vehicleNonNegativeNumber(input.radius, radius * 0.42, 'wheel brake radius'),
		thickness: vehicleNonNegativeNumber(input.thickness, 0.012, 'wheel brake thickness'),
		vented: Boolean(input.vented),
		caliperType: String(input.caliperType || 'floating'),
		caliperScale: vehicleNonNegativeNumber(input.caliperScale, 1, 'wheel caliper scale'),
		materialRole: String(input.materialRole || 'brake-metal')
	};
}

/** Creates directional contact intent without claiming a tire-force solver. */
function createContactMechanics(input, width) {
	const friction = vehicleNonNegativeNumber(input.friction, 1, 'wheel contact friction');
	return {
		friction,
		lateralGrip: vehicleNonNegativeNumber(input.lateralGrip, friction, 'wheel lateral grip'),
		longitudinalGrip: vehicleNonNegativeNumber(input.longitudinalGrip, friction, 'wheel longitudinal grip'),
		rollingResistance: vehicleNonNegativeNumber(input.rollingResistance, 0.015, 'wheel rolling resistance'),
		loadBias: vehicleBoundedNumber(input.loadBias, 1, 0, 10, 'wheel load bias'),
		contactPatchWidth: vehicleNonNegativeNumber(input.contactPatchWidth, width * 0.72, 'wheel contact patch width'),
		contactPatchLength: vehicleNonNegativeNumber(input.contactPatchLength, width * 0.36, 'wheel contact patch length')
	};
}
