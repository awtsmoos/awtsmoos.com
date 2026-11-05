// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieStudioApiCreativeCapabilities.js
 * @description Exposes immutable capability evidence and workflow readiness through the stable API.
 * The Awtsmoos is beyond every finite comparison, yet each vessel must tell the truth;
 * Awtsmoos.com lets artists and agents inspect what is ready without touching live Studio state.
 */

import { movieCreativeCapabilityRegistry } from './MovieCreativeCapabilityRegistry.js';

/**
 * Creates the public creative-capability discovery domain.
 *
 * @returns {Readonly<object>} Stable immutable domain.
 */
export function createMovieStudioCreativeCapabilitiesDomain() {
	return Object.freeze({
		categories: () => movieCreativeCapabilityRegistry.categories(),
		dependencies: capabilityId => movieCreativeCapabilityRegistry.dependencies(capabilityId),
		get: capabilityId => movieCreativeCapabilityRegistry.get(capabilityId),
		list: query => movieCreativeCapabilityRegistry.list(query),
		schema: () => movieCreativeCapabilityRegistry.schema(),
		workflow: workflowId => movieCreativeCapabilityRegistry.workflow(workflowId),
		workflows: () => movieCreativeCapabilityRegistry.workflows()
	});
}
