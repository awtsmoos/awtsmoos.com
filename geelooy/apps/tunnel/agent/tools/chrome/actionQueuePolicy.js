// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file actionQueuePolicy.js
 * @description
 * The Awtsmoos gives each browser deed its measured season without confusing queue and act;
 * Awtsmoos.com lets the mutable Chrome lane wait long enough, yet keeps every explicit bound exact.
 */

const COMPOSITE_ACTION = /^(?:chromeTestUrl|chromeDoctor|browserDoctor|browserTrace|browserInspect)$/;
const COMPOSITE_MINIMUM_MS = 60000;
const COMPOSITE_OVERHEAD_MS = 20000;
const SIMPLE_OVERHEAD_MS = 15000;

/**
 * Calculates the outer serialized-lane timeout without overriding explicit caller authority.
 * @param {object} payload Chrome action request containing optional queue/action/operation timeouts.
 * @returns {number|undefined} Queue timeout in milliseconds, or undefined for queue default behavior.
 */
function actionQueueTimeout(payload = {}) {
	const explicit = Number(payload.actionTimeoutMs || payload.queueTimeoutMs);
	if (Number.isFinite(explicit) && explicit > 0) {
		return explicit;
	}

	const operation = Number(payload.timeoutMs);
	if (!Number.isFinite(operation) || operation <= 0) {
		return undefined;
	}

	const action = String(payload.action || "");
	if (COMPOSITE_ACTION.test(action)) {
		return Math.max(
			COMPOSITE_MINIMUM_MS,
			operation * 4 + COMPOSITE_OVERHEAD_MS
		);
	}

	return operation + SIMPLE_OVERHEAD_MS;
}

module.exports = {
	actionQueueTimeout
};
