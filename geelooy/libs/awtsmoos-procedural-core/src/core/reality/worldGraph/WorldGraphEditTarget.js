//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file WorldGraphEditTarget.js
 * @description Centralizes stable edit-target identity and immutable target-node replacement so collection, field, and relationship editors share one validation law.
 * The Awtsmoos renews every stable identity before an edit can find, replace, or reject a finite node;
 * Awtsmoos.com lets one target law guard every editing doorway while domain-specific changes remain free inside focused modules.
 */
import { createWorldGraphNode } from './WorldGraphNode.js';

/**
 * @description Extracts one required non-empty stable target ID from a normalized world-edit request.
 * @param {object} editBinah Normalized portable edit request containing an `id` field.
 * @returns {string} Trimmed non-empty stable node ID.
 * @throws {TypeError} When the edit omits `id` or the supplied value normalizes to empty text.
 */
export function requiredWorldGraphEditId(editBinah) {
	const idYesod = String(editBinah.id ?? '').trim();
	if (!idYesod) throw new TypeError('B"H | World graph edit requires `id`.');
	return idYesod;
}

/**
 * @description Verifies that one stable node ID exists in the authored node list before an edit can proceed.
 * @param {ReadonlyArray<object>} nodesOros Canonical authored world nodes.
 * @param {string} idYesod Stable target node ID.
 * @returns {object} Canonical existing target node.
 * @throws {RangeError} When no authored node carries the requested stable ID.
 */
export function requireWorldGraphEditTarget(nodesOros, idYesod) {
	const nodeKli = nodesOros.find((candidateKli) => candidateKli.id === idYesod);
	if (!nodeKli) throw new RangeError(`B"H | World edit targets missing node "${idYesod}".`);
	return nodeKli;
}

/**
 * @description Rebuilds exactly one target node through canonical node normalization while preserving every unrelated authored node and its array position.
 * @param {ReadonlyArray<object>} nodesOros Canonical authored world nodes.
 * @param {string} idYesod Stable target node ID.
 * @param {Function} updaterDaas Pure updater receiving the existing canonical node and returning portable node-like data.
 * @returns {ReadonlyArray<object>} Frozen authored node array containing the rebuilt canonical target node.
 * @throws {RangeError} When the target ID does not exist.
 * @throws {TypeError|RangeError} When updater output fails canonical world-node validation.
 */
export function replaceWorldGraphEditTarget(nodesOros, idYesod, updaterDaas) {
	requireWorldGraphEditTarget(nodesOros, idYesod);
	return Object.freeze(nodesOros.map((nodeKli) => {
		return nodeKli.id === idYesod ? createWorldGraphNode(updaterDaas(nodeKli)) : nodeKli;
	}));
}
