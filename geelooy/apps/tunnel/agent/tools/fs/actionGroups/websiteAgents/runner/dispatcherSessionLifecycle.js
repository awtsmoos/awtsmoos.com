//B"H
//Boruch Hashem
//Blessed be He

const Sessions = require("../../../mission/agentSessionRegistry.js");

const NON_TERMINAL = new Set(["queued", "running", "waiting_for_login"]);
const FAILED = new Set(["failed", "claim_conflict", "awaiting_recovery"]);

/**
 * @file Projects website-mission terminal truth back into the disposable dispatcher session.
 * @description
 * Browser missions may end while durable project missions remain alive. Clean chat endings
 * free a worker slot; failed browser vessels request replacement without failing project truth.
 */
async function settle(config, record = {}) {
	const dispatcher = record.plan?.dispatcherSession;
	if (!dispatcher?.agentSessionId || dispatcher.autonomous !== true) {
		return { ok: true, skipped: true, reason: "not_dispatcher_session" };
	}
	if (NON_TERMINAL.has(String(record.status || ""))) {
		return { ok: true, skipped: true, reason: "website_session_still_active" };
	}
	const status = sessionStatus(record);
	if (!status) {
		return { ok: true, skipped: true, reason: "website_session_not_terminal" };
	}
	const session = await Sessions.close(config, {
		agentSessionId: dispatcher.agentSessionId
	}, status);
	return {
		ok: Boolean(session),
		agentSessionId: dispatcher.agentSessionId,
		status,
		websiteMissionId: record.id
	};
}

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

module.exports = { FAILED, NON_TERMINAL, sessionStatus, settle };
