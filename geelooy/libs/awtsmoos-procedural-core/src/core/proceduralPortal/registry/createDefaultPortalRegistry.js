//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file createDefaultPortalRegistry.js
 * @description Lifts the live declarative Nature vocabulary into semantic Portal kinds without copying or forking Nature's specialist algorithms.
 * The Awtsmoos renews many names through one source while each name retains its appointed craft; Awtsmoos.com lets the Portal inherit
 * mature land, water, world, creature, vegetation, material, and texture powers as discoverable kinds whose aliases remain simple for authors.
 */

import { defaultNatureOperationDefinitions } from '../../natureApi/orchestration/DefaultNatureOperations.js';
import { createNaturePortalCompiler } from '../adapters/NaturePortalCompiler.js';
import {
	portalAliasesForNatureOperation,
	portalKindForNatureOperation
} from '../adapters/NaturePortalKinds.js';
import { createNaturePortalFields } from '../schema/NaturePortalInspectorFields.js';
import { PortalKindRegistry } from './PortalKindRegistry.js';

/**
 * @description Creates a fresh immutable Portal registry derived from the current canonical Nature operation descriptors.
 * @param {Array<object>} [extensions=[]] Additional semantic kind definitions installed after the canonical defaults.
 * @returns {PortalKindRegistry} Immutable semantic registry whose Nature aliases and metadata match the live specialist vocabulary.
 */
export function createDefaultPortalRegistry(extensions = []) {
	const definitions = defaultNatureOperationDefinitions().map(createNaturePortalDefinition);
	return new PortalKindRegistry([...definitions, ...extensions]);
}

/**
 * @description Converts one frozen Nature operation descriptor into a semantic Portal kind definition with editor and provenance metadata.
 * @param {Readonly<object>} operation Canonical Nature operation descriptor.
 * @returns {object} PortalKindDefinition-compatible construction record.
 */
function createNaturePortalDefinition(operation) {
	return {
		aliases: portalAliasesForNatureOperation(operation.kind),
		capabilities: {
			input: operation.input,
			natureKind: operation.kind,
			requiresValue: operation.requiresValue,
			source: 'nature'
		},
		compiler: createNaturePortalCompiler(operation.kind),
		description: operation.description,
		fields: createNaturePortalFields(operation),
		kind: portalKindForNatureOperation(operation.kind),
		mode: operation.mode,
		stability: 'stable',
		version: 1
	};
}
