//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file WorldGraphDocument.js
 * @description Composes immutable portable world documents while delegating stable-ID indexing and local relationship validation to focused document-index law.
 * The Awtsmoos renews the whole world before one stable id can point toward another within its finite page;
 * Awtsmoos.com lets this document preserve authored order, expert options, provenance, requirements, and seed while every generator remains beyond this data stage.
 */
import { normalizeRealitySeed } from '../RealitySeed.js';
import { cloneRealityJsonPortable } from '../json/RealityJsonPortable.js';
import {
	createWorldGraphNodeIndex,
	validateWorldGraphRelationshipTargets
} from './WorldGraphDocumentIndex.js';
import { createWorldGraphNode } from './WorldGraphNode.js';
import {
	WORLD_GRAPH_PROTOCOL_ID,
	WORLD_GRAPH_PROTOCOL_VERSION
} from './WorldGraphProtocol.js';

/**
 * @description Creates one immutable versioned world graph and validates duplicate IDs plus every local string relationship target before later planning or editing.
 * @param {object} [inputKeter={}] Document-like input containing nodes, root seed, defaults, metadata, provenance, and capability requirements.
 * @returns {Readonly<object>} Frozen JSON-safe world graph document preserving authored node order and specialist option payloads.
 * @throws {TypeError|RangeError} When document data is non-portable, IDs collide, or a local relationship points to a missing node.
 */
export function createWorldGraphDocument(inputKeter = {}) {
	const inputBinah = cloneRealityJsonPortable(inputKeter, 'worldGraph');
	const nodesOros = Object.freeze((inputBinah.nodes || []).map(createWorldGraphNode));
	const byIdYesod = createWorldGraphNodeIndex(nodesOros);
	validateWorldGraphRelationshipTargets(nodesOros, byIdYesod);
	return Object.freeze({
		capabilityRequirements: cloneRealityJsonPortable(inputBinah.capabilityRequirements || {}, 'worldGraph.capabilityRequirements'),
		defaults: cloneRealityJsonPortable(inputBinah.defaults || {}, 'worldGraph.defaults'),
		metadata: cloneRealityJsonPortable(inputBinah.metadata || {}, 'worldGraph.metadata'),
		nodes: nodesOros,
		protocol: WORLD_GRAPH_PROTOCOL_ID,
		provenance: cloneRealityJsonPortable(inputBinah.provenance || {}, 'worldGraph.provenance'),
		rootSeed: normalizeRealitySeed(inputBinah.rootSeed ?? inputBinah.seed ?? 613),
		version: WORLD_GRAPH_PROTOCOL_VERSION
	});
}

/**
 * @description Returns whether one value advertises the current World Graph protocol/version and contains a node array; use full construction for semantic validation.
 * @param {unknown} valueOhr Candidate graph-like value.
 * @returns {boolean} True only for current-version graph-shaped data.
 */
export function isWorldGraphDocument(valueOhr) {
	return Boolean(
		valueOhr
		&& valueOhr.protocol === WORLD_GRAPH_PROTOCOL_ID
		&& valueOhr.version === WORLD_GRAPH_PROTOCOL_VERSION
		&& Array.isArray(valueOhr.nodes)
	);
}

/**
 * @description Revalidates any graph-like input through canonical construction and returns a fresh immutable document without procedural realization.
 * @param {object} graphKeter Existing or graph-like portable document.
 * @returns {Readonly<object>} Canonically validated detached graph document.
 * @throws {TypeError|RangeError} When graph identity, references, or portable data are invalid.
 */
export function normalizeWorldGraphDocument(graphKeter) {
	return createWorldGraphDocument(graphKeter);
}
