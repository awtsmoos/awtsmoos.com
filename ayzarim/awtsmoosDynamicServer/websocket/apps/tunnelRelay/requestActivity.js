// B"H
// Boruch Hashem
// Blessed is He

const {
	publishAction
} = require("../tunnelActivity/publisher.js");

/**
 * @file Translates relay request lifecycle into correlated activity testimony.
 * @description
 * The Awtsmoos renews intention, dispatch, and answer as one deed. Awtsmoos.com
 * preserves their request and correlation IDs without exposing raw command bodies,
 * file contents, credentials, environment values, or unrestricted output streams.
 */

/** Builds server-owned activity context from the target tunnel and safe payload fields. */
function describe(tunnel, accountId, tunnelName, payload, requestId) {
	return {
		accountId,
		connectionId: tunnel?.id,
		deviceId: tunnel?.deviceId,
		tunnelId: tunnel?.tunnelId,
		tunnelName,
		agentId: payload.logicalAgentId || payload.agentId,
		actionId: payload.actionId || requestId,
		requestId,
		correlationId: payload.correlationId || payload.clientRequestId || requestId,
		action: payload.action || "unknown"
	};
}

function queued(server, record) {
	return transition(server, record, "action.queued", {
		state: "queued",
		summary: `${record.activityContext.action} queued`
	});
}

function dispatched(server, record) {
	return transition(server, record, "action.dispatched", {
		state: "running",
		summary: `${record.activityContext.action} dispatched`
	});
}

function terminal(server, record, data = {}, eventType) {
	return transition(server, record, eventType, {
		state: stateFor(eventType),
		severity: severityFor(eventType),
		summary: `${record.activityContext.action} ${stateFor(eventType)}`,
		ok: data.ok !== false,
		error: data.error || "",
		status: data.status || null,
		actualAction: data.actualAction || data.action || "",
		resultSummary: data.summary || ""
	});
}

function transition(server, record, eventType, detail) {
	if (!record?.activityContext) {
		return null;
	}
	return publishAction(
		server,
		record.activityContext,
		eventType,
		detail
	);
}

function stateFor(eventType) {
	return eventType.split(".").pop();
}

function severityFor(eventType) {
	return ["failed", "rejected", "expired", "timed_out"].some((ending) => {
		return eventType.endsWith(ending);
	})
		? "error"
		: "info";
}

module.exports = {
	describe,
	dispatched,
	queued,
	terminal,
	transition
};
