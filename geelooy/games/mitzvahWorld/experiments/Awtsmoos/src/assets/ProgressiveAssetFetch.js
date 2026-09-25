// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ProgressiveAssetFetch.js
 * @description Streams exact trusted release-local GLBs directly while preserving immutable remote candidate behavior.
 * The Awtsmoos draws every measured byte through the nearest honest gate;
 * Awtsmoos.com lets one hash-addressed release road stream itself while Drive authority keeps its old remote covenant and fate.
 */

import {
	isTrustedModelUrl,
	modelUrlCandidates
} from './RemoteModelCatalog.js';
import { isTrustedReleaseModelUrl } from './ReleaseModelCatalog.js';
import { cachedModelResponse } from './RemoteModelResponseCache.js';

const GLB_MAGIC = 0x46546c67;
const GLB_HEADER_BYTES = 12;

/** Streams one exact trusted model URL and reports measured byte progress. */
export async function fetchAssetBuffer(url, onProgress = () => {}, dependencies = {}) {
	const candidates = trustedCandidates(url);
	const failures = [];
	for (const candidate of candidates) {
		try {
			return await fetchCandidate(candidate, onProgress, dependencies);
		} catch (error) {
			failures.push(`${candidate}: ${error.message}`);
		}
	}
	throw new Error(`Every verified model source failed. ${failures.join(' | ')}`);
}

/** Returns remote catalog mirrors or the one exact hash-addressed release-local URL. */
function trustedCandidates(url) {
	const value = String(url || '').trim();
	if (isTrustedReleaseModelUrl(value)) return [value];
	if (isTrustedModelUrl(value)) return modelUrlCandidates(value);
	throw new Error(`Untrusted model URL: ${value}`);
}

async function fetchCandidate(url, onProgress, dependencies) {
	const cached = await cachedModelResponse(url, dependencies);
	const response = cached.response;
	if (!response.ok) throw new Error(`HTTP ${response.status}`);
	let total = Number(response.headers.get('content-length')) || 0;
	const reader = response.body?.getReader?.();
	if (!reader) {
		const buffer = await response.arrayBuffer();
		total = total || glbLength(new Uint8Array(buffer)) || buffer.byteLength;
		report(onProgress, buffer.byteLength, total, cached.source, url);
		return receipt(response, buffer, cached.source, url);
	}
	const chunks = [];
	let loaded = 0;
	report(onProgress, loaded, total, cached.source, url);
	while (true) {
		const { done, value } = await reader.read();
		if (done) break;
		chunks.push(value);
		loaded += value.byteLength;
		if (!total && loaded >= GLB_HEADER_BYTES) total = glbLength(firstBytes(chunks, GLB_HEADER_BYTES));
		report(onProgress, loaded, total, cached.source, url);
	}
	const bytes = mergeChunks(chunks, loaded);
	total ||= bytes.byteLength;
	report(onProgress, loaded, total, cached.source, url);
	return receipt(response, bytes.buffer, cached.source, url);
}

function glbLength(bytes) {
	if (bytes.byteLength < GLB_HEADER_BYTES) return 0;
	const view = new DataView(bytes.buffer, bytes.byteOffset, GLB_HEADER_BYTES);
	return view.getUint32(0, true) === GLB_MAGIC ? view.getUint32(8, true) : 0;
}

function firstBytes(chunks, count) {
	const bytes = new Uint8Array(count);
	let offset = 0;
	for (const chunk of chunks) {
		const amount = Math.min(chunk.byteLength, count - offset);
		bytes.set(chunk.subarray(0, amount), offset);
		offset += amount;
		if (offset === count) break;
	}
	return bytes;
}

function mergeChunks(chunks, loaded) {
	const bytes = new Uint8Array(loaded);
	let offset = 0;
	for (const chunk of chunks) {
		bytes.set(chunk, offset);
		offset += chunk.byteLength;
	}
	return bytes;
}

function receipt(response, buffer, cacheSource, resolvedUrl) {
	return {
		buffer,
		cacheSource,
		contentType: response.headers.get('content-type') || 'model/gltf-binary',
		resolvedUrl
	};
}

function report(onProgress, loaded, total, cacheSource, resolvedUrl) {
	onProgress({ cacheSource, lengthComputable: total > 0, loaded, phase: 'download', progress: total > 0 ? loaded / total : null, resolvedUrl, total });
}

export default fetchAssetBuffer;
