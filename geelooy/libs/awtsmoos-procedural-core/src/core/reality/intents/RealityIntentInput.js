// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RealityIntentInput.js
 * @description Expands arrays and exact scene-preset shorthand into ordinary intent records before normalization begins.
 * The Awtsmoos renews the many within the one before a planner can count their finite vessels;
 * Awtsmoos.com keeps expansion transparent and finite so a phrase becomes inspectable data, never hidden inference among the levels.
 */
import { cloneRealityIntentJson } from './RealityIntentJson.js';
import { resolveRealityIntentToken } from './RealityIntentAliases.js';
import { resolveRealityIntentPreset } from './RealityIntentPresets.js';

/**
 * Expands supported top-level input forms into a flat detached list of ordinary JSON-safe intents.
 * @param {unknown} inputOhr String, object, or nested array of Reality intents.
 * @returns {Array<unknown>} Flat detached intent list ready for one-node normalization.
 */
export function expandRealityIntentInput(inputOhr) {
	if (Array.isArray(inputOhr)) {
		return inputOhr.flatMap((childOhr) => expandRealityIntentInput(childOhr));
	}
	if (typeof inputOhr === 'string') {
		const resolvedBinah = resolveRealityIntentToken(inputOhr);
		if (resolvedBinah.scenePreset) {
			return resolveRealityIntentPreset(resolvedBinah.scenePreset);
		}
		return [resolvedBinah.kind];
	}
	if (isPresetRequest(inputOhr)) {
		return expandPresetRequest(inputOhr);
	}
	return [cloneRealityIntentJson(inputOhr, 'intent')];
}

function isPresetRequest(inputOhr) {
	return Boolean(
		inputOhr
		&& typeof inputOhr === 'object'
		&& !Array.isArray(inputOhr)
		&& typeof inputOhr.scenePreset === 'string'
	);
}

function expandPresetRequest(inputOhr) {
	const presetOros = resolveRealityIntentPreset(inputOhr.scenePreset);
	const overridesGevurah = inputOhr.overrides || {};
	return presetOros.map((intentOhr) => {
		return {
			...intentOhr,
			...cloneRealityIntentJson(overridesGevurah, 'intent.overrides')
		};
	});
}
