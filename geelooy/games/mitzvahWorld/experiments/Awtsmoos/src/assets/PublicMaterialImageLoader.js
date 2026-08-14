// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file PublicMaterialImageLoader.js
 * @description Loads production images fetch/blob-first with one absolute deadline and a bounded direct fallback.
 * The Awtsmoos reveals distant pixels through many finite doors without becoming any door;
 * Awtsmoos.com gives verified bytes first measure, then reserves a smaller direct-image recovery path before time is done.
 */

import { decodePublicImageBlob, decodePublicImageUrl } from './PublicImageDecode.js';
import { fetchPublicImageBlob } from './PublicImageFetch.js';
import { publicImageCircuitIsOpen } from './PublicImageRateLimitCircuit.js';
import {
	publicMaterialNow,
	publicMaterialPhaseBudget,
	publicMaterialRemainingBudget,
	racePublicMaterialDeadline
} from './PublicMaterialLoadBudget.js';
import {
	materialImageAttempt,
	materialImageFailure,
	materialImageSuccess
} from './PublicMaterialImageRecords.js';
export { serializableImageRecord } from './PublicMaterialImageRecords.js';

const FETCH_BUDGET_SHARE = 0.68;

export function loadPublicMaterialImage(url, timeoutMs = 30000, dependencies = {}) {
	const startedAt = publicMaterialNow(dependencies);
	const operation = loadWithinDeadline(url, timeoutMs, dependencies, startedAt);
	return racePublicMaterialDeadline(
		operation,
		timeoutMs,
		dependencies,
		() => deadlineFailure(url, startedAt, dependencies)
	);
}

async function loadWithinDeadline(url, timeoutMs, dependencies, startedAt) {
	if (publicImageCircuitIsOpen(url, dependencies)) {
		return loadCircuitFailure(url, timeoutMs, dependencies, startedAt);
	}
	const attempts = [];
	const fetched = await fetchPublicImageBlob(url, fetchBudget(timeoutMs, startedAt, dependencies), dependencies);
	attempts.push(materialImageAttempt(fetched));
	if (fetched.ok) {
		const decoded = await decodePublicImageBlob(
			url,
			fetched.blob,
			remaining(timeoutMs, startedAt, dependencies),
			dependencies
		);
		attempts.push(materialImageAttempt(decoded));
		if (decoded.ok) return success(url, decoded, fetched, attempts, startedAt, dependencies);
	}
	let direct = skippedDirectRecord('fetch-response-definitive');
	if (directFallbackAllowed(fetched)) {
		direct = await decodePublicImageUrl(url, remaining(timeoutMs, startedAt, dependencies), dependencies);
		attempts.push(materialImageAttempt(direct));
		if (direct.ok) return success(url, direct, fetched, attempts, startedAt, dependencies);
	}
	return failure(url, direct, fetched, attempts, startedAt, dependencies);
}

async function loadCircuitFailure(url, timeoutMs, dependencies, startedAt) {
	const direct = skippedDirectRecord('rate-limit-circuit-open');
	const attempts = [materialImageAttempt(direct)];
	const fetched = await fetchPublicImageBlob(url, fetchBudget(timeoutMs, startedAt, dependencies), dependencies);
	attempts.push(materialImageAttempt(fetched));
	return failure(url, direct, fetched, attempts, startedAt, dependencies);
}

function directFallbackAllowed(fetched) {
	return !fetched?.ok && (!fetched?.status || fetched.status >= 500);
}

function deadlineFailure(url, startedAt, dependencies) {
	const attempt = materialImageAttempt({ error: 'material-deadline-exceeded', method: 'material-deadline', stage: 'deadline' });
	return failure(url, attempt, null, [attempt], startedAt, dependencies);
}

function success(url, decoded, fetched, attempts, startedAt, dependencies) {
	return materialImageSuccess({ attempts, decoded, fetched, now: () => publicMaterialNow(dependencies), startedAt, url });
}

function failure(url, direct, fetched, attempts, startedAt, dependencies) {
	return materialImageFailure({ attempts, direct, fetched, now: () => publicMaterialNow(dependencies), startedAt, url });
}

function fetchBudget(timeoutMs, startedAt, dependencies) {
	return publicMaterialPhaseBudget(timeoutMs, startedAt, dependencies, FETCH_BUDGET_SHARE);
}

function remaining(timeoutMs, startedAt, dependencies) {
	return publicMaterialRemainingBudget(timeoutMs, startedAt, dependencies);
}

function skippedDirectRecord(error) {
	return { error, method: 'direct-image-url-skipped', ok: false, rateLimited: error === 'rate-limit-circuit-open', stage: 'policy', status: 0 };
}
