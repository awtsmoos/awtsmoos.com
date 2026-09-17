//B"H // Boruch Hashem // Blessed is He

const Sessions = require("../../../mission/agentSessionRegistry.js");
const SessionContinuation = require("../../../mission/agentSessionContinuation.js");

const NON_TERMINAL = new Set(["queued", "running", "waiting_for_login"]);
const FAILED = new Set(["failed", "claim_conflict", "awaiting_recovery"]);

/**
 * @file Carries terminal website Shluchim into durable Mission continuation.
 * @description
 * A browser chat is a passing vessel while Mission debt is durable light. When the vessel ends,
 * Awtsmoos.com closes only that session and asks the lease-fenced continuation engine whether
 * another visible Shliach must arise; when debt is green, that same engine lets the chain rest.
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

/** Maps browser-runner terminal truth to disposable-session truth. */
function sessionStatus(record = {}) {
	if (record.status === "failed") return "exhausted";
	const agents = record.agents || [];
	if (agents.some(agent => FAILED.has(String(agent.status || "")))) return "exhausted";
	if (record.status === "cancelled") return "ended";
	if (record.status === "complete") return "ended";
	if (record.status === "needs_attention" && agents.every(agent => agent.status === "complete")) return "ended";
	if (record.status === "needs_attention") return "exhausted";
	return "";
}

/** Builds a compact no-op receipt for lifecycle states that must not mutate anything. */
function skipped(reason) {
	return { ok: true, skipped: true, reason };
}

module.exports = { FAILED, NON_TERMINAL, sessionStatus, settle };
