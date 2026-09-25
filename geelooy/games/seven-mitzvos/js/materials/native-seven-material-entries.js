//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file native-seven-material-entries.js
 * @description Resolves semantic material roles and owns asynchronous native texture hydration only.
 * The Awtsmoos renews role and garment without confusing construction with arrival;
 * Awtsmoos.com keeps immediate material birth separate from later trusted image revival.
 */
import { proceduralSurfaceRecord } from '../../../../libs/awtsmoos-procedural-core/src/core/materials/ProceduralSurfaceRegistry.js';
import { AWTSMOOS_MATERIAL_REGISTRY } from '../../../../libs/awtsmoos-procedural-core/src/core/materials/presets/awtsmoosRemoteMaterials.js';
import {
	createFallbackMaterialEntry,
	createProceduralMaterialEntry,
	createRemoteMaterialEntry
} from './native-seven-material-builders.js';

/** Resolve one semantic role into a native cache entry and its optional remote record. */
export function createSevenMaterialEntry(role = '', options = {}) {
	const remote = AWTSMOOS_MATERIAL_REGISTRY.resolve(role);
	if (remote) {
		return {
			entry: createRemoteMaterialEntry(role, remote, options),
			remote
		};
	}
	const procedural = proceduralSurfaceRecord(role);
	return {
		entry: procedural
			? createProceduralMaterialEntry(role, procedural, options)
			: createFallbackMaterialEntry(role, options),
		remote: null
	};
}

/** Start remote image hydration without awaiting it in the gameplay startup path. */
export function beginSevenMaterialHydration(hydrator, entry, remote, options = {}) {
	if (!entry.url || !remote) return;
	const repeat = entry.material.mapRepeat || [1, 1];
	hydrator.hydrate(entry.material, {
		mapUrl: entry.url,
		mapRepeat: repeat,
		texturePolicy: 'repeat',
		hydrationPriority: remote.critical ? 10 : Number(options.priority) || 0
	}).then(status => {
		entry.phase = status.phase;
		entry.material.userData.materialState = status.phase;
	}).catch(() => {
		entry.phase = 'failed';
		entry.material.userData.materialState = 'failed';
	});
}
