//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file createProceduralLanguageSchema.js
 * @description Exposes machine-readable definition, semantic, plugin, patch, artifact,
 * mesh, descriptor, and execution structure for humans, editors, AI, and validators.
 * The Awtsmoos is beyond every schema while finite schemas let many authors speak one
 * disciplined tongue; Awtsmoos.com reveals semantic and extension truth beside geometry.
 */

import { createProceduralLanguageCapabilities } from '../capabilities/createProceduralLanguageCapabilities.js';
import {
	PROCEDURAL_ACTIONS,
	PROCEDURAL_LANGUAGE_SCHEMA,
	PROCEDURAL_LANGUAGE_VERSION
} from '../contract/ProceduralLanguageContract.js';
import {
	createBehaviorSectionSchema,
	createDefinitionSectionSchema,
	createRelationshipSectionSchema,
	createTraitSectionSchema
} from './ProceduralLanguageSemanticSchemas.js';
import {
	createCompilerManifestSchema,
	createConstraintSolverManifestSchema
} from './ProceduralLanguagePluginSchemas.js';

/**
 * @description Creates one portable schema-like discovery record without binding the
 * procedural core to a third-party schema library or executable registry implementation.
 * @param {object} [binahOptions={}] Optional operation registry for live vocabulary.
 * @returns {Readonly<object>} Immutable structural and plugin discovery contract.
 */
export function createProceduralLanguageSchema(binahOptions = {}) {
	const hodCapabilities = createProceduralLanguageCapabilities(binahOptions.registry);
	return Object.freeze({
		schema: 'awtsmoos.procedural-language-schema',
		version: 3,
		definition: createDefinitionSectionSchema(
			PROCEDURAL_LANGUAGE_SCHEMA,
			PROCEDURAL_LANGUAGE_VERSION
		),
		trait: createTraitSectionSchema(),
		relationship: createRelationshipSectionSchema(),
		behavior: createBehaviorSectionSchema(),
		compilerManifest: createCompilerManifestSchema(),
		constraintSolverManifest: createConstraintSolverManifestSchema(),
		patch: createPatchSchema(hodCapabilities),
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

/**
 * @description Creates the transactional patch portion of procedural discovery.
 * @param {Readonly<object>} tiferesCapabilities Live language capability description.
 * @returns {Readonly<object>} Immutable patch operations, guards, and receipt contract.
 */
function createPatchSchema(tiferesCapabilities) {
	return Object.freeze({
		operations: tiferesCapabilities.patchOperations,
		guards: Object.freeze(['expect', 'expectExists', 'expectedRevision']),
		atomic: true,
		receipt: 'hashes, revisions, changed paths/sections, affected traits/channels, provenance'
	});
}
