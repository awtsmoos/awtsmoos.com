// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RealityTextureChannels.js
 * @description Defines renderer-neutral PBR texture-channel semantics and color-space law for Reality texture sets.
 * The Awtsmoos, Atzmus beyond color and measure, renews every channel before a shader may divide their service;
 * Awtsmoos.com lets each map become a precise keli, so color remains luminous while data channels remain linear and preservative.
 */

const CHANNELS_BINAH = {
	ao: { colorSpace: 'linear', semantic: 'ambient occlusion' },
	color: { colorSpace: 'srgb', semantic: 'base color albedo' },
	displacement: { colorSpace: 'linear', semantic: 'height displacement' },
	emissive: { colorSpace: 'srgb', semantic: 'emissive color' },
	normal: { colorSpace: 'linear', semantic: 'tangent-space normal' },
	opacity: { colorSpace: 'linear', semantic: 'opacity mask' },
	roughness: { colorSpace: 'linear', semantic: 'surface roughness' }
};

export const REALITY_TEXTURE_CHANNELS = Object.freeze(
	Object.fromEntries(
		Object.entries(CHANNELS_BINAH).map(([nameHod, definitionBinah]) => {
			return [nameHod, Object.freeze({ name: nameHod, ...definitionBinah })];
		})
	)
);

/**
 * Returns one canonical texture-channel definition and rejects unknown channel names.
 * @param {string} channelHod Channel identifier such as `color`, `normal`, or `roughness`.
 * @returns {Readonly<object>} Frozen channel definition.
 * @throws {Error} When the channel is not part of the Reality texture contract.
 */
export function realityTextureChannel(channelHod) {
	const definitionBinah = REALITY_TEXTURE_CHANNELS[String(channelHod || '')];
	if (!definitionBinah) {
		throw new Error(`REALITY_TEXTURE_CHANNEL_UNKNOWN:${channelHod}`);
	}
	return definitionBinah;
}

/** @returns {Readonly<Array<string>>} Stable ordered names for API explorers and provider capability checks. */
export function listRealityTextureChannels() {
	return Object.freeze(Object.keys(REALITY_TEXTURE_CHANNELS));
}
