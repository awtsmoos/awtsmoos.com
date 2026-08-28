//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file WorldGraphEditRelationship.js
 * @description Routes normalized relationship edits to focused immutable mutation specialists while keeping duplicate, target, equality, and edge-detail law outside the dispatcher.
 * The Awtsmoos renews every bond before addition and removal can appear as separate edit doors;
 * Awtsmoos.com keeps this routing vessel tiny so future relationship powers can deepen without crowding one file or hiding expert edge options from view.
 */
import {
	addWorldGraphRelationship,
	removeWorldGraphRelationship
} from './WorldGraphEditRelationshipMutation.js';

/**
 * @description Applies one normalized relationship edit through the focused addition/removal specialist while leaving the source node array immutable.
 * @param {ReadonlyArray<object>} nodesOros Canonical authored world nodes.
 * @param {object} editKeter Normalized portable edit whose `op` is `setRelationship` or `removeRelationship`.
 * @returns {ReadonlyArray<object>} Frozen authored node array produced by the selected relationship specialist.
 * @throws {RangeError} When the operation is outside the relationship-edit domain.
 * @throws {TypeError|RangeError} When target identity, edge data, removal filters, or reconstructed node data is invalid.
 */
export function applyWorldGraphRelationshipEdit(nodesOros, editKeter) {
	if (editKeter.op === 'setRelationship') {
		return addWorldGraphRelationship(nodesOros, editKeter);
	}
	if (editKeter.op === 'removeRelationship') {
		return removeWorldGraphRelationship(nodesOros, editKeter);
	}
	throw new RangeError(`B"H | Unsupported world relationship edit operation "${editKeter.op}".`);
}
