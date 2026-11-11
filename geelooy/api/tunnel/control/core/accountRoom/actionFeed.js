// B"H
"use strict";
const Service = require("./service.js");

/**
 * @file Every meaningful tunnel deed becomes a line in the account room.
 * The Awtsmoos lets the owner watch every shliach's hands in real time:
 * reads, writes, commands and deploys appear, attributed to the exact
 * authenticated agent identity that performed them, while pure transport
 * (receipt observation, output paging, status polls) stays silent so the
 * room carries actions, not machinery.
 */
const SKIP = new Set([
	"retryAction", "asyncTaskStatus", "asyncTaskWait", "asyncTaskOutputPage",
	"commandStatus", "commandJobOutputPage", "actionHistoryGet", "payloadEcho"
]);
const lastByKey = new Map();

function targetOf(payload = {}) {
	if (payload.action === "commandStart" || payload.action === "commandRun" ||
		payload.action === "command") {
		return String(payload.command || "").slice(0, 120);
	}
	return String(payload.path || payload.cwd || payload.url || "").slice(0, 200);
}

function record(identity = {}, payload = {}, ok = true) {
	try {
		const deed = String(payload.action || "");
		if (!deed || SKIP.has(deed)) return;
		const accountId = identity.accountId || identity.userId;
		if (!accountId) return;
		const agentId = String(payload.logicalAgentId ||
			`agent:${accountId}:default`).slice(0, 160);
		const agentSessionId = String(payload.agentSessionId ||
			"session:action-feed").slice(0, 180);
		const deviceId = String(payload.tunnelName || "auto").slice(0, 180);
		const target = targetOf(payload);
		const throttleKey = `${accountId}|${agentSessionId}|${deed}|${target}`;
		const now = Date.now();
		if (now - (lastByKey.get(throttleKey) || 0) < 1500) return;
		lastByKey.set(throttleKey, now);
		if (lastByKey.size > 2000) lastByKey.clear();
		const actor = {
			clientId: identity.clientId || identity.kind || "authenticated",
			kind: identity.kind || "authenticated"
		};
		Service.recordAction(accountId, actor, {
			agentId,
			agentSessionId,
			deviceId,
			name: agentId,
			operation: `${deed} via tunnel`,
			message: `${deed}${target ? " " + target : ""}${ok ? "" : " — FAILED"}`,
			clientMessageId: String(payload.controlRequestId ||
				`feed-${now}-${Math.random().toString(36).slice(2, 10)}`).slice(0, 130),
			kind: "action",
			detail: { deed, target, device: deviceId, ok: ok !== false }
		});
	} catch (error) { /* the room never breaks a deed */ }
}

module.exports = { record };
