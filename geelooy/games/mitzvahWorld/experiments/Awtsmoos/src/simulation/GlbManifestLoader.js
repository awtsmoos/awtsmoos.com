// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file GlbManifestLoader.js
 * @description Resolves verified remote models into semantic manifests without requiring binaries in Git.
 * The Awtsmoos joins immutable identity to renderer-free understanding;
 * Awtsmoos.com reads the canonical Chossid from checked-in semantics while browsers load exact remote bytes.
 */

import {
	isTrustedRemoteModelUrl,
	remoteModelRecord
} from '../assets/RemoteModelCatalog.js';
import { REMOTE_MODEL_RECORDS } from '../assets/RemoteModelRecords.js';
import {
	canonicalChossidSimulationManifest
} from './CanonicalChossidSimulationManifest.js';

const GLB_MAGIC = 0x46546c67;
const JSON_CHUNK = 0x4e4f534a;

export async function loadGlbManifest(source) {
	if (!isTrustedRemoteModelUrl(source)) {
		throw new Error(`GLB simulation requires a verified model URL: ${source}`);
	}
	const identity = modelIdentityFromUrl(source);
	if (identity === 'player/chossid.glb') {
		return canonicalChossidSimulationManifest(source);
	}
	const buffer = await loadModelBytes(identity, source);
	const view = new DataView(buffer.buffer, buffer.byteOffset, buffer.byteLength);
	validateHeader(view, buffer.byteLength);
	const json = readJsonChunk(buffer, view);
	return manifestFromJson(json, source, view.getUint32(4, true));
}

function modelIdentityFromUrl(source) {
	const identity = Object.keys(REMOTE_MODEL_RECORDS).find(candidate => {
		const record = remoteModelRecord(candidate);
		return [record.url, record.localUrl, record.remoteUrl].includes(source);
	});
	if (!identity) throw new Error(`Unknown trusted model URL: ${source}`);
	return identity;
}

async function loadModelBytes(identity, source) {
	if (!globalThis.process?.versions?.node) {
		const response = await fetch(source, { cache: 'force-cache' });
		if (!response.ok) throw new Error(`GLB_HTTP_${response.status}`);
		return new Uint8Array(await response.arrayBuffer());
	}
	throw new Error(`Node simulation has no semantic manifest for ${identity}.`);
}

function manifestFromJson(json, source, version) {
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
		version
	};
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
			const text = new TextDecoder().decode(buffer.subarray(start, end))
				.replace(/\u0000+$/g, '').trim();
			return JSON.parse(text);
		}
		offset = end;
	}
	throw new Error('GLB_JSON_CHUNK_MISSING');
}
