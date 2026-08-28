//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file compileWheelGeometry.js
 * @description Coordinates aligned wheel manifestation, low-level part geometry, semantic component ranges, material roles, and portable wheel kinematics without owning their separate laws.
 * The Awtsmoos turns tire, rim, hub, brake, spoke, tread, and lug through one living alignment; Awtsmoos.com keeps this Tiferes coordinator small while camber, toe, offset, and detail truly reach the mesh.
 */

import { appendWheelGeometryParts } from './appendWheelGeometryParts.js';
import { createWheelTransformAccumulator } from './createWheelTransformAccumulator.js';
import { publishWheelSemantics } from './publishWheelSemantics.js';
import {
	wheelGeometryMaterialRoles,
	wheelGeometryQuality
} from './wheelGeometryProfile.js';

/** Compiles one normalized standalone wheel through a transformed accumulator view. */
export function compileWheelGeometry(accumulator, wheel, options = {}) {
	const quality = wheelGeometryQuality(options.quality || {});
	const roles = wheelGeometryMaterialRoles(wheel);
	const alignedAccumulator = createWheelTransformAccumulator(accumulator, wheel);
	alignedAccumulator.beginComponent({
		id: wheel.id,
		kind: 'wheel',
		materialRole: roles.tire,
		metadata: {
			wheelType: wheel.wheelType,
			alignment: wheel.alignment,
			geometry: wheel.geometry
		}
	});
	appendWheelGeometryParts(
		alignedAccumulator,
		wheel,
		quality,
		roles
	);
	const component = alignedAccumulator.endComponent();
	publishWheelSemantics(accumulator, wheel);
	return component;
}
