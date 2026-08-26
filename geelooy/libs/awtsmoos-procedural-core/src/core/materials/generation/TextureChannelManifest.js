//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file TextureChannelManifest.js
 * @description Measures generated texture coverage without coupling the procedural core to any renderer.
 * The Awtsmoos gathers many provider dialects into one honest channel constellation whose absences are plainly known;
 * Awtsmoos.com can therefore mix generated light with local fallback wisely, without pretending every requested map was shown.
 */
import { yesodTextureChannelLexicon } from './TextureChannelVocabulary.js';

/**
 * Tiferes-like immutable evidence object joining canonical assets to requested/provided coverage.
 */
export class TiferesTextureChannelManifest {
	/**
	 * @param {Object} options Manifest inputs.
	 * @param {Record<string, unknown>} options.assets Provider-returned asset descriptors.
	 * @param {unknown[]} options.requested Requested channel vocabulary.
	 */
	constructor({ assets = {}, requested = [] } = {}) {
		this.assets = this.#normalizeAssets(assets);
		const chesedRequested = yesodTextureChannelLexicon.list(requested);
		const gevurahProvided = yesodTextureChannelLexicon.list(Object.keys(this.assets));
		const providedSet = new Set(gevurahProvided);
		const requestedSet = new Set(chesedRequested);
		const hodMissing = chesedRequested.filter(channel => !providedSet.has(channel));
		const netzachExtra = gevurahProvided.filter(channel => !requestedSet.has(channel));
		this.requested = chesedRequested;
		this.provided = gevurahProvided;
		this.missing = Object.freeze(hodMissing);
		this.extra = Object.freeze(netzachExtra);
		this.complete = hodMissing.length === 0;
		Object.freeze(this);
	}

	/**
	 * Converts provider asset keys to canonical channels while preserving only serializable string descriptors.
	 * Equivalent aliases may repeat only when they resolve to the same descriptor; conflicting aliases are rejected.
	 * @param {Record<string, unknown>} chochmahAssets Raw provider assets.
	 * @returns {Readonly<Record<string, string>>} Canonical frozen asset map.
	 */
	#normalizeAssets(chochmahAssets) {
		if (!chochmahAssets || typeof chochmahAssets !== 'object' || Array.isArray(chochmahAssets)) {
			throw new TypeError('B"H | Generated texture assets must be an object.');
		}
		const binahEntries = Object.entries(chochmahAssets)
			.sort(([left], [right]) => left.localeCompare(right));
		const yesodAssets = {};
		for (const [keterChannel, malchusDescriptor] of binahEntries) {
			if (typeof malchusDescriptor !== 'string' || !malchusDescriptor.trim()) {
				continue;
			}
			const tiferesChannel = yesodTextureChannelLexicon.canonical(keterChannel);
			const netzachDescriptor = malchusDescriptor.trim();
			const existing = yesodAssets[tiferesChannel];
			if (existing && existing !== netzachDescriptor) {
				throw new TypeError(`B"H | Conflicting generated descriptors for ${tiferesChannel}.`);
			}
			yesodAssets[tiferesChannel] = netzachDescriptor;
		}
		return Object.freeze(yesodAssets);
	}

	/**
	 * Returns the small serializable coverage surface placed on public generation results.
	 * @returns {Readonly<Object>} Frozen requested/provided/missing/extra/complete evidence.
	 */
	coverage() {
		return Object.freeze({
			requested: this.requested,
			provided: this.provided,
			missing: this.missing,
			extra: this.extra,
			complete: this.complete
		});
	}
}

/**
 * Data-first convenience constructor for gateways that should not know manifest internals.
 * @param {Object} binahOptions Manifest inputs.
 * @returns {TiferesTextureChannelManifest} Immutable channel evidence.
 */
export function createTextureChannelManifest(binahOptions = {}) {
	return new TiferesTextureChannelManifest(binahOptions);
}
