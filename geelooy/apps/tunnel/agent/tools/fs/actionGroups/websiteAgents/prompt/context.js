// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Renders bounded durable context without relying on conversational continuity.
 * @description
 * The Awtsmoos carries peers, claims, handoffs, and prior evidence into one prompt.
 * This snapshot is only a starting map; agents must refresh it through room and file
 * tools after the browser vessel closes.
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
	const entries = (record.agents || [])
		.filter(agent => agent.id !== currentAgent.id)
		.map(agent => {
			const outcome = agent.lastOutcome || {};
			return [
				`${agent.id} [${agent.status || "unknown"}] scope=${agent.scope || "."}`,
				`NEXT=${clip(outcome.next || "none recorded", 600)}`,
				`FINDINGS=${clip(outcome.findings || agent.lastUpdate || "none recorded", 600)}`
			].join(" | ");
		});
	return entries.length ? entries.join("\n") : "(no peer handoffs recorded yet)";
}

function snapshot(room = {}, agent = {}) {
	const agents = (room.agents || []).map(item =>
		`${item.agentId}: ${item.status || "active"} (${item.role || "collaborator"})`
	);
	const cursor = Date.parse(agent.roomCursorAt || 0);
	const messages = (room.messages || [])
		.filter(item => addressed(item, agent) && Date.parse(item.at || 0) > cursor)
		.slice(-50)
		.map(item =>
			`${item.fromAgent || "agent"} -> ${item.toAgent || "all"} [${item.kind || "chat"}]: ${clip(item.body, 1200)}`
		);
	const claims = (room.activeClaims || []).slice(-30).map(item =>
		`${item.agentId}: ${(item.filesToTouch || []).join(", ") || item.title}`
	);
	return [
		"Agents:", ...(agents.length ? agents : ["(none yet)"]),
		"Active claims:", ...(claims.length ? claims : ["(none)"]),
		"New messages:", ...(messages.length ? messages : ["(none; call missionRoomInbox after joining)"])
	].join("\n");
}

function addressed(item, agent) {
	return !item.toAgent || ["all", "any_agent", agent.id].includes(item.toAgent);
}

function clip(value, maximum) {
	return String(value || "").slice(0, maximum);
}

module.exports = { durableContext, snapshot, teamHandoffContext };
