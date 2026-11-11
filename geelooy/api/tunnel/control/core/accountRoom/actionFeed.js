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

const lastFailByKey = new Map();

function isPendingReceipt(response) {
	return Boolean(response && response.controlRequestId &&
		response.type !== "TUNNEL_RESPONSE");
}

function isTerminalResponse(response) {
	return Boolean(response && response.type === "TUNNEL_RESPONSE");
}

function record(identity = {}, payload = {}, ok = true, response = null) {
	try {
		const deed = String(payload.action || "");
		if (!deed) return;
		const accountId = identity.accountId || identity.userId;
		if (!accountId) return;
		// Observation deeds stay silent EXCEPT when one delivers the terminal
		// outcome of a receipt-pending deed: that outcome is the room's truth
		// about the original deed and must be recorded as its final word.
		if (SKIP.has(deed)) {
			if (deed === "retryAction" && isTerminalResponse(response)) {
				recordOutcome(identity, payload, response, accountId);
			}
			return;
		}
		const agentId = String(payload.logicalAgentId ||
			`agent:${accountId}:default`).slice(0, 160);
		const agentSessionId = String(payload.agentSessionId ||
			"session:action-feed").slice(0, 180);
		const deviceId = String(payload.tunnelName || "auto").slice(0, 180);
		const target = targetOf(payload);
		const pending = isPendingReceipt(response);
		const throttleKey = `${accountId}|${agentSessionId}|${deed}|${target}`;
		const now = Date.now();
		if (now - (lastByKey.get(throttleKey) || 0) < 1500) return;
		// A retry-looping client must not flood the room with the same
		// failure: identical failures collapse to one entry per minute.
		if (ok === false && !pending) {
			if (now - (lastFailByKey.get(throttleKey) || 0) < 60000) return;
			lastFailByKey.set(throttleKey, now);
			if (lastFailByKey.size > 2000) lastFailByKey.clear();
		}
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
			message: `${deed}${target ? " " + target : ""}${pending ? " — pending" : ok ? "" : " — FAILED"}`,
			clientMessageId: String((pending && response.controlRequestId) ||
				payload.controlRequestId ||
				`feed-${now}-${Math.random().toString(36).slice(2, 10)}`).slice(0, 130),
			kind: "action",
			detail: { deed, target, device: deviceId, ok: ok !== false, pending }
		});
	} catch (error) { /* the room never breaks a deed */ }
}

function recordOutcome(identity, payload, response, accountId) {
	const controlRequestId = String(payload.controlRequestId ||
		response.controlRequestId || "").slice(0, 130);
	if (!controlRequestId) return;
	const deed = String(response.actualAction || response.action || "deed");
	const target = String(response.path || response.cwd || "").slice(0, 200);
	const ok = response.ok !== false;
	const agentId = String(payload.logicalAgentId ||
		`agent:${accountId}:default`).slice(0, 160);
	const agentSessionId = String(payload.agentSessionId ||
		"session:action-feed").slice(0, 180);
	const deviceId = String(payload.tunnelName || "auto").slice(0, 180);
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
		clientMessageId: `${controlRequestId}:outcome`,
		kind: "action",
		detail: { deed, target, device: deviceId, ok, final: true, outcomeOf: controlRequestId }
	});
}

module.exports = { record };
