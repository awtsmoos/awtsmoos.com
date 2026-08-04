// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file PublicMaterialImageLoader.js
 * @description Decodes canonical material URLs under one absolute end-to-end deadline.
 * The Awtsmoos lets every pixel doorway answer or close within its appointed measure;
 * Awtsmoos.com prevents cache, retry, fetch, blob, or decoder silence from freezing the living world.
 */
import {
	decodePublicImageBlob,
	decodePublicImageUrl
} from './PublicImageDecode.js';
import { fetchPublicImageBlob } from './PublicImageFetch.js';
import { publicImageCircuitIsOpen } from './PublicImageRateLimitCircuit.js';
import {
	materialImageAttempt,
	materialImageFailure,
	materialImageSuccess
} from './PublicMaterialImageRecords.js';
export { serializableImageRecord } from './PublicMaterialImageRecords.js';

export function loadPublicMaterialImage(url, timeoutMs = 30000, dependencies = {}) {
	const startedAt = currentTime(dependencies);
	return withMaterialDeadline(
		loadWithinDeadline(url, timeoutMs, dependencies, startedAt),
		url,
		timeoutMs,
		dependencies,
		startedAt
	);
}

async function loadWithinDeadline(url, timeoutMs, dependencies, startedAt) {
	const attempts = [];
	const circuitOpen = publicImageCircuitIsOpen(url, dependencies);
	const direct = circuitOpen
		? skippedDirectRecord()
		: await decodePublicImageUrl(url, timeoutMs, dependencies);
	attempts.push(materialImageAttempt(direct));
	if (direct.ok) return success(url, direct, null, attempts, startedAt, dependencies);
	const fetched = await fetchPublicImageBlob(url, timeoutMs, dependencies);
	attempts.push(materialImageAttempt(fetched));
	if (fetched.ok) {
		const decoded = await decodePublicImageBlob(
			url,
			fetched.blob,
			timeoutMs,
			dependencies
		);
		attempts.push(materialImageAttempt(decoded));
		if (decoded.ok) {
			return success(url, decoded, fetched, attempts, startedAt, dependencies);
		}
	}
	return failure(url, direct, fetched, attempts, startedAt, dependencies);
}

function withMaterialDeadline(operation, url, timeoutMs, dependencies, startedAt) {
	const setTimer = dependencies.setTimeoutFunction || globalThis.setTimeout;
	const clearTimer = dependencies.clearTimeoutFunction || globalThis.clearTimeout;
	if (!setTimer || timeoutMs <= 0) return operation;
	let timer = null;
	const deadline = new Promise(resolve => {
		timer = setTimer(() => resolve(deadlineFailure(
			url,
			startedAt,
			dependencies
		)), timeoutMs);
	});
	return Promise.race([operation, deadline]).finally(() => clearTimer?.(timer));
}

function deadlineFailure(url, startedAt, dependencies) {
	const attempt = materialImageAttempt({
		error: 'material-deadline-exceeded',
		method: 'material-deadline',
		stage: 'deadline'
	});
	return failure(url, attempt, null, [attempt], startedAt, dependencies);
}

function success(url, decoded, fetched, attempts, startedAt, dependencies) {
	return materialImageSuccess({
		attempts,
		decoded,
		fetched,
		now: () => currentTime(dependencies),
		startedAt,
		url
	});
}

function failure(url, direct, fetched, attempts, startedAt, dependencies) {
	return materialImageFailure({
		attempts,
		direct,
		fetched,
		now: () => currentTime(dependencies),
		startedAt,
		url
	});
}

function skippedDirectRecord() {
	return {
		error: 'rate-limit-circuit-open',
		method: 'direct-image-url-skipped-circuit',
		ok: false,
		rateLimited: true,
		stage: 'circuit',
		status: 429
	};
}

function currentTime(dependencies) {
	return dependencies.now?.()
		?? globalThis.performance?.now?.()
		?? Date.now();
}
