// B"H
// Boruch Hashem
// Blessed is He

const DEFAULT_WAIT_MS = 60000;
const DEFAULT_POLL_MS = 250;

/**
 * @file Waits for durable proof that a real browser prompt was accepted and its owned tab closed.
 * @description
 * The Awtsmoos distinguishes intention from manifestation. Awtsmoos.com therefore
 * refuses to call a child delivered until mission state contains the exact browser
 * receipt produced after composer verification, accepted conversation POST, and close proof.
 */
async function wait(Store, websiteMissionId, childAgentIds = [], options = {}) {
	const deadline = Date.now() + bounded(options.waitMs, DEFAULT_WAIT_MS);
	const pollMs = bounded(options.pollMs, DEFAULT_POLL_MS);
	const ids = [...new Set(childAgentIds.map(String).filter(Boolean))];
	if (!ids.length) return pending([], "no_child_agents_admitted");

	while (Date.now() <= deadline) {
		const snapshot = inspect(Store.read(websiteMissionId), ids);
		if (snapshot.ok || snapshot.failed) return snapshot;
		await delay(pollMs);
	}
	return inspect(Store.read(websiteMissionId), ids, true);
}

/**
 * Inspects durable mission state without performing browser work.
 * @param {object} record Website mission record.
 * @param {string[]} ids Child agent IDs whose first browser delivery is required.
 * @param {boolean} timedOut Whether the bounded wait elapsed.
 * @returns {object} Verified, failed, or pending delivery state.
 */
function inspect(record = {}, ids = [], timedOut = false) {
	const deliveries = ids.map((agentId) => deliveryFor(record, agentId));
	const failed = deliveries.filter((item) => item.failed);
	if (failed.length) {
		return { ok: false, failed: true, state: "browser_delivery_failed", deliveries };
	}
	if (deliveries.length && deliveries.every((item) => item.verified)) {
		return { ok: true, failed: false, state: "browser_delivered", deliveries };
	}
	return pending(deliveries, timedOut ? "browser_delivery_timeout" : "browser_delivery_pending");
}

/** Returns browser receipt evidence for one durable child agent. */
function deliveryFor(record = {}, agentId = "") {
	const agent = (record.agents || []).find((item) => item.id === agentId) || {};
	const event = [...(record.events || [])].reverse().find((item) =>
		item.type === "agent_prompt_dispatched" && item.agentId === agentId
	) || {};
	const responseStatus = Number(event.responseStatus || agent.lastOutcome?.responseStatus || 0);
	const accepted = responseStatus >= 200 && responseStatus < 400;
	const verified = agent.status === "dispatched" &&
		Boolean(agent.submissionAcceptedAt || agent.lastOutcome?.acceptedAt) &&
		agent.lastOutcome?.dispatched === true &&
		event.promptVerified === true &&
		event.tabCloseVerified === true &&
		accepted;
	return {
		agentId,
		status: agent.status || "missing",
		verified,
		failed: ["failed", "claim_conflict", "awaiting_recovery"].includes(agent.status),
		acceptedAt: agent.submissionAcceptedAt || agent.lastOutcome?.acceptedAt || null,
		responseStatus: responseStatus || null,
		promptVerified: event.promptVerified === true,
		tabCloseVerified: event.tabCloseVerified === true,
		error: agent.error || null
	};
}

/** Builds an explicit non-success state; pending is never reported as spawned. */
function pending(deliveries, reason) {
	return { ok: false, failed: false, pending: true, state: reason, deliveries };
}

/** Normalizes bounded positive durations. */
function bounded(value, fallback) {
	const number = Number(value);
	return Number.isFinite(number) && number > 0 ? Math.floor(number) : fallback;
}

/** Awaits one polling interval without blocking the event loop. */
function delay(ms) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

module.exports = { DEFAULT_POLL_MS, DEFAULT_WAIT_MS, deliveryFor, inspect, wait };
