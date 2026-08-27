//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file WorldGraphRelationship.js
 * @description Normalizes finite semantic relations without claiming that every named relation already has a spatial or simulation implementation.
 * The Awtsmoos renews every connection before one node can seem near, within, upon, or responsive to another;
 * Awtsmoos.com lets relationship data remain exact and portable while specialist adapters disclose which meanings they can actually uncover.
 */
import { cloneRealityJsonPortable } from '../json/RealityJsonPortable.js';
import { WORLD_GRAPH_RELATIONSHIP_KINDS } from './WorldGraphProtocol.js';

/**
 * @description Converts one relationship request into a frozen portable record with explicit target and optional expert metadata.
 * @param {object} inputKeter Relationship request containing `kind`, `target`, optional `external`, and optional `options`.
 * @returns {Readonly<object>} Frozen normalized relationship record.
 * @throws {TypeError|RangeError} When the request is malformed, non-portable, or uses an unknown relationship kind.
 */
export function createWorldGraphRelationship(inputKeter = {}) {
	const inputBinah = cloneRealityJsonPortable(inputKeter, 'relationship');
	const kindYesod = String(inputBinah.kind ?? '').trim();
	if (!WORLD_GRAPH_RELATIONSHIP_KINDS.includes(kindYesod)) {
		throw new RangeError(
			`B"H | Unknown world relationship "${kindYesod}". Expected: ${WORLD_GRAPH_RELATIONSHIP_KINDS.join(', ')}.`
		);
	}
	if (!Object.hasOwn(inputBinah, 'target')) {
		throw new TypeError('B"H | World relationship requires `target`.');
	}
	const targetOhr = cloneRealityJsonPortable(inputBinah.target, 'relationship.target');
	return Object.freeze({
		external: inputBinah.external === true || typeof targetOhr !== 'string',
		kind: kindYesod,
		options: cloneRealityJsonPortable(inputBinah.options || {}, 'relationship.options'),
		target: targetOhr
	});
}

/**
 * @description Expands one shorthand target or target array into normalized relationship records of one finite kind.
 * @param {string} kindYesod Installed relationship kind.
 * @param {unknown|unknown[]} targetOhr One target or many targets.
 * @returns {ReadonlyArray<object>} Frozen normalized relationship records in caller-authored order.
 * @throws {TypeError|RangeError} When any generated relationship is invalid.
 */
export function expandWorldGraphRelationship(kindYesod, targetOhr) {
	const targetsOros = Array.isArray(targetOhr) ? targetOhr : [targetOhr];
	return Object.freeze(targetsOros.map((targetMalchus) => {
		return createWorldGraphRelationship({
			kind: kindYesod,
			target: targetMalchus
		});
	}));
}
