//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file createProceduralLanguageCapabilities.js
 * @description Exposes execution truth together with universal semantic sections, surgical patch verbs, guarded editing support, and artifact channels as machine-readable discovery data.
 * The Awtsmoos is infinite while finite executors, traits, edits, and artifact channels receive measured names;
 * Awtsmoos.com lets people, editors, tests, and AI discover exactly which powers are represented without confusing description with execution claims.
 */

import { PROCEDURAL_ARTIFACT_CHANNELS } from '../artifact/ProceduralArtifactChannels.js';
import { LANGUAGE_EXECUTION } from '../contract/ProceduralLanguageContract.js';
import { PROCEDURAL_PATCH_OPERATIONS } from '../patch/createProceduralPatchOperation.js';
import { createDefaultLanguageRegistry } from '../registry/createDefaultLanguageRegistry.js';

const SEMANTIC_SECTIONS = Object.freeze([
	'traits',
	'relationships',
	'behaviors',
	'provenance'
]);

/**
 * @description Builds immutable capability evidence for both operation execution and the data-language features that exist independently of any renderer adapter.
 * @param {object} [yesodRegistry=createDefaultLanguageRegistry()] Operation registry whose descriptions reveal native, bridged, adapter, and descriptor support.
 * @returns {Readonly<object>} Machine-readable capability record suitable for UI, AI, docs, validation, planning, and migration tools.
 */
export function createProceduralLanguageCapabilities(
	yesodRegistry = createDefaultLanguageRegistry()
) {
	const netzachOperations = yesodRegistry.describe();
	const malchusGroups = createExecutionGroups(netzachOperations);
	return Object.freeze({
		schema: 'awtsmoos.procedural-language.capabilities',
		version: 2,
		operationCount: netzachOperations.length,
		operations: netzachOperations,
		groups: malchusGroups,
		semanticSections: SEMANTIC_SECTIONS,
		artifactChannels: PROCEDURAL_ARTIFACT_CHANNELS,
		patchOperations: PROCEDURAL_PATCH_OPERATIONS,
		editing: Object.freeze({
			traitScoped: true,
			atomicTransactions: true,
			expectedRevisionGuard: true,
			expectedValueGuard: true,
			existenceGuard: true,
			deterministicReceipts: true
		}),
		supportMeaning: Object.freeze({
			native: 'executes in the editable/data language kernel',
			coreBridge: 'executes through an existing trusted procedural-core authority',
			adapter: 'represented exactly and deferred to a capable adapter such as Blender',
			descriptor: 'portable intent with no execution claim'
		})
	});
}

/**
 * @description Groups operation descriptions by their declared execution boundary without mutating registry-owned descriptions.
 * @param {ReadonlyArray<object>} netzachOperations Canonical registered operation descriptions.
 * @returns {Readonly<object>} Frozen map from execution boundary to matching operation descriptions.
 */
function createExecutionGroups(netzachOperations) {
	const malchusGroups = {};
	for (const yesodExecution of Object.values(LANGUAGE_EXECUTION)) {
		malchusGroups[yesodExecution] = Object.freeze(
			netzachOperations.filter(
				(tiferesOperation) => tiferesOperation.execution === yesodExecution
			)
		);
	}
	return Object.freeze(malchusGroups);
}
