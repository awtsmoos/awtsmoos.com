//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file compileVehicleFeatureGeometry.js
 * @description Applies opt-in visible manifestation policy to rich semantic vehicle features while keeping compatibility defaults geometry-neutral.
 * The Awtsmoos gives meaning before visible form while Awtsmoos.com lets callers choose whether lamps and panels descend into polygons; old deterministic meshes remain unchanged until that explicit gate is drawn.
 */

import { compileVehicleLightGeometry } from './compileVehicleLightGeometry.js';
import { compileVehiclePanelGeometry } from './compileVehiclePanelGeometry.js';

/** Compiles requested rich-feature geometry without affecting always-present semantic sockets. */
export function compileVehicleFeatureGeometry(accumulator, vehicle, options = {}) {
	const policy = normalizeFeatureGeometryPolicy(options.featureGeometry);
	if (policy.lights) {
		compileVehicleLightGeometry(accumulator, vehicle, options);
	}
	if (policy.panels) {
		compileVehiclePanelGeometry(accumulator, vehicle, options);
	}
}

/** Converts boolean or object compile policy into explicit per-feature manifestation flags. */
function normalizeFeatureGeometryPolicy(input) {
	if (input === true) {
		return {
			lights: true,
			panels: true
		};
	}
	if (!input || typeof input !== 'object') {
		return {
			lights: false,
			panels: false
		};
	}
	return {
		lights: input.lights === true,
		panels: input.panels === true
	};
}
