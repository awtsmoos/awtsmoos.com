//B"H // Boruch Hashem // Blessed is He

const Sessions = require("../../../mission/agentSessionRegistry.js");
const SessionContinuation = require("../../../mission/agentSessionContinuation.js");

const NON_TERMINAL = new Set(["queued", "running", "waiting_for_login"]);
const FAILED = new Set(["failed", "claim_conflict", "awaiting_recovery"]);

/**
 * @file Carries terminal website Shluchim into durable Mission continuation.
 * @description
 * A browser chat is a passing vessel while Mission debt is durable light. When that vessel ends,
 * Awtsmoos.com closes only the disposable agent session, then asks the lease-fenced continuation
 * engine whether another visible Shliach must arise. The Awtsmoos renews the messenger without
 * confusing a vanished conversation with completion of the deed the Mission still carries.
 */

/**
 * Settle one dispatcher session after its website-runner record reaches terminal truth.
 * @param {object} config Trusted Tunnel configuration and durable Mission storage context.
 * @param {object} [record={}] Persisted website-runner record whose status was already settled.
 * @param {object} [options={}] Injectable dependencies and continuation testimony for tests/runtime.
 * @param {object} [options.sessions] Optional agent-session registry compatible with `close`.
 * @param {object} [options.continuationBridge] Optional bridge compatible with `afterClose`.
 * @param {object} [options.env] Optional environment testimony forwarded to continuation.
 * @param {Function} [options.now] Optional deterministic clock forwarded to continuation.
 * @param {string} [options.owner] Optional continuation lease owner identity.
 * @param {Function} [options.runContinuation] Optional continuation runner override for verification.
 * @returns {Promise<object>} Session-close and continuation receipt, or a bounded skip receipt.
 * @throws {Error} Propagates registry or continuation failures so callers retain failure testimony.
 */
async function settle(config, record = {}, options = {}) {
	const dispatcher = record.plan?.dispatcherSession;
	if (!dispatcher?.agentSessionId || dispatcher.autonomous !== true) {
		return skipped("not_dispatcher_session");
	}
	if (NON_TERMINAL.has(String(record.status || ""))) {
		return skipped("website_session_still_active");
	}

	const status = sessionStatus(record);
	if (!status) {
		return skipped("website_session_not_terminal");
	}

	const sessions = options.sessions || Sessions;
	const continuationBridge = options.continuationBridge || SessionContinuation;
	const session = await sessions.close(config, {
		agentSessionId: dispatcher.agentSessionId
	}, status);

	if (!session) {
		return {
			ok: false,
			reason: "dispatcher_session_not_found",
			agentSessionId: dispatcher.agentSessionId,
			status
		};
	}

	const continuation = await continuationBridge.afterClose(config, session, {
		env: options.env,
		now: options.now,
		owner: options.owner,
		runContinuation: options.runContinuation,
		transport: "shared_shliach"
	});

	return {
		ok: continuation?.ok !== false,
		agentSessionId: dispatcher.agentSessionId,
		status,
		websiteMissionId: record.id,
		continuation
	};
}

/**
 * Map website-runner terminal truth onto disposable agent-session truth.
 * @param {object} [record={}] Website-runner state containing mission and child-agent testimony.
 * @returns {"ended"|"exhausted"|""} Terminal session status, or empty when not terminal.
 */
function sessionStatus(record = {}) {
	if (record.status === "failed") {
		return "exhausted";
	}

	const agents = record.agents || [];
	if (agents.some(agent => FAILED.has(String(agent.status || "")))) {
		return "exhausted";
	}
	if (record.status === "cancelled" || record.status === "complete") {
		return "ended";
	}
	if (record.status === "needs_attention") {
		return agents.every(agent => agent.status === "complete") ? "ended" : "exhausted";
	}
	return "";
}

/**
 * Build an explicit no-op receipt for lifecycle states that must not mutate durable state.
 * @param {string} reason Stable reason explaining why settlement was intentionally skipped.
 * @returns {{ok: true, skipped: true, reason: string}} Bounded non-mutation testimony.
 */
function skipped(reason) {
	return {
		ok: true,
		skipped: true,
		reason
	};
}

module.exports = { FAILED, NON_TERMINAL, sessionStatus, settle };
