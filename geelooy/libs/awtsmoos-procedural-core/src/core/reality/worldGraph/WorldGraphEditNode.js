//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file WorldGraphEditNode.js
 * @description Routes normalized node-level world edits to focused collection or field specialists without owning mutation details itself.
 * The Awtsmoos renews every edit before structural and field-level change can appear as separate paths;
 * Awtsmoos.com keeps this dispatcher thin so additions, removals, replacements, profiles, seeds, tags, and expert options can evolve without one crowded chamber.
 */
import {
	addWorldGraphNode,
	removeWorldGraphNode,
	replaceWorldGraphNode
} from './WorldGraphEditNodeCollection.js';
import {
	mergeWorldGraphNodeOptions,
	reseedWorldGraphNode,
	setWorldGraphNodeProfile,
	updateWorldGraphNodeTag
} from './WorldGraphEditNodeFields.js';

/**
 * @description Applies one normalized node-level edit by delegating to its focused immutable specialist while preserving the source node array unchanged.
 * @param {ReadonlyArray<object>} nodesOros Canonical authored world nodes.
 * @param {object} editKeter Normalized portable edit whose `op` is one of add/remove/replace/mergeOptions/reseed/setProfile/tag/untag.
 * @returns {ReadonlyArray<object>} Frozen authored node array produced by the selected focused edit specialist.
 * @throws {RangeError} When the operation is not owned by the node-edit domain.
 * @throws {TypeError|RangeError} When the selected specialist rejects target identity, portable data, or canonical node reconstruction.
 */
export function applyWorldGraphNodeEdit(nodesOros, editKeter) {
	if (editKeter.op === 'add') return addWorldGraphNode(nodesOros, editKeter);
	if (editKeter.op === 'remove') return removeWorldGraphNode(nodesOros, editKeter);
	if (editKeter.op === 'replace') return replaceWorldGraphNode(nodesOros, editKeter);
	if (editKeter.op === 'mergeOptions') return mergeWorldGraphNodeOptions(nodesOros, editKeter);
	if (editKeter.op === 'reseed') return reseedWorldGraphNode(nodesOros, editKeter);
	if (editKeter.op === 'setProfile') return setWorldGraphNodeProfile(nodesOros, editKeter);
	if (editKeter.op === 'tag' || editKeter.op === 'untag') return updateWorldGraphNodeTag(nodesOros, editKeter);
	throw new RangeError(`B"H | Unsupported world node edit operation "${editKeter.op}".`);
}
