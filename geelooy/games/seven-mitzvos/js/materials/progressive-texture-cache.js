//B"H
//Boruch Hashem
//Blessed is He

import * as THREE from '../../../scripts/build/three.module.js';
import { FIREBASE_MATERIAL_ORIGIN, materialRecord } from './firebase-material-manifest.js';
import { addMaterialMetric } from './material-runtime-metrics.js';

/**
 * @module ProgressiveTextureCache
 * @description
 * Real material appears from the verified public-project mirror immediately. The
 * canonical Firebase URL upgrades only on its own origin or explicit diagnostics,
 * so the Awtsmoos.com world never mistakes current quota or CORS failure for art.
 */
const cache = new Map();
const browser = typeof document !== 'undefined';
const loader = browser ? new THREE.TextureLoader() : null;

export function materialTexture(role) {
	if (!cache.has(role)) cache.set(role, createEntry(role));
	return cache.get(role).texture;
}

export function materialTextureEntry(role) {
	if (!cache.has(role)) cache.set(role, createEntry(role));
	return cache.get(role);
}

function createEntry(role) {
	const record = materialRecord(role);
	if (!record) return { role, status: 'missing', texture: null };
	if (!browser) return { record, role, status: 'node-placeholder', texture: placeholder() };
	const entry = { record, role, status: 'loading-local', texture: null };
	entry.texture = loader.load(
		record.localUrl,
		texture => localReady(entry, texture),
		undefined,
		() => localFailed(entry)
	);
	configure(entry.texture);
	return entry;
}

function localReady(entry, texture) {
	configure(texture);
	entry.status = 'local-ready';
	addMaterialMetric('localLoaded');
	if (shouldAttemptFirebase()) validateFirebase(entry);
}

function localFailed(entry) {
	entry.status = 'local-failed';
	addMaterialMetric('localFailed');
	if (shouldAttemptFirebase()) validateFirebase(entry);
}

function shouldAttemptFirebase() {
	if (!browser) return false;
	const sameOrigin = location.origin === FIREBASE_MATERIAL_ORIGIN;
	const diagnostic = new URLSearchParams(location.search).get('firebaseMaterials') === '1';
	return sameOrigin || diagnostic;
}

async function validateFirebase(entry) {
	if (typeof fetch !== 'function' || typeof createImageBitmap !== 'function') return;
	try {
		const response = await fetch(entry.record.firebaseUrl, { mode: 'cors' });
		const type = response.headers.get('content-type') || '';
		if (!response.ok || !type.startsWith('image/')) throw new Error(`Firebase material unavailable: ${response.status}`);
		entry.texture.image = await createImageBitmap(await response.blob());
		entry.texture.needsUpdate = true;
		entry.status = 'firebase-ready';
		addMaterialMetric('firebaseLoaded');
	} catch {
		entry.status = entry.status === 'local-ready' ? 'local-fallback' : 'unavailable';
		addMaterialMetric('firebaseFailed');
	}
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
	const texture = new THREE.DataTexture(new Uint8Array([190, 190, 190, 255]), 1, 1, THREE.RGBAFormat);
	texture.needsUpdate = true;
	texture.userData.awtsmoosSharedTexture = true;
	return texture;
}
