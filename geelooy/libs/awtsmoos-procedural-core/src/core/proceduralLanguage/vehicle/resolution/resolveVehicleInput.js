//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file resolveVehicleInput.js
 * @description Resolves archetype names, concise archetype request records, JSON text, direct definitions, and fluent wrappers into one canonical immutable vehicle definition.
 * The Awtsmoos precedes every language garment while Awtsmoos.com lets strings, objects, presets, and fluent vessels converge through one Yesod gateway rather than competing interpretation paths in the night.
 */

import { createVehicleFromArchetype } from '../archetypes/createVehicleFromArchetype.js';
import { vehicleArchetype } from '../archetypes/vehicleArchetypeCatalog.js';
import { createVehicleDefinition } from '../definition/createVehicleDefinition.js';

/** Resolves every supported vehicle authoring form into one canonical immutable definition. */
export function resolveVehicleInput(input, overrides = {}) {
	if (typeof input === 'string') {
		return resolveVehicleString(input, overrides);
	}
	if (isVehicleArchetypeRequest(input)) {
		return resolveVehicleRequest(input, overrides);
	}
	return createVehicleDefinition(input);
}

/** Resolves JSON text separately from plain archetype ids so string meaning never depends on failed parsing. */
function resolveVehicleString(input, overrides) {
	const value = input.trim();
	if (value.startsWith('{')) {
		return createVehicleDefinition(JSON.parse(value));
	}
	if (vehicleArchetype(value)) {
		return createVehicleFromArchetype(value, overrides);
	}
	throw new TypeError(`B"H | Unknown vehicle archetype or JSON input: ${value}`);
}

/** Expands shorthand request fields and nested overrides into one archetype override record. */
function resolveVehicleRequest(input, overrides) {
	const {
		archetype,
		overrides: nestedOverrides = {},
		...inlineOverrides
	} = input;
	return createVehicleFromArchetype(archetype, {
		...inlineOverrides,
		...nestedOverrides,
		...overrides
	});
}

/** Identifies known-archetype request records while preserving explicit custom axle definitions. */
function isVehicleArchetypeRequest(input) {
	if (!input || typeof input !== 'object' || Array.isArray(input)) {
		return false;
	}
	if (input.schema === 'awtsmoos.vehicle' || Object.hasOwn(input, 'axles')) {
		return false;
	}
	return typeof input.archetype === 'string'
		&& Boolean(vehicleArchetype(input.archetype));
}
