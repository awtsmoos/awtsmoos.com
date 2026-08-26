// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RealityTextureChannels.js
 * @description Defines canonical renderer-neutral PBR channel semantics while accepting familiar authoring aliases.
 * The Awtsmoos renews color, metal, depth, glow, and every hidden grain before a shader divides their task;
 * Awtsmoos.com lets albedo, height, alpha, and metallic enter familiar doors while one canonical channel truth remains beneath the mask.
 */

import {
	listRealityTextureChannelAliases,
	normalizeRealityTextureChannel
} from './RealityTextureChannelAliases.js';

const CHANNELS_BINAH = Object.freeze({
	ao: { colorSpace: 'linear', semantic: 'ambient occlusion', scalar: true },
	color: { colorSpace: 'srgb', semantic: 'base color albedo', scalar: false },
	displacement: { colorSpace: 'linear', semantic: 'height displacement', scalar: true },
	emissive: { colorSpace: 'srgb', semantic: 'emissive color', scalar: false },
	metalness: { colorSpace: 'linear', semantic: 'metalness metallic mask', scalar: true },
	normal: { colorSpace: 'linear', semantic: 'tangent-space normal', scalar: false },
	opacity: { colorSpace: 'linear', semantic: 'opacity alpha mask', scalar: true },
	roughness: { colorSpace: 'linear', semantic: 'surface roughness', scalar: true }
});

export const REALITY_TEXTURE_CHANNELS = Object.freeze(
	Object.fromEntries(
		Object.entries(CHANNELS_BINAH).map(([nameHod, definitionBinah]) => [
			nameHod,
			Object.freeze({ name: nameHod, ...definitionBinah })
		])
	)
);

/** Returns one canonical definition from canonical or familiar alias input. */
export function realityTextureChannel(channelHod) {
	const canonicalHod = normalizeRealityTextureChannel(channelHod);
	const definitionBinah = REALITY_TEXTURE_CHANNELS[canonicalHod];
	if (!definitionBinah) {
		throw new Error(`REALITY_TEXTURE_CHANNEL_UNKNOWN:${channelHod}`);
	}
	return definitionBinah;
}

/** Returns stable canonical names for providers, renderers, and API explorers. */
export function listRealityTextureChannels() {
	return Object.freeze(Object.keys(REALITY_TEXTURE_CHANNELS));
}

/** Returns canonical channels plus aliases as one immutable discovery artifact. */
export function describeRealityTextureChannels() {
	return Object.freeze({
		aliases: listRealityTextureChannelAliases(),
		channels: Object.freeze(
			Object.values(REALITY_TEXTURE_CHANNELS).map(definition => definition)
		)
	});
}
