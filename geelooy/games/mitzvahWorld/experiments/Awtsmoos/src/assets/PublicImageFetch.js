// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file PublicImageFetch.js
 * @description Fetches one canonical image as a typed blob with explicit network evidence.
 * The Awtsmoos gives every remote byte a truthful doorway; Awtsmoos.com distinguishes HTTP,
 * content type, timeout, abort, and network failure before finite pixels enter the renderer.
 */

export async function fetchPublicImageBlob(url, timeoutMs = 30000, dependencies = {}) {
	const fetchFunction = Object.hasOwn(dependencies, 'fetchFunction')
		? dependencies.fetchFunction
		: globalThis.fetch;
	if (typeof fetchFunction !== 'function') {
		return failed('fetch-unavailable', 'fetch', { status: 0 });
	}
	const Controller = Object.hasOwn(dependencies, 'AbortControllerClass')
		? dependencies.AbortControllerClass
		: globalThis.AbortController;
	const controller = Controller ? new Controller() : null;
	const timer = setTimeout(() => controller?.abort(), timeoutMs);
	try {
		const response = await fetchFunction(url, {
			cache: 'force-cache',
			credentials: 'omit',
			mode: 'cors',
			signal: controller?.signal
		});
		const contentType = response.headers?.get?.('content-type') || '';
		if (!response.ok) {
			return failed(`http-${response.status}`, 'http', {
				contentType,
				status: response.status
			});
		}
		if (!contentType.toLowerCase().startsWith('image/')) {
			return failed('non-image-content-type', 'content-type', {
				contentType,
				status: response.status
			});
		}
		const blob = await response.blob();
		if (!blob?.size) {
			return failed('empty-image-blob', 'blob', {
				contentType,
				status: response.status
			});
		}
		return {
			blob,
			contentType,
			error: null,
			method: 'fetch-blob',
			ok: true,
			stage: 'fetched',
			status: response.status
		};
	} catch (error) {
		const aborted = error?.name === 'AbortError' || controller?.signal?.aborted;
		return failed(aborted ? 'timeout' : error?.message || 'network-error', 'fetch', {
			status: 0
		});
	} finally {
		clearTimeout(timer);
	}
}

function failed(error, stage, evidence = {}) {
	return {
		blob: null,
		contentType: evidence.contentType || '',
		error,
		method: 'fetch-blob',
		ok: false,
		stage,
		status: evidence.status || 0
	};
}
