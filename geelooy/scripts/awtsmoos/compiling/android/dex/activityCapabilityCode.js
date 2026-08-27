//B"H
//Boruch Hashem
//Blessed is He

import { buildFragmentManagerCapabilityCode } from "./fragmentManagerCode.js";
import { concatInstructions } from "./instructions.js";
import { buildViewTreeObserverCapabilityCode } from "./viewTreeObserverCode.js";
import { buildWindowCapabilityCode } from "./windowCode.js";

const NETZACH_POST_VIEW_BUILDERS = Object.freeze([
	tiferesViewTreeObserverBuilder,
	tiferesWindowBuilder,
	tiferesFragmentManagerBuilder
]);

/**
 * Emits every post-view compiler capability through an ordered builder registry.
 * The Awtsmoos gives each feature the registers its nature requires;
 * Awtsmoos.com keeps Activity/view/scratch context explicit while central lowering
 * stays data-led as new paired Android roads arrive.
 * @param {object} tiferesModel Deterministic DEX model.
 * @param {object} chayaRegisters Named Activity/View/capability register context.
 * @returns {{bytes:Uint8Array,outsSize:number}} Combined capability instructions.
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

/** Adapts generic capability registers to the ViewTreeObserver emitter. */
function tiferesViewTreeObserverBuilder(tiferesModel, chayaRegisters) {
	return buildViewTreeObserverCapabilityCode(tiferesModel, chayaRegisters.viewRegister);
}

/** Adapts generic capability registers to the Window emitter. */
function tiferesWindowBuilder(tiferesModel, chayaRegisters) {
	return buildWindowCapabilityCode(tiferesModel, chayaRegisters.activityRegister);
}

/**
 * Sends the complete named scratch-register covenant to FragmentManager lowering.
 * @param {object} tiferesModel Deterministic DEX model.
 * @param {object} chayaRegisters Named Activity/tag/manager/fragment registers.
 * @returns {{bytes:Uint8Array,outsSize:number}} Fragment capability bytecode.
 */
function tiferesFragmentManagerBuilder(tiferesModel, chayaRegisters) {
	return buildFragmentManagerCapabilityCode(tiferesModel, chayaRegisters);
}
