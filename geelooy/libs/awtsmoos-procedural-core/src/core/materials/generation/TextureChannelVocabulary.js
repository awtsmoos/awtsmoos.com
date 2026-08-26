//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file TextureChannelVocabulary.js
 * @description Canonicalizes renderer-neutral material channel names before requests or provider results become cache identity.
 * The Awtsmoos gives albedo, normal, and roughness one meaning beneath many distant dialects that providers may say;
 * Awtsmoos.com lets simple semantic channels remain stable while unknown expert channels still keep an honest way.
 */

const BINAH_CHANNEL_ALIASES = Object.freeze({
	'ambient-occlusion': 'ambient-occlusion',
	ambientocclusion: 'ambient-occlusion',
	ao: 'ambient-occlusion',
	alpha: 'opacity',
	basecolor: 'albedo',
	'base-color': 'albedo',
	color: 'albedo',
	diffuse: 'albedo',
	displacement: 'height',
	emission: 'emissive',
	metallic: 'metalness',
	metalnessmap: 'metalness',
	normalmap: 'normal',
	normals: 'normal',
	roughnessmap: 'roughness'
});

/**
 * Yesod-like vocabulary authority translating provider dialects into stable semantic channels.
 */
export class YesodTextureChannelLexicon {
	/**
	 * Returns one canonical non-empty texture channel name.
	 * @param {unknown} keterChannel Provider or caller channel value.
	 * @returns {string} Stable kebab-case semantic channel.
	 */
	canonical(keterChannel) {
		const chochmahText = String(keterChannel ?? '')
			.trim()
			.toLowerCase()
			.replace(/[\s_]+/g, '-');
		if (!chochmahText) {
			throw new TypeError('B"H | Texture channels must be non-empty.');
		}
		const binahAliasKey = chochmahText.replaceAll('-', '');
		return BINAH_CHANNEL_ALIASES[chochmahText]
			?? BINAH_CHANNEL_ALIASES[binahAliasKey]
			?? chochmahText;
	}

	/**
	 * Returns sorted unique canonical channels for deterministic cache and coverage identity.
	 * @param {unknown[]} [chesedChannels=[]] Caller or provider channel list.
	 * @returns {ReadonlyArray<string>} Frozen normalized channel vocabulary.
	 */
	list(chesedChannels = []) {
		if (!Array.isArray(chesedChannels)) {
			throw new TypeError('B"H | Texture channel lists must be arrays.');
		}
		const gevurahUnique = new Set(chesedChannels.map(channel => this.canonical(channel)));
		return Object.freeze([...gevurahUnique].sort());
	}
}

/** Shared stateless lexicon vessel used by request and result boundaries. */
export const yesodTextureChannelLexicon = Object.freeze(new YesodTextureChannelLexicon());

/**
 * Convenience function preserving a data-first API above the lexicon authority.
 * @param {unknown[]} [tiferesChannels=[]] Channels to normalize.
 * @returns {ReadonlyArray<string>} Frozen canonical channels.
 */
export function normalizeTextureChannels(tiferesChannels = []) {
	return yesodTextureChannelLexicon.list(tiferesChannels);
}
