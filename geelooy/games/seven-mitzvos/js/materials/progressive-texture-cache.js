//B"H
//Boruch Hashem
//Blessed is He

import * as THREE from '../../../scripts/build/three.module.js';
import { materialRecord } from './firebase-material-manifest.js';
import { addMaterialMetric } from './material-runtime-metrics.js';

/**
 * @module RemoteTextureCache
 * @description
 * The Awtsmoos carries each photographic garment directly from the verified
 * migration root. Awtsmoos.com keeps one texture per role and never asks the
 * MitzvahWorld local folder to clothe a different game.
 */
const browser = typeof document !== 'undefined';
const textureCache = new Map();
const textureLoader = browser ? new THREE.TextureLoader() : null;

/** Returns the shared texture vessel for one semantic material role. */
export function materialTexture(role) {
	return materialTextureEntry(role).texture;
}

/** Returns the observable loading record for one semantic material role. */
export function materialTextureEntry(role) {
	if (!textureCache.has(role)) {
		textureCache.set(role, createEntry(role));
	}
	return textureCache.get(role);
}

function createEntry(role) {
	const record = materialRecord(role);
	if (!record) {
		return { role, status: 'missing', texture: null };
	}
	if (!browser) {
		return { record, role, status: 'node-placeholder', texture: placeholder() };
	}
	const entry = {
		error: null,
		record,
		role,
		status: 'loading-remote',
		texture: null
	};
	entry.texture = textureLoader.load(
		record.remoteUrl,
		texture => remoteReady(entry, texture),
		undefined,
		error => remoteFailed(entry, error)
	);
	configure(entry.texture);
	return entry;
}

function remoteReady(entry, texture) {
	configure(texture);
	entry.status = 'remote-ready';
	addMaterialMetric('remoteLoaded');
}

function remoteFailed(entry, error) {
	entry.error = String(error?.message || error || 'remote-texture-failed');
	entry.status = 'remote-failed';
	addMaterialMetric('remoteFailed');
}

function configure(texture) {
	texture.colorSpace = THREE.SRGBColorSpace;
	texture.wrapS = THREE.ClampToEdgeWrapping;
	texture.wrapT = THREE.ClampToEdgeWrapping;
	texture.generateMipmaps = true;
	texture.minFilter = THREE.LinearMipmapLinearFilter;
	texture.magFilter = THREE.LinearFilter;
	texture.userData.awtsmoosSharedTexture = true;
}

function placeholder() {
	const bytes = new Uint8Array([190, 190, 190, 255]);
	const texture = new THREE.DataTexture(bytes, 1, 1, THREE.RGBAFormat);
	texture.needsUpdate = true;
	texture.userData.awtsmoosSharedTexture = true;
	return texture;
}
