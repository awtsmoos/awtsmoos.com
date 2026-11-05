// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowWaterSources.js
 * @description Hydrates real hosted river color, detail, earth bank, and stone bed without repo-local image dependencies.
 * The Awtsmoos carries visible water through real published pixels while motion is renewed in memory;
 * Awtsmoos.com keeps every durable source reproducible, every fallback named, and every finite current free.
 */

import { remoteFullResolutionTextureUrl } from '../assets/RemoteTextureCatalog.js';
import { loadPublicMaterialUrl } from '../assets/PublicMaterialCache.js';
import {
	createMinimalMeadowWaterFallbackSources
} from './MinimalMeadowWaterFallbackSources.js';

const REMOTE_WATER_TIMEOUT_MS = 45000;

export const MINIMAL_MEADOW_WATER_URLS = Object.freeze({
	bank: remoteFullResolutionTextureUrl('dirt grass 3.png'),
	bed: remoteFullResolutionTextureUrl('bluestone 1.png'),
	color: remoteFullResolutionTextureUrl('shallow river water.png'),
	detail: remoteFullResolutionTextureUrl('seamless water.png')
});

export { createMinimalMeadowWaterFallbackSources };

/**
 * Loads each real visible water material independently while retaining runtime flow normals.
 * @param {object} environment Browser-like environment used to create bounded fallbacks.
 * @returns {Promise<object>} Hydrated source images, readiness counts, and provenance.
 */
export async function loadMinimalMeadowWaterSources(environment = globalThis) {
	const fallback = createMinimalMeadowWaterFallbackSources(
		environment,
		MINIMAL_MEADOW_WATER_URLS
	);
	const entries = Object.entries(MINIMAL_MEADOW_WATER_URLS);
	const records = await Promise.all(entries.map(([, url]) => {
		return loadPublicMaterialUrl(url, REMOTE_WATER_TIMEOUT_MS);
	}));
	const loaded = Object.fromEntries(entries.map(([name], index) => {
		return [name, records[index]];
	}));
	const hostedColorReady = Number(loaded.color.ok)
		+ Number(loaded.detail.ok);
	return {
		...fallback,
		bank: loaded.bank.ok ? loaded.bank.image : fallback.bank,
		bankMode: loaded.bank.ok
			? 'published-earth-bank'
			: fallback.bankMode,
		bed: loaded.bed.ok ? loaded.bed.image : fallback.bed,
		bedMode: loaded.bed.ok
			? 'uploaded-bluestone-bed'
			: fallback.bedMode,
		color: loaded.color.ok ? loaded.color.image : fallback.color,
		colorMode: loaded.color.ok
			? 'uploaded-shallow-river-color'
			: fallback.colorMode,
		detail: loaded.detail.ok ? loaded.detail.image : fallback.detail,
		hostedColorReady,
		hostedSurfaceReady: hostedColorReady
			+ Number(loaded.bank.ok)
			+ Number(loaded.bed.ok),
		records,
		timeoutPolicy: Object.freeze({
			remoteWaterMilliseconds: REMOTE_WATER_TIMEOUT_MS
		})
	};
}

/**
 * Exposes the hosted-image decode windows for diagnostics and tests.
 * @returns {Readonly<object>} Timeout milliseconds keyed by visible source role.
 */
export function minimalMeadowWaterSourceTimeouts() {
	const records = Object.keys(MINIMAL_MEADOW_WATER_URLS).map(name => {
		return [name, REMOTE_WATER_TIMEOUT_MS];
	});
	return Object.freeze(Object.fromEntries(records));
}
