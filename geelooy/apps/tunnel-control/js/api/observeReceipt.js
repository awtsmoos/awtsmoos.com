// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Observes async tunnel control receipts until the device answers.
 * @description
 * The Awtsmoos relay waits only a short inline window (~750ms) for a device.
 * Slower deeds return a durable control-request receipt (action
 * "tunnelRequestPending") — the deed is accepted, not finished. The client
 * must observe the same request via retryAction until the terminal
 * TUNNEL_RESPONSE lands; returning the receipt itself reads as empty data.
 * Correlation mismatches are transient relay cross-talk: re-observe, never
 * re-dispatch. Command deeds are exempt: their callers own the job handle.
 */

const OBSERVE_EXEMPT = new Set([
	"command", "commandRun", "commandStart", "shellCommand"
]);

/**
 * @description Tells whether an envelope is a pending control receipt.
 * @param {object} result - A tunnel response envelope.
 * @returns {boolean} True while the device still owes the real answer.
 */
export function isPendingReceipt(result) {
	if (!result || typeof result !== "object") return false;
	if (result.type === "TUNNEL_RESPONSE") return false;
	if (!result.controlRequestId) return false;
	return result.action === "tunnelRequestPending" ||
		result.pending === true ||
		result.receiptType === "control_request";
}

/**
 * @description Observes a pending receipt until its terminal response.
 * @param {object} first - The first envelope returned for the deed.
 * @param {object} deps - Observation dependencies.
 * @param {Function} deps.postObserve - Sends one retryAction observation.
 * @param {string} deps.action - The originally requested action.
 * @param {number} [deps.deadlineMs] - Total observation budget.
 * @param {number} [deps.intervalMs] - Delay between observations.
 * @returns {Promise<object>} The terminal envelope, or a timeout envelope.
 */
export async function observePendingReceipt(first, deps = {}) {
	const { postObserve, action } = deps;
	if (!isPendingReceipt(first) || typeof postObserve !== "function") {
		return first;
	}
	if (OBSERVE_EXEMPT.has(action)) return first;
	const deadlineMs = deps.deadlineMs || 90000;
	const intervalMs = deps.intervalMs || 1200;
	const body = {
		...(first.observeWith || first.retryPayload || {}),
		action: "retryAction",
		controlRequestId: first.controlRequestId
	};
	const deadline = Date.now() + deadlineMs;
	let last = first;
	while (Date.now() < deadline) {
		await new Promise(resolve => setTimeout(resolve, intervalMs));
		let next;
		try {
			next = await postObserve(body);
		} catch {
			continue;
		}
		if (!next || typeof next !== "object") continue;
		if (next.error === "tunnel_response_correlation_mismatch") continue;
		last = next;
		if (next.type === "TUNNEL_RESPONSE" || next.terminal === true) {
			return next;
		}
		if (!isPendingReceipt(next)) return next;
	}
	return {
		...last,
		ok: false,
		error: "tunnel_request_timeout",
		message: "The tunnel accepted the request but did not answer in time."
	};
}
