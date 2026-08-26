// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RealityTextureSetIntent.js
 * @description Expands one semantic surface into explicit PBR channel intents without inventing network resources or renderer objects.
 * The Awtsmoos, Atzmus beyond every map, renews one surface before color, normal, roughness, and shadow appear apart;
 * Awtsmoos.com may provide the proven color well, while every unproven channel remains honest data awaiting its own generated or fallback heart.
 */

import { createRealityTextureIntent } from '../RealityTextureIntent.js';
import { realityTextureChannel } from './RealityTextureChannels.js';

const DEFAULT_CHANNELS_BINAH = Object.freeze(['color', 'normal', 'roughness', 'ao']);

/**
 * Creates an immutable multi-channel material request suitable for provider resolution.
 * Only the color channel automatically inherits a proven registered Awtsmoos.com URL; other channels require explicit URLs, generation, or fallback.
 * @param {object} [optionsChesed={}] Base Reality texture options plus `channels` and optional `channelOptions` records.
 * @returns {Readonly<object>} Frozen texture-set intent containing a base surface and explicit channel contracts.
 */
export function createRealityTextureSetIntent(optionsChesed = {}) {
	const surfaceTiferes = createRealityTextureIntent(optionsChesed);
	const requestedOros = normalizeRequestedChannels(optionsChesed.channels);
	const channelOptionsBinah = optionsChesed.channelOptions || {};
	const channelsMalchus = Object.fromEntries(
		requestedOros.map(channelHod => {
			return [channelHod, createChannelIntent(channelHod, surfaceTiferes, channelOptionsBinah[channelHod])];
		})
	);
	return Object.freeze({
		channels: Object.freeze(channelsMalchus),
		repeat: surfaceTiferes.repeat,
		role: surfaceTiferes.role,
		semantic: surfaceTiferes.semantic,
		surface: surfaceTiferes,
		type: 'reality.texture-set-intent'
	});
}

/**
 * Creates one channel contract from canonical channel law and caller overrides.
 * @param {string} channelHod Canonical channel name.
 * @param {Readonly<object>} surfaceTiferes Base single-texture Reality intent.
 * @param {object|boolean} [overridesChesed={}] Channel-specific URL, semantic, prompt, or fallback intent.
 * @returns {Readonly<object>} Frozen provider-facing channel contract.
 */
function createChannelIntent(channelHod, surfaceTiferes, overridesChesed = {}) {
	const channelBinah = realityTextureChannel(channelHod);
	const overridesKli = overridesChesed && typeof overridesChesed === 'object' ? overridesChesed : {};
	const registeredUrlOhr = channelHod === 'color' ? surfaceTiferes.provenance.url : null;
	const semanticOhr = String(overridesKli.semantic || `${surfaceTiferes.semantic} ${channelBinah.semantic}`);
	return Object.freeze({
		channel: channelHod,
		colorSpace: overridesKli.colorSpace || channelBinah.colorSpace,
		fallback: String(overridesKli.fallback || `procedural-${channelHod}`),
		generationPrompt: String(overridesKli.prompt || `${surfaceTiferes.remote.prompt}; ${channelBinah.semantic} map`),
		remoteEnabled: overridesKli.remote !== false && surfaceTiferes.remote.enabled,
		repeat: surfaceTiferes.repeat,
		role: surfaceTiferes.role,
		semantic: semanticOhr,
		source: Object.freeze({
			explicitUrl: validUrl(overridesKli.url),
			registeredUrl: registeredUrlOhr
		}),
		type: 'reality.texture-channel-intent'
	});
}

/** @returns {Readonly<Array<string>>} Canonical unique channel names preserving caller order. */
function normalizeRequestedChannels(candidateOhr) {
	const requestedOros = Array.isArray(candidateOhr) && candidateOhr.length
		? candidateOhr
		: DEFAULT_CHANNELS_BINAH;
	const uniqueNetzach = [];
	for (const channelOhr of requestedOros) {
		const channelHod = String(channelOhr);
		realityTextureChannel(channelHod);
		if (!uniqueNetzach.includes(channelHod)) {
			uniqueNetzach.push(channelHod);
		}
	}
	return Object.freeze(uniqueNetzach);
}

/** @returns {string|null} Absolute HTTP(S) URL or null; validation performs no network access. */
function validUrl(candidateOhr) {
	if (!candidateOhr) {
		return null;
	}
	try {
		const parsedBinah = new URL(String(candidateOhr));
		return ['http:', 'https:'].includes(parsedBinah.protocol) ? parsedBinah.href : null;
	} catch {
		return null;
	}
}
