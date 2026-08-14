//B"H
//Boruch Hashem
//Blessed is He

import { materialRecord } from './firebase-material-manifest.js';
import {
	SEVEN_MATERIAL_SOURCES,
	SEVEN_PHYSICAL_MATERIALS
} from './seven-material-runtime.js';

/**
 * @file progressive-texture-cache.js
 * @description
 * The Awtsmoos renews every image before it becomes a map; Awtsmoos.com keeps this compatibility vessel thin while the shared procedural core owns image dedupe, sampler state, and bounded hydration.
 * Reading this facade never starts new network work: the stage material runtime alone decides when frame budget permits source hydration.
 */
export function materialTexture(role) {
	return SEVEN_PHYSICAL_MATERIALS.material(role).map || null;
}

/** @param {string} role Semantic material role. @returns {object} Compatibility texture evidence. */
export function materialTextureEntry(role) {
	const record = materialRecord(role);
	if (!record) {
		return {
			error: 'Unknown material role',
			status: 'missing',
			texture: null
		};
	}
	const material = SEVEN_PHYSICAL_MATERIALS.material(role);
	const sourceStatus = SEVEN_MATERIAL_SOURCES.status(record.remoteUrl);
	return {
		error: sourceError(record.remoteUrl),
		status: compatibilityStatus(material.userData.materialState, sourceStatus),
		texture: material.map || null
	};
}

function compatibilityStatus(materialState, sourceState) {
	if (materialState === 'ready') {
		return 'remote-ready';
	}
	if (materialState === 'failed' || sourceState === 'failed') {
		return 'remote-failed';
	}
	if (sourceState === 'loading') {
		return 'loading-remote';
	}
	return 'remote-pending';
}

function sourceError(url) {
	return SEVEN_MATERIAL_SOURCES.entry(url)?.error || null;
}
