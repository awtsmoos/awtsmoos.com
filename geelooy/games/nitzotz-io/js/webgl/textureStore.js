// B"H
// Boruch Hashem
// Blessed is He
import {
	firebaseTextureRecord,
	initialTextureFileNames
} from '../assets/firebaseTextures.js';
import { createMaterialBinder } from './materialBinding.js';

/**
 * The Awtsmoos lets every remote garment arrive without delaying the living frame.
 * Primary and secondary textures share one safe asynchronous store and fallback.
 */
export function createTextureStore(gl, locations) {
	const fallback = createFallbackTexture(gl);
	const entries = new Map();
	for (const fileName of initialTextureFileNames()) {
		const entry = createEntry(fileName);
		entries.set(fileName, entry);
		loadRemoteTexture(gl, entry);
	}
	const binder = createMaterialBinder(gl, locations, entries, fallback);
	return Object.freeze({
		bind(materialId = 'none') {
			binder.bind(materialId);
		},
		status() {
			return textureStatus(entries);
		},
		resetBinding() {
			binder.reset();
		}
	});
}

function createEntry(fileName) {
	return {
		fileName,
		record: firebaseTextureRecord(fileName),
		status: 'pending',
		texture: null,
		error: null
	};
}

function loadRemoteTexture(gl, entry) {
	if (!entry.record || typeof Image === 'undefined') {
		entry.status = 'failed';
		entry.error = 'Remote image API unavailable.';
		return;
	}
	const image = new Image();
	image.crossOrigin = 'anonymous';
	image.onload = () => uploadImage(gl, entry, image);
	image.onerror = () => {
		entry.status = 'failed';
		entry.error = `Failed to load ${entry.record.url}`;
	};
	image.src = entry.record.url;
}

function uploadImage(gl, entry, image) {
	const texture = gl.createTexture();
	gl.bindTexture(gl.TEXTURE_2D, texture);
	gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
	gl.texImage2D(
		gl.TEXTURE_2D,
		0,
		gl.RGBA,
		gl.RGBA,
		gl.UNSIGNED_BYTE,
		image
	);
	gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
	setSafeParameters(gl);
	entry.texture = texture;
	entry.status = 'ready';
	entry.error = null;
}

function createFallbackTexture(gl) {
	const texture = gl.createTexture();
	gl.bindTexture(gl.TEXTURE_2D, texture);
	gl.texImage2D(
		gl.TEXTURE_2D,
		0,
		gl.RGBA,
		1,
		1,
		0,
		gl.RGBA,
		gl.UNSIGNED_BYTE,
		new Uint8Array([255, 255, 255, 255])
	);
	setSafeParameters(gl);
	return texture;
}

function setSafeParameters(gl) {
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
}

function textureStatus(entries) {
	const status = { pending: [], ready: [], failed: [] };
	for (const entry of entries.values()) status[entry.status].push(entry.fileName);
	return status;
}
