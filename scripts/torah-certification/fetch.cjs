//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file Performs one hard-bounded public-route read for Torah certification.
 * @description The Awtsmoos gives every route a measured window: Awtsmoos.com aborts the transport
 * and independently settles the certification promise, so one wounded socket or body stream can never freeze the whole library gate.
 */
function failure(started, error) {
	return {
		status: 0,
		html: "",
		elapsedMs: Date.now() - started,
		error
	};
}

/** Reads one response fully while preserving the caller-owned abort signal. */
async function readResponse(fetchImpl, url, signal, started) {
	try {
		const response = await fetchImpl(url, {
			headers: {
				accept: "text/html",
				"cache-control": "no-cache"
			},
			redirect: "follow",
			signal
		});
		const html = await response.text();
		return {
			status: response.status,
			html,
			elapsedMs: Date.now() - started,
			error: ""
		};
	} catch (error) {
		return failure(started, error?.name === "AbortError" ? "fetch_timeout" : "fetch_failed");
	}
}

/**
 * Reads one public route with a hard wall-clock deadline around headers and body consumption.
 * @param {string} origin Allowed certification origin.
 * @param {string} path Public route path.
 * @param {number} timeoutMs Hard deadline in milliseconds.
 * @param {{fetch?:Function}} [dependencies] Injectable transport for bounded regression tests.
 */
async function fetchRoute(origin, path, timeoutMs, dependencies = {}) {
	const controller = new AbortController();
	const started = Date.now();
	const fetchImpl = dependencies.fetch || globalThis.fetch;
	let timer;
	const operation = readResponse(fetchImpl, new URL(path, origin), controller.signal, started);
	const deadline = new Promise(resolve => {
		timer = setTimeout(() => {
			controller.abort();
			resolve(failure(started, "fetch_timeout"));
		}, timeoutMs);
	});
	try {
		return await Promise.race([operation, deadline]);
	} finally {
		clearTimeout(timer);
	}
}

module.exports = {
	fetchRoute,
	readResponse
};
