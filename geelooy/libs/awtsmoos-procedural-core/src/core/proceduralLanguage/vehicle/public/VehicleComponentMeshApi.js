//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VehicleComponentMeshApi.js
 * @description Gives expert authors direct normalized wheel, axle, frame-member, and body-section manifestation while preserving semantic sockets, kinematics, component ranges, and one editable mesh.
 * The Awtsmoos joins high detail to low topology while Awtsmoos.com lets a single wheel, invented axle, roll-cage bar, or custom body panel compile alone without pretending it belongs to a named vehicle soul.
 */

import { createAxleDefinition } from '../components/createAxleDefinition.js';
import { createVehicleBodySection } from '../components/createVehicleBodySection.js';
import { createVehicleFrameMember } from '../components/createVehicleFrameMember.js';
import { createWheelDefinition } from '../components/createWheelDefinition.js';
import { compileAxleGeometry } from '../geometry/compileAxleGeometry.js';
import { compileVehicleBodySections } from '../geometry/compileVehicleBodySections.js';
import { compileVehicleFrameMembers } from '../geometry/compileVehicleFrameMembers.js';
import { compileWheelGeometry } from '../geometry/compileWheelGeometry.js';

/** Low-level normalized vehicle-component compiler over one supplied accumulator. */
export class VehicleComponentMeshApi {
	/** @param {object} accumulator Shared mesh accumulator. @param {object} [options={}] Default quality/options. */
	constructor(accumulator, options = {}) {
		this.accumulator = accumulator;
		this.options = options;
	}

	wheel(input = {}, options = {}) {
		const wheel = createWheelDefinition(input);
		return compileWheelGeometry(
			this.accumulator,
			wheel,
			this.mergeOptions(options)
		);
	}

	axle(input = {}, options = {}) {
		const axle = createAxleDefinition(input);
		compileAxleGeometry(
			this.accumulator,
			axle,
			this.mergeOptions(options)
		);
		return axle;
	}

	frameMember(input = {}) {
		const member = createVehicleFrameMember(input);
		compileVehicleFrameMembers(this.accumulator, {
			id: 'expert-mesh',
			frameMembers: [member]
		});
		return member;
	}

	bodySection(input = {}) {
		const section = createVehicleBodySection(input);
		compileVehicleBodySections(this.accumulator, {
			id: 'expert-mesh',
			bodySections: [section]
		});
		return section;
	}

	/** Merges one-call geometry options over expert-mesh defaults. */
	mergeOptions(options) {
		return {
			...this.options,
			...options,
			quality: {
				...(this.options.quality || {}),
				...(options.quality || {})
			}
		};
	}
}
