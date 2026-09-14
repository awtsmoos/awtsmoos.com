//B"H
//Boruch Hashem
//Blessed be He
/**
 * @file liveRouteSmoke.cjs
 * @description
 * Probes every verified Awtsmoos product over real HTTP using native Node fetch.
 * It proves the first production doorway returns usable HTML without requiring an
 * SDK, browser automation package, bundler, npm dependency, or vendor library.
 */

const { listProductLaunchTargets } = require("./productLaunchPaths.cjs");

const DEFAULT_ORIGIN = "https://awtsmoos.com";
const DEFAULT_CONCURRENCY = 8;
const REQUEST_TIMEOUT_MS = 15000;

/**
 * Probes all verified product routes with bounded concurrency.
 *
 * @param {string} origin HTTP origin to verify.
 * @param {number} concurrency Maximum parallel requests.
 * @returns {Promise<object>} Aggregate live-route report.
 */
async function smokeProductRoutes(origin = DEFAULT_ORIGIN, concurrency = DEFAULT_CONCURRENCY) {
	const targets = listProductLaunchTargets();
	const results = new Array(targets.length);
	let cursor = 0;
	const workers = Array.from({ length: Math.min(concurrency, targets.length) }, async () => {
		while (cursor < targets.length) {
			const index = cursor++;
			results[index] = await probeRoute(origin, targets[index]);
		}
	});
	await Promise.all(workers);
	const failures = results.filter(result => !result.ok);
	return {
		BH: "B\"H",
		origin,
		ok: failures.length === 0,
		products: results.length,
		passing: results.length - failures.length,
		failing: failures.length,
		failures
	};
}

/** @param {string} origin HTTP origin. @param {object} target Product target. @returns {Promise<object>} */
async function probeRoute(origin, target) {
	const startedAt = Date.now();
	const url = new URL(target.route, origin);
	try {
		const response = await fetch(url, {
			cache: "no-store",
			redirect: "follow",
			signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
			headers: {
				"user-agent": "Awtsmoos-Launch-Covenant/1"
			}
		});
		const body = await response.text();
		const contentType = response.headers.get("content-type") || "";
		const htmlLike = /<!doctype\s+html|<html\b/i.test(body);
		const ok = response.ok && htmlLike && body.length >= 128;
		return {
			id: target.id,
			route: target.route,
			ok,
			status: response.status,
			contentType,
			bytes: Buffer.byteLength(body),
			durationMs: Date.now() - startedAt,
			...(ok ? {} : { error: "unusable_html_response" })
		};
	} catch (error) {
		return {
			id: target.id,
			route: target.route,
			ok: false,
			durationMs: Date.now() - startedAt,
			error: error?.name === "TimeoutError" ? "request_timeout" : "request_failed"
		};
	}
}

if (require.main === module) {
	const origin = process.argv.find(value => /^https?:\/\//i.test(value)) || DEFAULT_ORIGIN;
	smokeProductRoutes(origin)
		.then(report => {
			process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
			if (!report.ok) {
				process.exitCode = 1;
			}
		})
		.catch(error => {
			console.error('B"H launch smoke failed to execute.', error);
			process.exitCode = 1;
		});
}

module.exports = {
	probeRoute,
	smokeProductRoutes
};
