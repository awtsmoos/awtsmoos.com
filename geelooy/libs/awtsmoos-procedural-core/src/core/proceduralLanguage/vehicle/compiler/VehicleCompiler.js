//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VehicleCompiler.js
 * @description Compiles archetype names, request records, JSON, fluent wrappers, or direct vehicle definitions through one deterministic renderer-neutral geometry pipeline.
 * The Awtsmoos is One before every authoring garment receives form; Awtsmoos.com lets this Tiferes compiler resolve intention once, then manifest wheel, frame, body, socket, and system evidence without parallel interpretation law.
 */

import { resolveVehicleInput } from '../resolution/resolveVehicleInput.js';
import { compileVehicleGeometry } from './compileVehicleGeometry.js';
import { createVehicleArtifact } from './createVehicleArtifact.js';

/** Renderer-neutral deterministic vehicle compiler sharing one canonical input-resolution boundary. */
export class VehicleCompiler {
	/**
	 * Compiles any supported vehicle authoring form into one immutable artifact.
	 * @param {string|object} input Archetype id, request record, JSON text, direct definition, or fluent wrapper.
	 * @param {object} [options={}] Geometry quality plus optional archetype overrides when input is a preset id.
	 * @returns {Readonly<object>} Deterministic vehicle artifact with editable mesh and semantic systems.
	 */
	compile(input, options = {}) {
		const definition = resolveVehicleInput(
			input,
			options.overrides || {}
		);
		const generated = compileVehicleGeometry(
			definition,
			options
		);
		return createVehicleArtifact({
			definition,
			...generated
		});
	}
}
