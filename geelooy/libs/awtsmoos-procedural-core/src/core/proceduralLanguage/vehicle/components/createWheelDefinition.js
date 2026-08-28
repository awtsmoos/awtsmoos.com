//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file createWheelDefinition.js
 * @description Creates a standalone reusable wheel by composing identity, dimensions, alignment, visual geometry, tire/contact mechanics, braking, steering, drive, and spin semantics.
 * The Awtsmoos renews every spoke from hub to rim while Awtsmoos.com keeps the wheel independent from car, cart, bicycle, chariot, rover, or any future machine that may receive its turning form.
 */

import { freezeLanguageValue } from '../../data/freezeLanguageValue.js';
import { createWheelAlignment } from './createWheelAlignment.js';
import { createWheelGeometryStyle } from './createWheelGeometryStyle.js';
import { createWheelMechanics } from './createWheelMechanics.js';
import {
	vehicleWheelAxleNonNegativeInteger,
	vehicleWheelAxlePositiveNumber,
	vehicleWheelAxleVector3
} from './vehicleWheelAxleValues.js';

/** Creates one immutable wheel definition in canonical +X spin-axis vehicle coordinates. */
export function createWheelDefinition(input = {}) {
	const radius = vehicleWheelAxlePositiveNumber(input.radius, 0.35, 'wheel radius');
	const width = vehicleWheelAxlePositiveNumber(input.width, radius * 0.32, 'wheel width');
	const wheelType = String(input.wheelType || input.type || 'pneumatic');
	const mechanics = createWheelMechanics(input, {
		radius,
		width
	});
	return freezeLanguageValue({
		schema: 'awtsmoos.vehicle-wheel',
		version: 1,
		id: String(input.id || 'wheel'),
		wheelType,
		center: vehicleWheelAxleVector3(input.center || [0, 0, radius], 'wheel center'),
		spinAxis: vehicleWheelAxleVector3(input.spinAxis || [1, 0, 0], 'wheel spin axis'),
		steeringAxis: vehicleWheelAxleVector3(input.steeringAxis || [0, 0, 1], 'wheel steering axis'),
		radius,
		width,
		rimRadius: vehicleWheelAxlePositiveNumber(input.rimRadius, radius * 0.67, 'wheel rim radius'),
		hubRadius: vehicleWheelAxlePositiveNumber(input.hubRadius, radius * 0.16, 'wheel hub radius'),
		spokes: vehicleWheelAxleNonNegativeInteger(input.spokes, defaultSpokes(wheelType), 'wheel spoke count'),
		driven: Boolean(input.driven),
		braked: input.braked !== false,
		steerable: Boolean(input.steerable),
		alignment: createWheelAlignment(input.alignment || {}),
		geometry: createWheelGeometryStyle(input.geometry || input.geometryStyle || {}, {
			radius,
			width
		}),
		tire: mechanics.tire,
		brake: normalizeWheelBrake(input, mechanics.brake),
		contact: mechanics.contact,
		materialRoles: input.materialRoles || {},
		metadata: input.metadata || {}
	});
}

/** Preserves explicit `braked:false` as authority over nested brake configuration. */
function normalizeWheelBrake(input, brake) {
	return {
		...brake,
		enabled: input.braked === false
			? false
			: brake.enabled
	};
}

/** Returns family-sensitive spoke defaults while preserving explicit zero-spoke wheels. */
function defaultSpokes(type) {
	if (['wood-spoke', 'metal-rim'].includes(type)) {
		return 12;
	}
	if (['bicycle', 'motorcycle'].includes(type)) {
		return 20;
	}
	return 6;
}
