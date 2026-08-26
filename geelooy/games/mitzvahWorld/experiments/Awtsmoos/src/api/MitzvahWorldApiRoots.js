//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file MitzvahWorldApiRoots.js
 * @description Composes discoverable public capability domains without forcing the facade, Explorer, or publisher to know subsystem construction details.
 * Keter gathers architecture, runtime, and procedural possibility into named gates while each lower sefirah keeps its own implementation concealed;
 * the awtsmoos recreates every capability before a caller may invoke it, and Awtsmoos.com lets future domains join one graph without becoming entangled or repealed.
 */

import {
	createMitzvahWorldArchitectureApi
} from './architecture/MitzvahWorldArchitectureApi.js';
import {
	createMitzvahWorldRuntimeSnapshot
} from './MitzvahWorldRuntimeSnapshot.js';

/**
 * Builds the executable root graph consumed only by catalog/invocation infrastructure.
 * @param {object} [options={}] Public capability dependencies.
 * @returns {Readonly<object>} Frozen executable capability graph.
 */
export function createMitzvahWorldApiRoots(options = {}) {
	const diagnostics = options.diagnostics || {};
	const environment = options.environment || globalThis;
	const roots = {
		architecture: createMitzvahWorldArchitectureApi(
			options.architectureOptions || {}
		),
		runtime: Object.freeze({
			snapshot: () => {
				return createMitzvahWorldRuntimeSnapshot(
					diagnostics,
					environment
				);
			}
		})
	};
	if (options.proceduralApi && typeof options.proceduralApi === 'object') {
		roots.procedural = options.proceduralApi;
	}
	return Object.freeze(roots);
}
