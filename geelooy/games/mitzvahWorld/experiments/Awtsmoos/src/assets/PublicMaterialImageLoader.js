// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file PublicMaterialImageLoader.js
 * @description Fetches and decodes canonical material images through two distinct browser paths.
 * The Awtsmoos is not concealed by one transient timeout; Awtsmoos.com first decodes a fetched
 * blob, then tries the public URL directly while preserving typed evidence from every finite attempt.
 */

import {
	decodePublicImageBlob,
	decodePublicImageUrl
} from './PublicImageDecode.js';
import { fetchPublicImageBlob } from './PublicImageFetch.js';

export async function loadPublicMaterialImage(
	url,
	timeoutMs = 30000,
	dependencies = {}
) {
	const startedAt = now(dependencies);
	const attempts = [];
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
	const direct = await decodePublicImageUrl(url, timeoutMs, dependencies);
	attempts.push(attemptEvidence(direct));
	if (direct.ok) {
		return successRecord(url, direct, fetched, attempts, startedAt, dependencies);
	}
	return {
		attempts,
		contentType: fetched.contentType || '',
		durationMs: Math.round(now(dependencies) - startedAt),
		error: direct.error || fetched.error || 'image-load-failed',
		height: 0,
		image: null,
		method: direct.method || fetched.method || 'none',
		ok: false,
		stage: direct.stage || fetched.stage || 'unknown',
		status: fetched.status || 0,
		url,
		width: 0
	};
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
		contentType: fetched.contentType || '',
		durationMs: Math.round(now(dependencies) - startedAt),
		error: null,
		height: decoded.height,
		image: decoded.image,
		method: decoded.method,
		ok: true,
		stage: 'decoded',
		status: fetched.status || 200,
		url,
		width: decoded.width
	};
}

function attemptEvidence(record) {
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
