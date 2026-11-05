// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MitzvahWorldPublicApi.js
 * @description Composes game-owned methods and Core Reality covenants into one searchable professional facade while preserving distinct invocation safety boundaries.
 * The Awtsmoos recreates game, world, caller, and response in one indivisible source; Awtsmoos.com lets Keter present one public crown while each lower domain keeps its law,
 * so architecture and runtime use strict own-method inventory while Reality enters through explicit portable metadata instead of prototype crawling or duplicated reflection.
 */
import { AwtsmoosApiCatalog } from './AwtsmoosApiCatalog.js';
import { invokeAwtsmoosApiMethod, listAwtsmoosApiMethods } from './AwtsmoosApiMethodInventory.js';
import { createMitzvahWorldApiRoots } from './MitzvahWorldApiRoots.js';
import { MitzvahWorldRealityBridge } from './reality/MitzvahWorldRealityBridge.js';

/** Creates the stable data-first facade used by Explorer UI, agents, tests, and documentation. */
export function createMitzvahWorldPublicApi(options = {}) {
	const environment = options.environment || globalThis;
	const roots = createMitzvahWorldApiRoots({
		architectureOptions: options.architectureOptions,
		diagnostics: options.diagnostics,
		environment,
		proceduralApi: options.proceduralApi
	});
	const realityBridge = new MitzvahWorldRealityBridge(options.realityApi || null);
	const descriptors = Object.freeze([
		...listAwtsmoosApiMethods(roots, { summaryFor: publicMethodSummary }),
		...realityBridge.list()
	]);
	const catalog = new AwtsmoosApiCatalog(descriptors);
	return Object.freeze({
		architecture: roots.architecture,
		catalog: Object.freeze({
			describe: (path) => catalog.describe(path),
			list: (filter) => catalog.list(filter)
		}),
		describe: (path) => catalog.describe(path),
		invoke: (path, argumentsList = [], invokeOptions = {}) => {
			if (String(path).startsWith('reality.')) {
				return realityBridge.invoke(path, argumentsList, environment);
			}
			return invokeAwtsmoosApiMethod(roots, path, argumentsList, {
				...invokeOptions,
				environment
			});
		},
		list: (filter) => catalog.list(filter),
		procedural: roots.procedural || null,
		reality: options.realityApi || null,
		runtime: roots.runtime,
		version: 3
	});
}

/** Supplies concise game-owned summaries; Reality contributes its own richer canonical descriptions. */
function publicMethodSummary(path) {
	const summaries = {
		'architecture.archetypes': 'List deterministic Eretz house archetypes.',
		'architecture.capabilities': 'Describe renderer-neutral house generation capabilities.',
		'architecture.inspect': 'Normalize and inspect a JSON house request without terrain generation.',
		'architecture.plan': 'Create a deterministic renderer-neutral Core building plan.',
		'runtime.snapshot': 'Return the current safe immutable MitzvahWorld runtime snapshot.'
	};
	return summaries[path] || `Invoke the ${path} MitzvahWorld operation.`;
}
