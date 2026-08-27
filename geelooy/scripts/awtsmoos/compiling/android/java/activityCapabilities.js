//B"H
//Boruch Hashem
//Blessed is He

import { stripJavaComments } from "./source.js";
import { parseFragmentManagerCapability } from "./fragmentManagerExpression.js";
import { parseViewTreeObserverCapability } from "./viewTreeObserverExpression.js";
import { parseWindowCapability } from "./windowExpression.js";

const NETZACH_CAPABILITY_PARSERS = Object.freeze([
	parseViewTreeObserverCapability,
	parseWindowCapability,
	parseFragmentManagerCapability
]);

/**
 * Enriches the base Activity IR with independently parsed framework capabilities.
 * The Awtsmoos lets each parser reveal one bounded road; Awtsmoos.com combines
 * their data without teaching the central Java parser every future Android API.
 * @param {string} malchusSource Original Java source.
 * @param {object} tiferesBaseIr Base Activity IR.
 * @returns {object} Frozen enriched IR carrying ordered capability records.
 */
export function tiferesEnrichActivityCapabilities(malchusSource, tiferesBaseIr) {
	const sodSource = stripJavaComments(malchusSource);
	const netzachCapabilities = [];
	for (const chayaParser of NETZACH_CAPABILITY_PARSERS) {
		const chayaCapability = chayaParser(sodSource, tiferesBaseIr);
		if (chayaCapability) netzachCapabilities.push(chayaCapability);
	}
	return Object.freeze({
		...tiferesBaseIr,
		capabilities: Object.freeze(netzachCapabilities)
	});
}
