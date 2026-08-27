//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file createVehicleDomainAuthority.js
 * @description Adapts universal `kind: vehicle` definitions into the dedicated vehicle compiler without modifying or hard-coding the universal domain registry itself.
 * The Awtsmoos is One while domain and universal language remain distinct finite vessels; Awtsmoos.com lets vehicle JSON enter the shared compiler graph through explicit registration rather than secret imports or brittle central switches.
 */

import { VehicleCompiler } from '../compiler/VehicleCompiler.js';
import { createVehicleDefinition } from '../definition/createVehicleDefinition.js';

/**
 * Creates one domain authority compatible with `ProceduralDomainRegistry.register('vehicle', authority)`.
 * @param {{compiler?: object}} [options={}] Optional dedicated vehicle compiler override.
 * @returns {Readonly<object>} Authority exposing compile, validate, and describe contracts.
 */
export function createVehicleDomainAuthority(options = {}) {
	const compiler = options.compiler || new VehicleCompiler();
	return Object.freeze({
		compile(definition, compileOptions = {}) {
			return compiler.compile(
				revealVehicleDomainInput(definition),
				compileOptions
			);
		},
		validate(definition) {
			return createVehicleDefinition(
				revealVehicleDomainInput(definition)
			);
		},
		describe() {
			return Object.freeze({
				kind: 'vehicle',
				schema: 'awtsmoos.vehicle',
				compiler: 'VehicleCompiler',
				physicsExecution: 'descriptor-only'
			});
		}
	});
}

/** Extracts vehicle data from a universal definition payload while preserving direct vehicle-definition compatibility. */
function revealVehicleDomainInput(definition) {
	if (definition?.schema === 'awtsmoos.vehicle') {
		return definition;
	}
	if (definition?.payload?.vehicle) {
		return definition.payload.vehicle;
	}
	if (definition?.kind === 'vehicle' && definition?.payload) {
		return {
			id: definition.id,
			seed: definition.seed,
			...definition.payload
		};
	}
	return definition;
}
