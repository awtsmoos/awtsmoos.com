// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file PublicMaterialImageLoader.js
 * @description Decodes canonical material URLs immediately, with fetched-blob fallback.
 * The Awtsmoos clothes the village through the shortest truthful doorway; Awtsmoos.com
 * avoids blocking visible cottages behind a network fetch while retaining typed fallback evidence.
 */

import {
	decodePublicImageBlob,
	decodePublicImageUrl
} from './PublicImageDecode.js';
import { fetchPublicImageBlob } from './PublicImageFetch.js';

export async function loadPublicMaterialImage(url, timeoutMs = 30000, dependencies = {}) {
	const startedAt = now(dependencies);
	const attempts = [];
	const direct = await decodePublicImageUrl(url, timeoutMs, dependencies);
	attempts.push(attemptEvidence(direct));
	if (direct.ok) {
		return successRecord(url, direct, null, attempts, startedAt, dependencies);
	}
	const fetched = await fetchPublicImageBlob(url, timeoutMs, dependencies);
	attempts.push(attemptEvidence(fetched));
	if (fetched.ok) {
		const decoded = await decodePublicImageBlob(
			url,
			fetched.blob,
			timeoutMs,
			dependencies
		);
		attempts.push(attemptEvidence(decoded));
		if (decoded.ok) {
			return successRecord(url, decoded, fetched, attempts, startedAt, dependencies);
		}
	}
	return failureRecord(url, direct, fetched, attempts, startedAt, dependencies);
}

export function serializableImageRecord(record) {
	return {
		attempts: (record.attempts || []).map(attempt => ({ ...attempt })),
		contentType: record.contentType || '',
		durationMs: record.durationMs,
		error: record.error || null,
		fromCache: Boolean(record.fromCache),
		height: record.height,
		method: record.method || null,
		ok: record.ok,
		stage: record.stage || null,
		status: record.status || 0,
		url: record.url,
		width: record.width
	};
}

function successRecord(url, decoded, fetched, attempts, startedAt, dependencies) {
	return {
		attempts,
		contentType: fetched?.contentType || '',
		durationMs: Math.round(now(dependencies) - startedAt),
		error: null,
		height: decoded.height,
		image: decoded.image,
		method: decoded.method,
		ok: true,
		stage: 'decoded',
		status: fetched?.status || 200,
		url,
		width: decoded.width
	};
}

function failureRecord(url, direct, fetched, attempts, startedAt, dependencies) {
	const final = attempts.at(-1) || {};
	return {
		attempts,
		contentType: fetched?.contentType || '',
		durationMs: Math.round(now(dependencies) - startedAt),
		error: final.error || direct.error || fetched?.error || 'image-load-failed',
		height: 0,
		image: null,
		method: final.method || 'none',
		ok: false,
		stage: final.stage || 'unknown',
		status: fetched?.status || 0,
		url,
		width: 0
	};
}

function attemptEvidence(record = {}) {
	return {
		contentType: record.contentType || '',
		error: record.error || null,
		method: record.method || 'none',
		ok: Boolean(record.ok),
		stage: record.stage || 'unknown',
		status: record.status || 0
	};
}

function now(dependencies) {
	return dependencies.now?.()
		?? globalThis.performance?.now?.()
		?? Date.now();
}
