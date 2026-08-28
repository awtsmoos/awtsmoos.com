//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file createProceduralLanguageSchema.js
 * @description Exposes machine-readable definition, semantic, patch, artifact, mesh, reference, descriptor, and execution structure for humans, editors, AI, and validators.
 * The Awtsmoos is beyond every schema while finite schemas let many authors speak one disciplined tongue;
 * Awtsmoos.com reveals semantic traits and precise edits beside geometry so universal intent and generated artifact are not confused as one.
 */

import {
	PROCEDURAL_ACTIONS,
	PROCEDURAL_LANGUAGE_SCHEMA,
	PROCEDURAL_LANGUAGE_VERSION
} from '../contract/ProceduralLanguageContract.js';
import { createProceduralLanguageCapabilities } from '../capabilities/createProceduralLanguageCapabilities.js';

const DEFINITION_SECTIONS = Object.freeze([
	'revision',
	'traits',
	'relationships',
	'behaviors',
	'provenance',
	'payload',
	'actions',
	'constraints',
	'resources',
	'compile',
	'editor',
	'metadata',
	'extensions'
]);

/**
 * @description Creates one portable schema-like discovery record without binding procedural core to a specific third-party schema library.
 * @param {object} [binahOptions={}] Optional language registry used to reveal current operation vocabulary.
 * @returns {Readonly<object>} Immutable structural description for authoring tools, generated docs, validators, and RAG discovery.
 */
export function createProceduralLanguageSchema(binahOptions = {}) {
	const hodCapabilities = createProceduralLanguageCapabilities(
		binahOptions.registry
	);
	return Object.freeze({
		schema: 'awtsmoos.procedural-language-schema',
		version: 2,
		definition: definitionSchema(),
		trait: traitSchema(),
		relationship: relationshipSchema(),
		behavior: behaviorSchema(),
		patch: patchSchema(hodCapabilities),
		action: Object.freeze({
			required: Object.freeze(['op']),
			universalOps: PROCEDURAL_ACTIONS,
			registeredOps: Object.freeze(
				hodCapabilities.operations.map((operation) => operation.op)
			)
		}),
		artifactChannels: hodCapabilities.artifactChannels,
		editableMesh: Object.freeze({
			required: Object.freeze(['vertices', 'faces']),
			vertex: '[x,y,z]',
			face: '{ id?, vertices:[index...], material?, metadata? }',
			selectionDomains: Object.freeze(['vertices', 'edges', 'faces'])
		}),
		descriptors: Object.freeze([
			'frame', 'guide', 'field', 'surface', 'volume', 'constraint',
			'distribution', 'resource', 'budget', 'lod', 'material-role', 'editor-parameter'
		]),
		executionModes: Object.freeze(Object.keys(hodCapabilities.groups))
	});
}

/** @private */
function definitionSchema() {
	return Object.freeze({
		schema: PROCEDURAL_LANGUAGE_SCHEMA,
		version: PROCEDURAL_LANGUAGE_VERSION,
		required: Object.freeze(['id', 'kind', 'seed', 'payload']),
		sections: DEFINITION_SECTIONS,
		revision: 'positive-integer; advances once per non-empty atomic edit transaction'
	});
}

/** @private */
function traitSchema() {
	return Object.freeze({
		addressing: 'traits.<stableId>.values.<specificPath>',
		fields: Object.freeze(['id', 'kind', 'values', 'constraints', 'affects', 'editor', 'metadata']),
		stableId: 'letters, digits, underscore, hyphen'
	});
}

/** @private */
function relationshipSchema() {
	return Object.freeze({
		fields: Object.freeze(['id', 'type', 'from', 'to', 'values', 'metadata']),
		purpose: 'generic semantic world-graph edge'
	});
}

/** @private */
function behaviorSchema() {
	return Object.freeze({
		fields: Object.freeze(['id', 'kind', 'enabled', 'triggers', 'values', 'affects', 'metadata']),
		purpose: 'portable time/reactivity intent independent of runtime engine'
	});
}

/** @private */
function patchSchema(capabilities) {
	return Object.freeze({
		operations: capabilities.patchOperations,
		guards: Object.freeze(['expect', 'expectExists', 'expectedRevision']),
		atomic: true,
		receipt: 'hashes, revisions, changed paths/sections, affected traits/channels, provenance'
	});
}
