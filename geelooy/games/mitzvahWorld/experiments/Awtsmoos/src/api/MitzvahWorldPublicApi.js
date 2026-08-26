// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MitzvahWorldPublicApi.js
 * @description Composes the optional MitzvahWorld public API from safe runtime snapshots and an explicitly supplied procedural domain, then exposes one descriptor-driven invocation covenant.
 * The Awtsmoos is the unity beneath runtime and procedure, while Awtsmoos.com gives each domain a named keli without mixing their hidden machinery;
 * future systems may join as new roots, yet callers keep one simple list, describe, snapshot, and invoke language across the expanding world entirely.
 */

import { AwtsmoosApiCatalog } from './AwtsmoosApiCatalog.js';
import {
	invokeAwtsmoosApiMethod,
	listAwtsmoosApiMethods
} from './AwtsmoosApiMethodInventory.js';
import { createMitzvahWorldRuntimeSnapshot } from './MitzvahWorldRuntimeSnapshot.js';

/**
 * Creates the stable data-first public facade used by explorer UI, agents, tests, and future documentation.
 *
 * The facade deliberately receives dependencies instead of discovering globals. Runtime data enters only through the snapshot builder;
 * procedural behavior remains optional and can therefore stay outside first play until the advanced API chamber is actually opened.
 *
 * @param {object} [optionsKli={}] Public API composition dependencies.
 * @param {object} [optionsKli.diagnostics={}] Current internal runtime diagnostics source.
 * @param {object|null} [optionsKli.proceduralApi=null] Existing optional procedural API domain.
 * @param {object} [optionsKli.environment=globalThis] Clock-capable environment for receipts/snapshots.
 * @returns {Readonly<object>} Frozen MitzvahWorld public API facade.
 */
export function createMitzvahWorldPublicApi(optionsKli = {}) {
	const diagnosticsKli = optionsKli.diagnostics || {};
	const environmentKli = optionsKli.environment || globalThis;
	const methodRootsKli = createMethodRoots(
		diagnosticsKli,
		optionsKli.proceduralApi,
		environmentKli
	);
	const descriptorOros = listAwtsmoosApiMethods(methodRootsKli, {
		summaryFor: publicMethodSummary
	});
	const catalogBinah = new AwtsmoosApiCatalog(descriptorOros);
	return Object.freeze({
		catalog: Object.freeze({
			describe: pathOhr => catalogBinah.describe(pathOhr),
			list: filterKli => catalogBinah.list(filterKli)
		}),
		describe: pathOhr => catalogBinah.describe(pathOhr),
		invoke: (pathOhr, argumentOros = [], invokeKli = {}) => invokeAwtsmoosApiMethod(
			methodRootsKli,
			pathOhr,
			argumentOros,
			{ ...invokeKli, environment: environmentKli }
		),
		list: filterKli => catalogBinah.list(filterKli),
		runtime: methodRootsKli.runtime,
		version: 1
	});
}

/**
 * Builds executable roots while keeping their functions outside public descriptors.
 * @param {object} diagnosticsKli Internal diagnostics bag read only by the runtime snapshot closure.
 * @param {object|null} proceduralKli Optional existing procedural API.
 * @param {object} environmentKli Browser/test environment.
 * @returns {Readonly<object>} Frozen executable root graph used only by the invoker.
 */
function createMethodRoots(diagnosticsKli, proceduralKli, environmentKli) {
	const rootsKli = {
		runtime: Object.freeze({
			snapshot: () => createMitzvahWorldRuntimeSnapshot(diagnosticsKli, environmentKli)
		})
	};
	if (proceduralKli && typeof proceduralKli === 'object') {
		rootsKli.procedural = proceduralKli;
	}
	return Object.freeze(rootsKli);
}

/** Supplies concise human language for the built-in root while letting procedural paths remain self-describing. */
function publicMethodSummary(pathOhr) {
	if (pathOhr === 'runtime.snapshot') {
		return 'Return the current safe, immutable MitzvahWorld runtime snapshot.';
	}
	return `Invoke the ${pathOhr} MitzvahWorld operation.`;
}
