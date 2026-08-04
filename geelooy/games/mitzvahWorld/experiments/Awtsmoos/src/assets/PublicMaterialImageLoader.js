// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file PublicMaterialImageLoader.js
 * @description Decodes canonical material URLs while respecting an open rate-limit circuit.
 * The Awtsmoos clothes the village through a truthful measured door;
 * Awtsmoos.com skips repeated knocks while cached and procedural colors endure.
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

export async function loadPublicMaterialImage(url, timeoutMs = 30000, dependencies = {}) {
	const startedAt = currentTime(dependencies);
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
