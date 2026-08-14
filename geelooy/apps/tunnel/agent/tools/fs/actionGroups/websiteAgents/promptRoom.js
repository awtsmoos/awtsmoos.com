// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Renders durable room state and inherited handoffs into website prompts.
 * @description
 * The Awtsmoos joins separate shluchim through one remembered room. Awtsmoos.com
 * exposes current claims, delegations, peer status, and only new addressed messages,
 * so closed browser tabs never sever the mission's living collaboration thread.
 */
function snapshot(room = {}, agent = {}) {
	const agents = (room.agents || []).map(item =>
		`${item.agentId}: ${item.status || "active"} (${item.role || "collaborator"})`
	);
	const cursor = Date.parse(agent.roomCursorAt || 0);
	const messages = (room.messages || [])
		.filter(item => addressed(item, agent) && Date.parse(item.at || 0) > cursor)
		.slice(-50)
		.map(item => `${item.fromAgent || "agent"} -> ${item.toAgent || "all"}: ${trim(item.body, 1200)}`);
	const claims = (room.activeClaims || []).slice(-30).map(item =>
		`${item.agentId}: ${(item.filesToTouch || []).join(", ") || item.title}`
	);
	const delegations = (room.openDelegations || []).slice(-30).map(item =>
		`${item.toAgent}: ${item.title}`
	);
	return [
		"Agents:",
		...(agents.length ? agents : ["(none yet)"]),
		"Active claims:",
		...(claims.length ? claims : ["(none)"]),
		"Open delegations:",
		...(delegations.length ? delegations : ["(none)"]),
		"New messages:",
		...(messages.length ? messages : ["(none since your previous turn)"])
	].join("\n");
}

function teamHandoffContext(record = {}, currentAgent = {}) {
	const entries = (record.agents || [])
		.filter(agent => agent.id !== currentAgent.id)
		.map(agent => {
			const outcome = agent.lastOutcome || {};
			return [
				`${agent.id} [${agent.status || "unknown"}] scope=${agent.scope || "."}`,
				`NEXT=${trim(outcome.next || "none recorded", 600)}`,
				`FINDINGS=${trim(outcome.findings || agent.lastUpdate || "none recorded", 600)}`
			].join(" | ");
		});
	return entries.length ? entries.join("\n") : "(no peer handoffs recorded yet)";
}

function durableContext(agent = {}) {
	const outcome = agent.lastOutcome || {};
	return [
		`Previous status: ${outcome.status || agent.status || "unknown"}.`,
		`Previous findings: ${trim(outcome.findings || agent.lastUpdate || "none recorded", 3000)}`,
		`Previous files/evidence: ${(outcome.files || []).join(", ") || "none recorded"}.`,
		`Recorded NEXT: ${outcome.next || "inspect current state and finish every unfinished item in scope"}.`
	].join("\n");
}

function addressed(item, agent) {
	return !item.toAgent || item.toAgent === "all" ||
		item.toAgent === "any_agent" || item.toAgent === agent.id;
}

function trim(value, maximum) {
	return String(value || "").slice(0, maximum);
}

module.exports = {
	durableContext,
	snapshot,
	teamHandoffContext
};
