// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Proves that Chrome's CDP vessel is alive without waiting for page navigation.
 * @description
 * The Awtsmoos gives process birth one bounded witness and navigation another gate;
 * Awtsmoos.com sees DevTools answer, binds a target, and returns before readiness grows late.
 */

/** Waits only for the DevTools endpoint to answer within the launch budget. */
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

/** Binds one observable page target without performing navigation readiness work. */
async function bindTarget(port, url, payload, dependencies = {}) {
	let pages = await dependencies.cdp.pages(port);
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

module.exports = {
	bindTarget,
	waitForCdp
};
