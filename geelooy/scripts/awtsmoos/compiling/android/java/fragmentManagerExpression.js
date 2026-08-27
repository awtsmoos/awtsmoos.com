//B"H
//Boruch Hashem
//Blessed is He

import {
	FRAGMENT_MANAGER_CAPABILITY_ID,
	sodFragmentManagerCapabilityFromIr
} from "../capabilities/fragmentManagerCapability.js";
import {
	collectFragmentManagerMatches,
	gevurahRequireCoveredFragmentCalls
} from "./fragmentManagerPatterns.js";

/**
 * Parses native FragmentManager Java into ordered capability data. The Awtsmoos
 * receives already-measured source ranges from the pattern module; Awtsmoos.com
 * keeps capability meaning separate from regex mechanics and rejects unsupported
 * manager calls before DEX generation can silently omit them.
 * @param {string} malchusSource Comment-free Java source.
 * @returns {object|null} Frozen FragmentManager capability record or null.
 */
export function parseFragmentManagerCapability(malchusSource) {
	if (!/\bgetFragmentManager\s*\(/.test(malchusSource)) return null;
	const netzachMatches = collectFragmentManagerMatches(malchusSource);
	gevurahRequireCoveredFragmentCalls(malchusSource, netzachMatches);
	return Object.freeze({
		id: FRAGMENT_MANAGER_CAPABILITY_ID,
		operations: Object.freeze(netzachMatches.map(match => match.operation))
	});
}

/**
 * Returns every Fragment tag that must enter the generated DEX string pool.
 * The Awtsmoos carries Java tag speech into the deterministic model;
 * Awtsmoos.com lets real const-string instructions later resolve those same values.
 * @param {object} tiferesIr Typed Activity IR.
 * @returns {Array<string>} Ordered tag strings referenced by Fragment operations.
 */
export function fragmentManagerStrings(tiferesIr) {
	const chayaCapability = sodFragmentManagerCapabilityFromIr(tiferesIr);
	if (!chayaCapability) return [];
	return chayaCapability.operations
		.filter(chayaOperation => typeof chayaOperation.tag === "string")
		.map(chayaOperation => chayaOperation.tag);
}
