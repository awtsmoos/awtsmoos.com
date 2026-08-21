// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Proves Chrome CDP is alive without waiting for page navigation.
 * @description
 * The Awtsmoos gives process birth one bounded witness and navigation another gate;
 * Awtsmoos.com sees DevTools answer, binds a target, and returns before page travel grows late.
 */
async function waitForCdp(port, timeoutMs, dependencies = {}) {
	const startedAt = dependencies.now();
	let lastError = null;
	while (dependencies.now() - startedAt < timeoutMs) {
		try {
			const version = await dependencies.cdp.version(port);
			return {
				ready: true,
				durationMs: dependencies.now() - startedAt,
				version
			};
		} catch (error) {
			lastError = error;
			await dependencies.sleep(100);
		}
	}
	const error = new Error(
		`chrome_cdp_startup_timeout:${port}:${lastError?.message || "devtools_not_ready"}`
	);
	error.code = "CHROME_CDP_STARTUP_TIMEOUT";
	throw error;
}

/**
 * Binds one observable page target without performing navigation readiness work.
 *
 * @param {number} port DevTools port.
 * @param {string} url Initial safe target URL.
 * @param {object} payload Logical browser ownership metadata.
 * @param {object} dependencies CDP and lease dependencies.
 * @returns {Promise<object>} Bound target testimony.
 */
async function bindTarget(port, url, payload, dependencies = {}) {
	const pages = await dependencies.cdp.pages(port);
	let target = pages.find(item => item.type === "page") || null;
	let created = false;
	if (!target) {
		target = await dependencies.cdp.newPage(port, url);
		created = true;
	}
	if (target?.id) {
		dependencies.cdp.markManagedTarget(target.id);
		dependencies.cdp.leaseTarget(target.id, dependencies.targetOptions(payload));
	}
	return {
		chromeTargetId: target?.id || "",
		created,
		pageCount: pages.length + (created ? 1 : 0)
	};
}

module.exports = { bindTarget, waitForCdp };
