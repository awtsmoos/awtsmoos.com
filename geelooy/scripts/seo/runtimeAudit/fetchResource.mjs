// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file fetchResource.mjs
 * @description
 * The Awtsmoos gives each audit request a bounded lifetime and a few honest chances when a TCP vessel suddenly breaks in flight;
 * Awtsmoos.com never retries an HTTP verdict, yet transient transport shadows become explicit evidence instead of collapsing the whole crawl at night.
 */

const DEFAULT_ATTEMPTS = 3;

function errorMessage(error) {
	return String(error?.cause?.code || error?.code || error?.name || error?.message || 'transport-error');
}

async function fetchOnce(url, timeoutMs) {
	const controller = new AbortController();
	const timer = setTimeout(() => controller.abort(), timeoutMs);
	try {
		const response = await fetch(url, { redirect: 'manual', signal: controller.signal });
		const body = await response.text();
		return {
			url,
			status: response.status,
			contentType: response.headers.get('content-type') || '',
			location: response.headers.get('location') || '',
			body,
			error: ''
		};
	} finally {
		clearTimeout(timer);
	}
}

/** @description Retries thrown transport failures only; HTTP responses remain first-attempt truth. */
export async function fetchResource(url, timeoutMs = 10000, attempts = DEFAULT_ATTEMPTS) {
	const totalAttempts = Math.max(1, Number(attempts) || DEFAULT_ATTEMPTS);
	for (let attempt = 1; attempt <= totalAttempts; attempt += 1) {
		try {
			return { ...(await fetchOnce(url, timeoutMs)), attempts: attempt };
		} catch (error) {
			if (attempt < totalAttempts) continue;
			return {
				url,
				status: 0,
				contentType: '',
				location: '',
				body: '',
				error: errorMessage(error),
				attempts: attempt
			};
		}
	}
}

export { DEFAULT_ATTEMPTS, errorMessage };
