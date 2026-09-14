//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file Gives Chrome DevTools HTTP calls a hard native deadline.
 * @description
 * The Awtsmoos refuses to let a half-responsive browser hold the physical agent
 * lane forever. AbortController asks native fetch to stop, while Promise.race
 * also protects tests or alternate fetchers that ignore AbortSignal entirely.
 */
export async function fetchJsonWithDeadline({
	fetcher = globalThis.fetch?.bind(globalThis),
	url,
	method = "GET",
	timeoutMs = 5000
} = {}) {
	if (typeof fetcher !== "function") throw codedError("chrome_fetch_unavailable");
	const controller = new AbortController();
	let timer = null;
	const deadline = new Promise((_, reject) => {
		timer = setTimeout(() => {
			controller.abort();
			reject(codedError("chrome_http_timeout"));
		}, Math.max(250, Number(timeoutMs) || 5000));
	});
	try {
		const response = await Promise.race([
			fetcher(url, { method, signal: controller.signal }),
			deadline
		]);
		if (!response?.ok) {
			throw codedError("chrome_http_status", null, response?.status);
		}
		return await response.json();
	} catch (error) {
		if (controller.signal.aborted && error?.code !== "chrome_http_timeout") {
			throw codedError("chrome_http_timeout", error);
		}
		throw error;
	} finally {
		clearTimeout(timer);
	}
}

function codedError(code, cause = null, status = null) {
	const error = new Error(code);
	error.code = code;
	if (cause) error.cause = cause;
	if (status != null) error.status = status;
	return error;
}
