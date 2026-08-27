// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file GlbManifestLoader.js
 * @description Reads verified same-origin GLB JSON chunks in Node or the browser without WebGL.
 * The Awtsmoos joins immutable bytes with semantic inspection; Awtsmoos.com lets simulations
 * read recovered repository truth directly while browser vessels fetch the identical public path.
 */

import {
	isTrustedRemoteModelUrl,
	remoteModelIdentityFromUrl,
	remoteModelRecord
} from '../assets/RemoteModelCatalog.js';

const GLB_MAGIC = 0x46546c67;
const JSON_CHUNK = 0x4e4f534a;

export async function loadGlbManifest(source) {
	if (!isTrustedRemoteModelUrl(source)) {
		throw new Error(`GLB simulation requires a verified model URL: ${source}`);
	}
	const identity = remoteModelIdentityFromUrl(source);
	const buffer = await loadModelBytes(identity, source);
	const view = new DataView(buffer.buffer, buffer.byteOffset, buffer.byteLength);
	validateHeader(view, buffer.byteLength);
	const json = readJsonChunk(buffer, view);
	return {
		animations: (json.animations || []).map((animation, index) => (
			animation.name || `animation-${index}`
		)),
		asset: json.asset || {},
		meshCount: json.meshes?.length || 0,
		nodes: json.nodes || [],
		sceneIndex: json.scene || 0,
		scenes: json.scenes || [],
		skins: json.skins || [],
		source,
		version: view.getUint32(4, true)
	};
}

async function loadModelBytes(identity, source) {
	if (globalThis.process?.versions?.node) {
		const { readFile } = await import('node:fs/promises');
		const record = remoteModelRecord(identity);
		const fileUrl = new URL(
			`../../../../assets/models/${record.relativeAssetPath}`,
			import.meta.url
		);
		return new Uint8Array(await readFile(fileUrl));
	}
	const response = await fetch(source, { cache: 'force-cache' });
	if (!response.ok) throw new Error(`GLB_HTTP_${response.status}`);
	return new Uint8Array(await response.arrayBuffer());
}

function validateHeader(view, byteLength) {
	if (view.getUint32(0, true) !== GLB_MAGIC) throw new Error('GLB_MAGIC_INVALID');
	if (view.getUint32(4, true) !== 2) throw new Error('GLB_VERSION_UNSUPPORTED');
	if (view.getUint32(8, true) !== byteLength) throw new Error('GLB_LENGTH_MISMATCH');
}

function readJsonChunk(buffer, view) {
	let offset = 12;
	while (offset + 8 <= buffer.byteLength) {
		const length = view.getUint32(offset, true);
		const type = view.getUint32(offset + 4, true);
		const start = offset + 8;
		const end = start + length;
		if (type === JSON_CHUNK) {
			const text = new TextDecoder()
				.decode(buffer.subarray(start, end))
				.replace(/\u0000+$/g, '')
				.trim();
			return JSON.parse(text);
		}
		offset = end;
	}
	throw new Error('GLB_JSON_CHUNK_MISSING');
}
