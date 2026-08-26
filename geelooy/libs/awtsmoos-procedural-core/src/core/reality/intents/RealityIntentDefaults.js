// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RealityIntentDefaults.js
 * @description Separates canonical scene profile/seed from JSON-safe shared specialist options while recording expert defaults that cannot enter a serializable plan.
 * The Awtsmoos renews every hidden default before a world can inherit its finite measure;
 * Awtsmoos.com lets safe intent descend everywhere while runtime-only vessels remain disclosed instead of smuggled into serialized treasure.
 */
import { normalizeNatureProfile } from '../../natureApi/NatureApiProfiles.js';
import { cloneRealityIntentJson, freezeRealityIntentJson } from './RealityIntentJson.js';
import { normalizeRealityIntentRootSeed } from './RealityIntentSeed.js';

const PROFILE_KEYS = Object.freeze({
	quality: true,
	realism: true,
	seed: true
});

/**
 * Creates canonical root profile, root seed, shared options, and omitted-default evidence for one plan.
 * @param {object} realityYesod Fully composed Reality API owning constructor defaults.
 * @param {object} [optionsKeter={}] Strict JSON-safe plan/scene defaults overriding serializable Reality defaults.
 * @returns {Readonly<object>} Immutable defaults artifact consumed by planning.
 */
export function createRealityIntentDefaults(realityYesod, optionsKeter = {}) {
	const realityDefaults = collectSerializableRealityDefaults(realityYesod.defaults || {});
	const requestedDefaults = cloneRealityIntentJson(optionsKeter, 'plan.defaults');
	const profile = normalizeNatureProfile({
		quality: requestedDefaults.quality ?? realityYesod.defaults.quality ?? 'medium',
		realism: requestedDefaults.realism ?? realityYesod.defaults.realism ?? 'realistic'
	});
	const rootSeed = normalizeRealityIntentRootSeed(
		requestedDefaults.seed ?? realityYesod.defaults.seed ?? 613
	);
	const sharedOptions = Object.freeze({
		...realityDefaults.serializable,
		...withoutProfileKeys(requestedDefaults)
	});
	return freezeRealityIntentJson({
		omittedRealityDefaults: realityDefaults.omitted,
		profile,
		rootSeed,
		sharedOptions
	});
}

/**
 * Merges serializable scene defaults beneath node options and canonical profile/seed above both.
 * @param {object} defaultsBinah Root defaults artifact.
 * @param {object} nodeOptionsGevurah Canonical node-local options.
 * @param {object} profileTiferes Canonical node profile.
 * @param {number} seedYesod Canonical node seed.
 * @returns {Readonly<object>} Frozen effective specialist options.
 */
export function createRealityIntentNodeOptions(
	defaultsBinah,
	nodeOptionsGevurah,
	profileTiferes,
	seedYesod
) {
	return freezeRealityIntentJson({
		...defaultsBinah.sharedOptions,
		...withoutProfileKeys(nodeOptionsGevurah),
		quality: profileTiferes.quality,
		realism: profileTiferes.realism,
		seed: seedYesod
	});
}

function collectSerializableRealityDefaults(defaultsChesed) {
	const serializableKelim = {};
	const omittedGevurah = [];
	for (const [keyBinah, valueOhr] of Object.entries(defaultsChesed)) {
		if (PROFILE_KEYS[keyBinah]) continue;
		try {
			serializableKelim[keyBinah] = cloneRealityIntentJson(valueOhr, `reality.defaults.${keyBinah}`);
		} catch {
			omittedGevurah.push(keyBinah);
		}
	}
	return {
		omitted: Object.freeze(omittedGevurah.sort()),
		serializable: Object.freeze(serializableKelim)
	};
}

function withoutProfileKeys(inputKelim) {
	return Object.fromEntries(
		Object.entries(inputKelim).filter(([keyBinah]) => !PROFILE_KEYS[keyBinah])
	);
}
