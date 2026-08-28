//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file WorldGraphEditNodeFields.js
 * @description Owns immutable expert-option, seed, profile, and metadata-tag edits so collection structure and relationships remain outside field-level mutation law.
 * The Awtsmoos renews every detail before one option, profile, seed, or tag can appear changed within a finite node;
 * Awtsmoos.com lets each explicit field edit preserve every unrelated expert value so high-level convenience never narrows the specialist's deeper road.
 */
import { cloneRealityJsonPortable } from '../json/RealityJsonPortable.js';
import {
	replaceWorldGraphEditTarget,
	requiredWorldGraphEditId
} from './WorldGraphEditTarget.js';

/**
 * @description Merges only caller-declared expert option keys into one target node, preserving every unrelated option exactly.
 * @param {ReadonlyArray<object>} nodesOros Canonical authored world nodes.
 * @param {object} editBinah Normalized `mergeOptions` edit containing target `id` and portable `options`.
 * @returns {ReadonlyArray<object>} Frozen authored node array containing the rebuilt target node.
 * @throws {TypeError|RangeError} When target identity, options portability, or reconstructed node data is invalid.
 */
export function mergeWorldGraphNodeOptions(nodesOros, editBinah) {
	const idYesod = requiredWorldGraphEditId(editBinah);
	const optionsGevurah = cloneRealityJsonPortable(editBinah.options || {}, 'worldEdit.options');
	return replaceWorldGraphEditTarget(nodesOros, idYesod, (nodeKli) => ({
		...nodeKli,
		options: { ...nodeKli.options, ...optionsGevurah }
	}));
}

/**
 * @description Replaces one node seed value explicitly while preserving every unrelated semantic and expert field.
 * @param {ReadonlyArray<object>} nodesOros Canonical authored world nodes.
 * @param {object} editBinah Normalized `reseed` edit containing target `id` and optional portable `seed`.
 * @returns {ReadonlyArray<object>} Frozen authored node array containing the reseeded target node.
 * @throws {TypeError|RangeError} When target identity or reconstructed node data is invalid.
 */
export function reseedWorldGraphNode(nodesOros, editBinah) {
	const idYesod = requiredWorldGraphEditId(editBinah);
	return replaceWorldGraphEditTarget(nodesOros, idYesod, (nodeKli) => ({
		...nodeKli,
		seed: editBinah.seed ?? null
	}));
}

/**
 * @description Merges profile fields by default or replaces the profile only when `replace: true` is explicitly supplied.
 * @param {ReadonlyArray<object>} nodesOros Canonical authored world nodes.
 * @param {object} editBinah Normalized `setProfile` edit containing target `id`, portable `profile`, and optional `replace` flag.
 * @returns {ReadonlyArray<object>} Frozen authored node array containing the updated profile.
 * @throws {TypeError|RangeError} When target identity, profile portability, or reconstructed node data is invalid.
 */
export function setWorldGraphNodeProfile(nodesOros, editBinah) {
	const idYesod = requiredWorldGraphEditId(editBinah);
	const profileTiferes = cloneRealityJsonPortable(editBinah.profile || {}, 'worldEdit.profile');
	return replaceWorldGraphEditTarget(nodesOros, idYesod, (nodeKli) => ({
		...nodeKli,
		profile: editBinah.replace === true
			? profileTiferes
			: { ...nodeKli.profile, ...profileTiferes }
	}));
}

/**
 * @description Adds or removes one exact metadata tag while preserving all other metadata and tags; duplicate additions remain idempotent.
 * @param {ReadonlyArray<object>} nodesOros Canonical authored world nodes.
 * @param {object} editBinah Normalized `tag` or `untag` edit containing target `id` and non-empty `tag` text.
 * @returns {ReadonlyArray<object>} Frozen authored node array containing updated metadata tags.
 * @throws {TypeError|RangeError} When target identity, tag text, or reconstructed node data is invalid.
 */
export function updateWorldGraphNodeTag(nodesOros, editBinah) {
	const idYesod = requiredWorldGraphEditId(editBinah);
	const tagYesod = String(editBinah.tag ?? '').trim();
	if (!tagYesod) throw new TypeError('B"H | World tag edit requires non-empty `tag`.');
	return replaceWorldGraphEditTarget(nodesOros, idYesod, (nodeKli) => {
		const tagsNetzach = new Set(Array.isArray(nodeKli.metadata.tags) ? nodeKli.metadata.tags.map(String) : []);
		if (editBinah.op === 'tag') tagsNetzach.add(tagYesod);
		if (editBinah.op === 'untag') tagsNetzach.delete(tagYesod);
		return {
			...nodeKli,
			metadata: { ...nodeKli.metadata, tags: [...tagsNetzach] }
		};
	});
}
