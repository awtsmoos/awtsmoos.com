//B"H
//Boruch Hashem
//Blessed be He
/**
 * @module RouteAuditNavigation
 * @description
 * Separates CDP command timing from browser truth. Route changes use Page.navigate;
 * repeated viewport audits of the same URL use Page.reload, avoiding a macOS headless
 * deadlock while still requiring a new document epoch before timeout recovery passes.
 */

const RECOVERY_WINDOW_MS = 3000;
const RECOVERY_INTERVAL_MS = 200;

/**
 * Navigates or reloads one audit URL with browser-proven timeout recovery.
 * @param {object} client Connected CDP client.
 * @param {string} targetUrl Exact requested URL.
 * @returns {Promise<object>} Native result or recovered navigation testimony.
 */
export async function navigateForAudit(client, targetUrl) {
	const before = await locationEvidence(client).catch(() => null);
	const reloading = Boolean(before && sameUrl(before.href, targetUrl));
	const method = reloading ? "Page.reload" : "Page.navigate";
	const params = reloading ? { ignoreCache: true } : { url: targetUrl };
	try {
		return await client.send(method, params);
	} catch (error) {
		if (!String(error?.message || error).includes(method)) throw error;
		const evidence = await awaitNavigationEvidence(client, targetUrl, reloading ? before?.timeOrigin : null);
		if (!evidence) throw error;
		return { recoveredFromTimeout: true, method, ...evidence };
	}
}

/** @param {object} client CDP client. @param {string} targetUrl Target URL. @param {number|null} priorEpoch Previous document epoch. */
async function awaitNavigationEvidence(client, targetUrl, priorEpoch = null) {
	const deadline = Date.now() + RECOVERY_WINDOW_MS;
	while (Date.now() < deadline) {
		const evidence = await locationEvidence(client).catch(() => null);
		const changed = priorEpoch === null || evidence?.timeOrigin !== priorEpoch;
		if (evidence && changed && sameUrl(evidence.href, targetUrl)) return evidence;
		await delay(RECOVERY_INTERVAL_MS);
	}
	return null;
}

/** @param {object} client CDP client. @returns {Promise<object|null>} Current URL, state, and document epoch. */
async function locationEvidence(client) {
	const result = await client.send("Runtime.evaluate", {
		expression: "({href:location.href,readyState:document.readyState,timeOrigin:performance.timeOrigin})",
		returnByValue: true
	}, 1000);
	return result.result?.value || null;
}

/** @param {string} left Observed URL. @param {string} right Requested URL. @returns {boolean} */
function sameUrl(left, right) {
	try {
		return new URL(left).href === new URL(right).href;
	} catch {
		return false;
	}
}

/** @param {number} milliseconds Delay duration. @returns {Promise<void>} */
function delay(milliseconds) {
	return new Promise(resolve => setTimeout(resolve, milliseconds));
}
