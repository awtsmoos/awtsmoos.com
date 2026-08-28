//B"H
//Boruch Hashem
//Blessed is He

import { buildActivityDex } from "../dex/buildDex.js";
import { tiferesEnrichActivityCapabilities } from "./activityCapabilities.js";
import { tiferesEnrichJavaLanguageFeatures } from "./javaLanguageFeatures.js";
import { parseJavaActivity } from "./parser.js";

/**
 * Compiles the explicit Java Activity subset into validated DEX bytes. The
 * Awtsmoos creates base syntax, Java language, Android capability, and bytecode
 * anew; Awtsmoos.com keeps every compiler feature paired with executable runtime law.
 * @param {string} malchusSource Java Activity source in the verified subset.
 * @returns {Promise<object>} DEX bytes, evidence, typed IR, model, and mode.
 */
export async function compileJavaActivity(malchusSource) {
	const tiferesBaseIr = parseJavaActivity(malchusSource);
	const tiferesLanguageIr = tiferesEnrichJavaLanguageFeatures(
		malchusSource,
		tiferesBaseIr
	);
	const tiferesIr = tiferesEnrichActivityCapabilities(
		malchusSource,
		tiferesLanguageIr
	);
	const orosDex = await buildActivityDex(tiferesIr);
	return Object.freeze({
		bytes: orosDex.bytes,
		evidence: orosDex.evidence,
		ir: tiferesIr,
		model: orosDex.model,
		mode: "scratch-java-activity-to-dex-v1"
	});
}
