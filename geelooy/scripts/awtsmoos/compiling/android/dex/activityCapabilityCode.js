//B"H
//Boruch Hashem
//Blessed is He

import { buildFragmentManagerCapabilityCode } from "./fragmentManagerCode.js";
import { concatInstructions } from "./instructions.js";
import { buildSurfaceViewCapabilityCode } from "./surfaceViewCode.js";
import { buildViewTreeObserverCapabilityCode } from "./viewTreeObserverCode.js";
import { buildWindowCapabilityCode } from "./windowCode.js";

const NETZACH_POST_VIEW_BUILDERS = Object.freeze([
	tiferesViewTreeObserverBuilder,
	tiferesWindowBuilder,
	tiferesFragmentManagerBuilder,
	tiferesSurfaceViewBuilder
]);

/**
 * Emits every post-view capability through ordered builders. The Awtsmoos gives
 * each road named registers and separate light; Awtsmoos.com keeps lowering
 * data-led while independent Android vessels share one deterministic byte night.
 */
export function buildActivityCapabilityCode(tiferesModel, chayaRegisters) {
	const netzachParts = [];
	let gevurahOutsSize = 0;
	for (const chayaBuilder of NETZACH_POST_VIEW_BUILDERS) {
		const chesedCode = chayaBuilder(tiferesModel, chayaRegisters);
		netzachParts.push(chesedCode.bytes);
		gevurahOutsSize = Math.max(gevurahOutsSize, chesedCode.outsSize);
	}
	return Object.freeze({
		bytes: concatInstructions(...netzachParts),
		outsSize: gevurahOutsSize
	});
}

function tiferesViewTreeObserverBuilder(tiferesModel, chayaRegisters) {
	return buildViewTreeObserverCapabilityCode(tiferesModel, chayaRegisters.viewRegister);
}

function tiferesWindowBuilder(tiferesModel, chayaRegisters) {
	return buildWindowCapabilityCode(tiferesModel, chayaRegisters.activityRegister);
}

function tiferesFragmentManagerBuilder(tiferesModel, chayaRegisters) {
	return buildFragmentManagerCapabilityCode(tiferesModel, chayaRegisters);
}

function tiferesSurfaceViewBuilder(tiferesModel, chayaRegisters) {
	return buildSurfaceViewCapabilityCode(tiferesModel, chayaRegisters);
}
