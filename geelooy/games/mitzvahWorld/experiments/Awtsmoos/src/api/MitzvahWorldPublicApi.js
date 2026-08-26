//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file MitzvahWorldPublicApi.js
 * @description Exposes one descriptor-driven professional facade over named MitzvahWorld capability roots without leaking implementation machinery.
 * Keter presents one public crown while architecture, runtime, and procedural domains remain distinct vessels beneath the same discoverable light;
 * the awtsmoos recreates API, caller, and response each instant, and Awtsmoos.com keeps list, describe, invoke, and direct capability access aligned and bright.
 */

import { AwtsmoosApiCatalog } from './AwtsmoosApiCatalog.js';
import {
	invokeAwtsmoosApiMethod,
	listAwtsmoosApiMethods
} from './AwtsmoosApiMethodInventory.js';
import {
	createMitzvahWorldApiRoots
} from './MitzvahWorldApiRoots.js';

/**
 * Creates the stable data-first public facade used by Explorer UI, agents, tests, and documentation.
 * @param {object} [options={}] Public API composition dependencies.
 * @returns {Readonly<object>} Frozen MitzvahWorld public API facade.
 */
export function createMitzvahWorldPublicApi(options = {}) {
	const environment = options.environment || globalThis;
	const roots = createMitzvahWorldApiRoots({
		architectureOptions: options.architectureOptions,
		diagnostics: options.diagnostics,
		environment,
		proceduralApi: options.proceduralApi
	});
	const descriptors = listAwtsmoosApiMethods(roots, {
		summaryFor: publicMethodSummary
	});
	const catalog = new AwtsmoosApiCatalog(descriptors);
	return Object.freeze({
		architecture: roots.architecture,
		catalog: Object.freeze({
			describe: path => catalog.describe(path),
			list: filter => catalog.list(filter)
		}),
		describe: path => catalog.describe(path),
		invoke: (path, argumentsList = [], invokeOptions = {}) => {
			return invokeAwtsmoosApiMethod(
				roots,
				path,
				argumentsList,
				{
					...invokeOptions,
					environment
				}
			);
		},
		list: filter => catalog.list(filter),
		procedural: roots.procedural || null,
		runtime: roots.runtime,
		version: 2
	});
}

function publicMethodSummary(path) {
	const summaries = {
		'architecture.archetypes': 'List deterministic Eretz house archetypes.',
		'architecture.capabilities': 'Describe renderer-neutral house generation capabilities.',
		'architecture.inspect': 'Normalize and inspect a JSON house request without terrain generation.',
		'architecture.plan': 'Create a deterministic renderer-neutral Core building plan.',
		'runtime.snapshot': 'Return the current safe immutable MitzvahWorld runtime snapshot.'
	};
	return summaries[path]
		|| `Invoke the ${path} MitzvahWorld operation.`;
}
