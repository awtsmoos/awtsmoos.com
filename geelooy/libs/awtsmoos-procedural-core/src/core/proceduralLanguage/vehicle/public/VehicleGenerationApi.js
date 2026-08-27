//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VehicleGenerationApi.js
 * @description Presents one compatibility-preserving JS/JSON doorway over vehicle resolution, definitions, archetypes, generation, reusable systems, assemblies, and discovery.
 * The Awtsmoos is One whether the traveler names car, chariot, bicycle, rover, custom machine, or road train; Awtsmoos.com keeps common calls flat while expert facets reveal deeper systems without breaking yesterday's path.
 */

import { createVehicleFromArchetype } from '../archetypes/createVehicleFromArchetype.js';
import { VehicleCompiler } from '../compiler/VehicleCompiler.js';
import { VehicleDefinition } from '../definition/VehicleDefinition.js';
import { createVehicleDefinition } from '../definition/createVehicleDefinition.js';
import { resolveVehicleInput } from '../resolution/resolveVehicleInput.js';
import { VehicleCompositionApi } from './VehicleCompositionApi.js';
import { VehicleInspectionApi } from './VehicleInspectionApi.js';
import { VehicleSubsystemApi } from './VehicleSubsystemApi.js';

/** Public JSON-first vehicle generation facade with focused compatibility-preserving expert facets. */
export class VehicleGenerationApi {
	/** @param {{compiler?: object}} [options={}] Optional vehicle compiler override. */
	constructor(options = {}) {
		this.compiler = options.compiler || new VehicleCompiler();
		this.subsystems = new VehicleSubsystemApi();
		this.systems = this.subsystems;
		this.compose = new VehicleCompositionApi({
			vehicleCompiler: this.compiler
		});
		this.assemblies = this.compose;
		this.inspect = new VehicleInspectionApi();
	}

	/** Resolves any supported authoring form into canonical immutable vehicle JSON. */
	resolve(input, overrides = {}) {
		return resolveVehicleInput(input, overrides);
	}

	/** Preserves the explicit JSON normalization contract for direct vehicle data. */
	fromJSON(input) {
		return createVehicleDefinition(input);
	}

	/** Creates a fluent vehicle definition from direct custom vehicle data. */
	define(input = {}) {
		return new VehicleDefinition(input);
	}

	/** Creates canonical vehicle data from a named built-in archetype and optional overrides. */
	vehicle(archetypeId, overrides = {}) {
		return createVehicleFromArchetype(archetypeId, overrides);
	}

	/** Compiles any supported input form into one renderer-neutral editable-mesh artifact. */
	compile(input, options = {}) {
		return this.compiler.compile(input, options);
	}

	/** Expands and compiles one named archetype in a single deterministic call. */
	generate(archetypeId, overrides = {}, options = {}) {
		return this.compiler.compile(
			archetypeId,
			{
				...options,
				overrides
			}
		);
	}

	/** Backwards-compatible direct shortcut to the standalone wheel factory. */
	wheel(input = {}) {
		return this.subsystems.wheel(input);
	}

	/** Backwards-compatible direct shortcut to the arbitrary axle factory. */
	axle(input = {}) {
		return this.subsystems.axle(input);
	}

	/** Backwards-compatible direct shortcut to occupant/seat creation. */
	seat(input = {}) {
		return this.subsystems.seat(input);
	}

	/** Backwards-compatible direct shortcut to hitch/drawbar/yoke creation. */
	coupling(input = {}) {
		return this.subsystems.coupling(input);
	}

	/** Backwards-compatible direct shortcut to renderer-neutral dynamics intent. */
	dynamics(input = {}) {
		return this.subsystems.dynamics(input);
	}

	/** Returns the complete machine-readable vehicle-language capability contract. */
	capabilities() {
		return this.inspect.capabilities();
	}

	/** Lists built-in presets while custom direct JSON remains unrestricted. */
	archetypes() {
		return this.inspect.archetypes();
	}

	/** Describes one built-in archetype or returns null for custom ids. */
	archetype(id) {
		return this.inspect.archetype(id);
	}
}
