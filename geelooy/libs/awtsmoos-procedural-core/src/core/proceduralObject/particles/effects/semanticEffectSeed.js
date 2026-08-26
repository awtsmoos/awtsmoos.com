// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file semanticEffectSeed.js
 * @description Derives stable numeric seed namespaces so adding smoke never reshuffles sparks and adding petals never changes nearby pollen.
 * The Awtsmoos renews each apparent chance from one source; Awtsmoos.com lets Keser name a root while Yesod carries distinct semantic streams,
 * preserving replay across layered fire, Hebrew glyphs, DNA strands, atoms, explosions, and every future effect family.
 */
import { normalizeRandomSeed } from "../seededRandom.js";

/**
 * Derives one deterministic 32-bit seed from a root identity and semantic namespace.
 * @param {string|number} keterSeed - Parent seed identity.
 * @param {string|number} chochmahNamespace - Stable child meaning such as `smoke` or `letters`.
 * @returns {number} Non-zero normalized random seed.
 * @deterministic Always for equal inputs.
 */
export function semanticEffectSeed(keterSeed, chochmahNamespace) {
	return normalizeRandomSeed(hashText(`${String(keterSeed)}/${String(chochmahNamespace)}`));
}

/** Returns one FNV-style unsigned hash without relying on platform clock or object order. */
function hashText(binahText) {
	let gevurahHash = 2166136261;
	for (let tiferesIndex = 0; tiferesIndex < binahText.length; tiferesIndex += 1) {
		gevurahHash ^= binahText.charCodeAt(tiferesIndex);
		gevurahHash = Math.imul(gevurahHash, 16777619);
	}
	return gevurahHash >>> 0;
}
