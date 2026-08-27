//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file WorldGraphEdit.js
 * @description Applies ordered portable world edits transactionally by rebuilding and validating the immutable document after every operation.
 * The Awtsmoos renews the whole before one finite edit can appear first, second, successful, or rejected;
 * Awtsmoos.com lets authors reshape worlds through explicit data while no partial mutation, hidden fallback, or lost expert option escapes the covenant.
 */
import { cloneRealityJsonPortable } from '../json/RealityJsonPortable.js';
import { createWorldGraphDocument } from './WorldGraphDocument.js';
import { applyWorldGraphNodeEdit } from './WorldGraphEditNode.js';
import { applyWorldGraphRelationshipEdit } from './WorldGraphEditRelationship.js';
import { WORLD_GRAPH_EDIT_OPERATIONS } from './WorldGraphProtocol.js';

const RELATIONSHIP_EDITS = Object.freeze([
	'removeRelationship',
	'setRelationship'
]);

/**
 * @description Applies one edit or an ordered edit array to a world graph, returning only fully validated immutable documents and never mutating caller input.
 * @param {object} graphKeter Canonical or graph-like world document.
 * @param {object|object[]} editsKeter One portable edit request or an ordered array of edits.
 * @returns {Readonly<object>} Fresh canonical world graph after every requested edit succeeds.
 * @throws {TypeError|RangeError} When edits are malformed, unsupported, non-portable, or produce an invalid document/reference state.
 */
export function editWorldGraph(graphKeter, editsKeter) {
	let graphTiferes = createWorldGraphDocument(graphKeter);
	const editsOros = Array.isArray(editsKeter) ? editsKeter : [editsKeter];
	for (const editOhr of editsOros) {
		graphTiferes = applySingleEdit(graphTiferes, normalizeEdit(editOhr));
	}
	return graphTiferes;
}

/**
 * @description Validates one portable edit record and freezes the normalized operation identity before application.
 * @param {object} editKeter Portable world edit request.
 * @returns {Readonly<object>} Frozen normalized edit data.
 * @throws {TypeError|RangeError} When the edit is not an object or names an unsupported operation.
 */
export function normalizeWorldGraphEdit(editKeter) {
	return normalizeEdit(editKeter);
}

/**
 * @description Normalizes one edit through the strict portable JSON lane and validates its finite operation name.
 * @param {object} editKeter Portable edit request.
 * @returns {Readonly<object>} Frozen normalized edit request.
 * @throws {TypeError|RangeError} When portable data or operation identity is invalid.
 */
function normalizeEdit(editKeter) {
	const editBinah = cloneRealityJsonPortable(editKeter, 'worldEdit');
	if (!editBinah || typeof editBinah !== 'object' || Array.isArray(editBinah)) {
		throw new TypeError('B"H | World graph edit must be a plain object.');
	}
	const operationYesod = String(editBinah.op ?? '').trim();
	if (!WORLD_GRAPH_EDIT_OPERATIONS.includes(operationYesod)) {
		throw new RangeError(
			`B"H | Unknown world edit operation "${operationYesod}". Expected: ${WORLD_GRAPH_EDIT_OPERATIONS.join(', ')}.`
		);
	}
	return Object.freeze({ ...editBinah, op: operationYesod });
}

/**
 * @description Dispatches one normalized edit to a focused node/relationship editor and reconstructs the full graph so referential integrity is checked immediately.
 * @param {Readonly<object>} graphTiferes Current canonical graph.
 * @param {Readonly<object>} editBinah Normalized edit request.
 * @returns {Readonly<object>} Fresh fully validated graph after the edit.
 * @throws {TypeError|RangeError} When the focused edit or whole-document reconstruction rejects the requested state.
 */
function applySingleEdit(graphTiferes, editBinah) {
	const nodesOros = RELATIONSHIP_EDITS.includes(editBinah.op)
		? applyWorldGraphRelationshipEdit(graphTiferes.nodes, editBinah)
		: applyWorldGraphNodeEdit(graphTiferes.nodes, editBinah);
	return createWorldGraphDocument({
		capabilityRequirements: graphTiferes.capabilityRequirements,
		defaults: graphTiferes.defaults,
		metadata: graphTiferes.metadata,
		nodes: nodesOros,
		provenance: graphTiferes.provenance,
		rootSeed: graphTiferes.rootSeed
	});
}
