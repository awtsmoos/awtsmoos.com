//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file Renders bounded durable peer context from the sequenced Mission Room inbox.
 * @description
 * The Awtsmoos carries only speech addressed to this Shliach while preserving sender and route;
 * Awtsmoos.com keeps raw room chronology durable, but the prompt receives the exact unread note.
 */
function durableContext(agent = {}) {
	const outcome = agent.lastOutcome || {};
	return [
		`Previous status: ${outcome.status || agent.status || "unknown"}.`,
		`Previous findings: ${clip(outcome.findings || agent.lastUpdate || "none recorded", 3000)}`,
		`Previous files/evidence: ${(outcome.files || []).join(", ") || "none recorded"}.`,
		`Recorded NEXT: ${outcome.next || "inspect current state and finish every unfinished item in scope"}.`
	].join("\n");
}

function teamHandoffContext(record = {}, currentAgent = {}) {
	const entries = (record.agents || []).filter(agent => agent.id !== currentAgent.id).map(agent => {
		const outcome = agent.lastOutcome || {};
		return `${agent.id} [${agent.status || "unknown"}] scope=${agent.scope || "."} | ` +
			`NEXT=${clip(outcome.next || "none recorded", 600)} | ` +
			`FINDINGS=${clip(outcome.findings || agent.lastUpdate || "none recorded", 600)}`;
	});
	return entries.length ? entries.join("\n") : "(no peer handoffs recorded yet)";
}

function snapshot(room = {}, agent = {}) {
	const agents = (room.agents || []).map(item =>
		`${item.agentId}: ${item.status || "active"} (${item.role || "collaborator"})`);
	const messages = (room.turnInbox?.messages || []).slice(-50).map(renderMessage);
	const claims = (room.claims || room.activeClaims || []).filter(item => item.status !== "released")
		.slice(-30).map(item => `${item.agentId}: ${(item.files || item.filesToTouch || []).join(", ") || item.title}`);
	const next = room.turnInbox?.mustCallNext;
	return [
		`Inbox cursor: ${room.turnInbox?.cursorBefore || 0} -> ${room.turnInbox?.cursorAfter || 0}.`,
		"Agents:", ...(agents.length ? agents : ["(none yet)"]),
		"Active claims:", ...(claims.length ? claims : ["(none)"]),
		"Unread messages:", ...(messages.length ? messages : ["(none)"]),
		...(next ? ["Required room response:", JSON.stringify(next)] : [])
	].join("\n");
}

function renderMessage(item = {}) {
	const route = item.toAgents?.length
		? item.toAgents.join(",")
		: item.toSpawnGroup ? `spawn:${item.toSpawnGroup}` : item.toAgent || "all";
	const response = item.requiresResponse ? " REPLY_REQUIRED" : "";
	return `${item.fromAgent || "agent"} -> ${route} [${item.kind || "chat"}]${response} ` +
		`${item.subject ? `${clip(item.subject, 180)}: ` : ""}${clip(item.body, 1600)}`;
}

function clip(value, maximum) {
	return String(value || "").slice(0, maximum);
}

module.exports = { durableContext, snapshot, teamHandoffContext };
