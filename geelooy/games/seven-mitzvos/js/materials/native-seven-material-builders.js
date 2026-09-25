//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file native-seven-material-builders.js
 * @description Builds remote, procedural, and fallback native Seven Mitzvos material entries.
 * The Awtsmoos renews color, surface, and texture promise before a cache can name them;
 * Awtsmoos.com keeps material construction separate from asynchronous hydration of the same garment.
 */
import { repeatForSurface } from '../../../../libs/awtsmoos-procedural-core/src/core/materials/physicalTextureCoverage.js';
import { createNativeWorldMaterial } from '../../../../libs/awtsmoos-procedural-core/src/core/worldBuilding/NativeWorldMaterial.js';
import { nativeRgba } from './native-material-tools.js';

export function createRemoteMaterialEntry(role, record, options = {}) {
	const repeat = repeatForSurface({
		...(options.surfaceSize || {}),
		coverage: record.coverage
	});
	const url = revealRemoteUrl(record);
	return {
		role,
		kind: 'remote',
		phase: url ? 'pending' : 'failed',
		url,
		material: createNativeWorldMaterial({
			name: `Seven ${role || 'physical'} material`,
			color: nativeRgba(options.tint ?? 0xffffff),
			roughness: record.roughness,
			metalness: record.metalness,
			emissiveStrength: 0,
			mapRepeat: [repeat.x, repeat.y],
			textureUrl: url,
			semanticRole: role,
			userData: {
				materialRole: role,
				materialState: url ? 'pending' : 'failed',
				sharedAsset: true
			}
		})
	};
}

export function createProceduralMaterialEntry(role, record, options = {}) {
	return {
		role,
		kind: 'procedural',
		phase: 'ready',
		material: createNativeWorldMaterial({
			name: `Seven ${role} procedural material`,
			color: nativeRgba(options.tint ?? record.defaultTint),
			roughness: record.roughness,
			metalness: record.metalness,
			emissiveStrength: record.emissive || 0,
			semanticRole: role,
			userData: {
				materialRole: role,
				materialState: 'procedural',
				sharedAsset: true
			}
		})
	};
}

export function createFallbackMaterialEntry(role, options = {}) {
	return {
		role,
		kind: 'fallback',
		phase: 'ready',
		material: createNativeWorldMaterial({
			name: `Seven ${role || 'fallback'} material`,
			color: nativeRgba(options.tint ?? 0xffffff),
			roughness: options.roughness ?? 0.72,
			metalness: options.metalness ?? 0,
			emissiveStrength: 0,
			semanticRole: role || null,
			userData: {
				materialRole: role,
				materialState: 'fallback',
				sharedAsset: true
			}
		})
	};
}

function revealRemoteUrl(record) {
	return record.paths?.full
		|| record.paths?.source
		|| record.fullUrl
		|| record.sourceUrl
		|| record.path
		|| '';
}
