//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file Performs one bounded public-route read for Torah certification.
 * @description Every fetch owns its deadline and returns structured testimony instead of
 * throwing into the crawl, allowing one wounded route to be reported without hiding siblings.
 */
async function fetchRoute(origin, path, timeoutMs) {
	const controller = new AbortController();
	const started = Date.now();
	const timer = setTimeout(() => controller.abort(), timeoutMs);

	try {
		const response = await fetch(new URL(path, origin), {
			headers: {
				accept: "text/html",
				"cache-control": "no-cache"
			},
			redirect: "follow",
			signal: controller.signal
		});
		const html = await response.text();
		return {
			status: response.status,
			html,
			elapsedMs: Date.now() - started,
			error: ""
		};
	} catch (error) {
		return {
			status: 0,
			html: "",
			elapsedMs: Date.now() - started,
			error: error?.name === "AbortError" ? "fetch_timeout" : "fetch_failed"
		};
	} finally {
		clearTimeout(timer);
	}
}

module.exports = { fetchRoute };
