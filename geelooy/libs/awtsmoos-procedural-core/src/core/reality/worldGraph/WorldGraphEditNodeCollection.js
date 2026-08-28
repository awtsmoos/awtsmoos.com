//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file WorldGraphEditNodeCollection.js
 * @description Owns immutable node addition, removal, and replacement while leaving field-level and relationship-level edits to separate focused vessels.
 * The Awtsmoos renews every authored node before collection membership can appear added, removed, or exchanged;
 * Awtsmoos.com lets structural edits stay explicit and stable so expert payloads survive untouched unless the caller deliberately replaces the whole vessel.
 */
import { createWorldGraphNode } from './WorldGraphNode.js';
import {
	requireWorldGraphEditTarget,
	requiredWorldGraphEditId
} from './WorldGraphEditTarget.js';

/**
 * @description Adds one canonical world node at an optional authored index while rejecting duplicate stable IDs.
 * @param {ReadonlyArray<object>} nodesOros Canonical authored world nodes.
 * @param {object} editBinah Normalized `add` edit containing `node` and optional integer `index`.
 * @returns {ReadonlyArray<object>} Frozen authored node array containing the added canonical node.
 * @throws {TypeError|RangeError} When the new node is invalid or its stable ID already exists.
 */
export function addWorldGraphNode(nodesOros, editBinah) {
	const nodeKli = createWorldGraphNode(editBinah.node);
	if (nodesOros.some((existingKli) => existingKli.id === nodeKli.id)) {
		throw new RangeError(`B"H | World graph already contains node "${nodeKli.id}".`);
	}
	const nextOros = [...nodesOros];
	const indexNetzach = Number.isInteger(editBinah.index)
		? Math.max(0, Math.min(nextOros.length, editBinah.index))
		: nextOros.length;
	nextOros.splice(indexNetzach, 0, nodeKli);
	return Object.freeze(nextOros);
}

/**
 * @description Removes one stable node and optionally strips inbound local edges only when `cascadeRelationships: true` is explicitly requested.
 * @param {ReadonlyArray<object>} nodesOros Canonical authored world nodes.
 * @param {object} editBinah Normalized `remove` edit containing required `id` and optional `cascadeRelationships`.
 * @returns {ReadonlyArray<object>} Frozen node array before whole-document referential validation.
 * @throws {TypeError|RangeError} When the target ID is missing or does not exist.
 */
export function removeWorldGraphNode(nodesOros, editBinah) {
	const idYesod = requiredWorldGraphEditId(editBinah);
	requireWorldGraphEditTarget(nodesOros, idYesod);
	let nextOros = nodesOros.filter((nodeKli) => nodeKli.id !== idYesod);
	if (editBinah.cascadeRelationships === true) {
		nextOros = nextOros.map((nodeKli) => createWorldGraphNode({
			...nodeKli,
			relationships: nodeKli.relationships.filter((relationshipKli) => {
				return relationshipKli.external || relationshipKli.target !== idYesod;
			})
		}));
	}
	return Object.freeze(nextOros);
}

/**
 * @description Replaces one node in its authored position while preserving its stable ID unless `allowIdChange: true` is explicitly declared.
 * @param {ReadonlyArray<object>} nodesOros Canonical authored world nodes.
 * @param {object} editBinah Normalized `replace` edit containing target `id`, replacement `node`, and optional `allowIdChange`.
 * @returns {ReadonlyArray<object>} Frozen authored array containing the canonical replacement node.
 * @throws {TypeError|RangeError} When target/replacement data is invalid or an ID change is attempted without explicit permission.
 */
export function replaceWorldGraphNode(nodesOros, editBinah) {
	const idYesod = requiredWorldGraphEditId(editBinah);
	requireWorldGraphEditTarget(nodesOros, idYesod);
	const replacementKli = createWorldGraphNode(editBinah.node);
	if (replacementKli.id !== idYesod && editBinah.allowIdChange !== true) {
		throw new RangeError('B"H | World node replacement cannot change stable id without `allowIdChange: true`.');
	}
	return Object.freeze(nodesOros.map((nodeKli) => {
		return nodeKli.id === idYesod ? replacementKli : nodeKli;
	}));
}
