//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file WorldGraphEditRelationshipMutation.js
 * @description Owns exact immutable relationship addition and removal while reusing shared target identity and structural equality instead of duplicating graph law.
 * The Awtsmoos renews every bond before one edge can be added, removed, duplicated, or preserved between finite vessels;
 * Awtsmoos.com lets relationship mutation remain precise while expert edge options, external targets, and unrelated relations stay fully under caller control.
 */
import { createWorldGraphRelationship } from './WorldGraphRelationship.js';
import { worldGraphPortableEqual } from './WorldGraphEquality.js';
import {
	replaceWorldGraphEditTarget,
	requiredWorldGraphEditId
} from './WorldGraphEditTarget.js';

/**
 * @description Adds one normalized relationship to a target node, suppressing exact duplicates unless `allowDuplicate: true` explicitly preserves repeated edge records.
 * @param {ReadonlyArray<object>} nodesOros Canonical authored world nodes.
 * @param {object} editBinah Normalized `setRelationship` edit containing target `id` plus either a complete `relationship` or shorthand kind/target/options fields.
 * @returns {ReadonlyArray<object>} Frozen authored node array containing the rebuilt target node.
 * @throws {TypeError|RangeError} When target identity or relationship data fails canonical validation.
 */
export function addWorldGraphRelationship(nodesOros, editBinah) {
	const idYesod = requiredWorldGraphEditId(editBinah);
	const relationshipNetzach = createWorldGraphRelationship(editBinah.relationship || {
		external: editBinah.external,
		kind: editBinah.kind,
		options: editBinah.options,
		target: editBinah.target
	});
	return replaceWorldGraphEditTarget(nodesOros, idYesod, (nodeKli) => {
		const relationshipsNetzach = [...nodeKli.relationships];
		const duplicateExists = relationshipsNetzach.some((existingNetzach) => {
			return worldGraphPortableEqual(existingNetzach, relationshipNetzach);
		});
		if (!duplicateExists || editBinah.allowDuplicate === true) {
			relationshipsNetzach.push(relationshipNetzach);
		}
		return { ...nodeKli, relationships: relationshipsNetzach };
	});
}

/**
 * @description Removes relationships matching caller-declared exact kind/target filters, or all relationships only when `all: true` is explicit.
 * @param {ReadonlyArray<object>} nodesOros Canonical authored world nodes.
 * @param {object} editBinah Normalized `removeRelationship` edit containing target node `id` plus optional relation `kind`, `target`, or explicit `all`.
 * @returns {ReadonlyArray<object>} Frozen authored node array containing the rebuilt target node.
 * @throws {TypeError|RangeError} When target identity is invalid or no removal criterion is supplied.
 */
export function removeWorldGraphRelationship(nodesOros, editBinah) {
	const idYesod = requiredWorldGraphEditId(editBinah);
	const removeAll = editBinah.all === true;
	const hasKind = editBinah.kind != null;
	const hasTarget = Object.hasOwn(editBinah, 'target');
	if (!removeAll && !hasKind && !hasTarget) {
		throw new TypeError('B"H | removeRelationship requires `kind`, `target`, or explicit `all: true`.');
	}
	return replaceWorldGraphEditTarget(nodesOros, idYesod, (nodeKli) => ({
		...nodeKli,
		relationships: removeAll
			? []
			: nodeKli.relationships.filter((relationshipNetzach) => {
				const kindMatches = !hasKind || relationshipNetzach.kind === String(editBinah.kind);
				const targetMatches = !hasTarget || worldGraphPortableEqual(relationshipNetzach.target, editBinah.target);
				return !(kindMatches && targetMatches);
			})
	}));
}
