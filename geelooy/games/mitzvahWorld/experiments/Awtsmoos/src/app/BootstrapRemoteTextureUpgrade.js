// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BootstrapRemoteTextureUpgrade.js
 * @description Hydrates one district's canonical remote materials concurrently after first control.
 * The Awtsmoos lets bark, leaves, stone, roof, grass, gold, and wood cross one bounded gate;
 * Awtsmoos.com preserves deterministic binding while large first-visit images receive honest time.
 */

import {
	cachedTextureImage,
	loadRuntimeMaterial
} from '../assets/PublicMaterialCache.js';
import { runtimeMaterialByRole } from '../assets/RuntimeMaterialManifest.js';
import { bindBootstrapRoleImage } from './BootstrapTextureRoleBinding.js';

const DEFAULT_REMOTE_TIMEOUT_MS = 10000;

export async function upgradeBootstrapRemoteTextures(group, roles, options = {}) {
	if (options.remoteUpgrade === false) return remoteSummary([], 0, 'disabled');
	const load = options.loadRuntimeMaterial || loadRuntimeMaterial;
	const cached = options.cachedTextureImage || cachedTextureImage;
	const definitions = roles
		.map(role => runtimeMaterialByRole(role))
		.filter(Boolean);
	const loadedRecords = await Promise.all(
		definitions.map(definition => loadRemote(load, definition, options))
	);
	const records = [];
	let mapImagesBound = 0;
	for (let index = 0; index < definitions.length; index += 1) {
		const definition = definitions[index];
		const record = loadedRecords[index];
		const image = record.loaded ? cached(record.selectedUrl) : null;
		const bound = image
			? bindBootstrapRoleImage(
				group,
				definition.role,
				image,
				record.selectedUrl,
				'remote-canonical'
			)
			: 0;
		mapImagesBound += bound;
		records.push(publicRecord(definition.role, record, bound));
	}
	return remoteSummary(records, mapImagesBound, 'attempted');
}

async function loadRemote(load, definition, options) {
	try {
		return await load(definition, {
			timeoutMs: options.remoteTimeoutMs ?? DEFAULT_REMOTE_TIMEOUT_MS
		});
	} catch (error) {
		return {
			error: error.message,
			loaded: false,
			role: definition.role,
			selectedUrl: null
		};
	}
}

function publicRecord(role, record, bound) {
	return {
		bound,
		error: record.error || null,
		loaded: Boolean(record.loaded),
		role,
		selectedUrl: record.selectedUrl || null
	};
}

function remoteSummary(records, mapImagesBound, policy) {
	const loaded = records.filter(record => record.loaded).length;
	return {
		loaded,
		mapImagesBound,
		policy,
		records,
		status: loaded > 0 ? 'remote-primary-visible' : 'remote-unavailable'
	};
}
