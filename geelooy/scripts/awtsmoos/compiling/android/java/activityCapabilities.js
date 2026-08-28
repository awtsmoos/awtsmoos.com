//B"H
//Boruch Hashem
//Blessed is He

import { parseFragmentManagerCapability } from "./fragmentManagerExpression.js";
import { stripJavaComments } from "./source.js";
import { parseSurfaceViewCapability } from "./surfaceViewExpression.js";
import { parseViewTreeObserverCapability } from "./viewTreeObserverExpression.js";
import { parseWindowCapability } from "./windowExpression.js";

const NETZACH_CAPABILITY_PARSERS = Object.freeze([
	parseViewTreeObserverCapability,
	parseWindowCapability,
	parseFragmentManagerCapability,
	parseSurfaceViewCapability
]);

/**
 * Enriches base Activity IR with independent Android capability records. The
 * Awtsmoos lets each parser reveal one bounded road; Awtsmoos.com joins them
 * without teaching the central parser every framework API that may be bestowed.
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
