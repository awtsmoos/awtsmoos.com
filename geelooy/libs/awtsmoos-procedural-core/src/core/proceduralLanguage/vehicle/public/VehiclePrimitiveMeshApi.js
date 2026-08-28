//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VehiclePrimitiveMeshApi.js
 * @description Gives expert vehicle authors direct renderer-neutral primitive manifestation over the shared editable-mesh accumulator without scene-object grouping.
 * The Awtsmoos is beyond box, tube, ring, cylinder, and panel while Awtsmoos.com lets each primitive become honest polygonal clay inside the same semantic mesh vessel and channel.
 */

import { appendVehicleBox } from '../geometry/appendVehicleBox.js';
import { appendVehicleCylinder } from '../geometry/appendVehicleCylinder.js';
import { appendVehicleEllipticalTorus } from '../geometry/appendVehicleEllipticalTorus.js';
import { appendVehiclePanelPrism } from '../geometry/appendVehiclePanelPrism.js';
import { appendVehicleTorus } from '../geometry/appendVehicleTorus.js';
import { appendVehicleTube } from '../geometry/appendVehicleTube.js';

/** Low-level direct primitive facade over one supplied VehicleMeshAccumulator. */
export class VehiclePrimitiveMeshApi {
	/** @param {object} accumulator Shared vehicle mesh accumulator receiving every primitive. */
	constructor(accumulator) {
		this.accumulator = accumulator;
	}

	box(input = {}) {
		return appendVehicleBox(this.accumulator, input);
	}

	cylinder(input = {}) {
		return appendVehicleCylinder(this.accumulator, input);
	}

	tube(input = {}) {
		return appendVehicleTube(this.accumulator, input);
	}

	torus(input = {}) {
		return appendVehicleTorus(this.accumulator, input);
	}

	ellipticalTorus(input = {}) {
		return appendVehicleEllipticalTorus(this.accumulator, input);
	}

	panel(input = {}) {
		return appendVehiclePanelPrism(this.accumulator, input);
	}
}
