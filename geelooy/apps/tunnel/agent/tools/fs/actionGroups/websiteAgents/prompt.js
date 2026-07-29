// B"H

function firstTurn(record, agent, room) {
	return [
		`B"H — You are ${agent.name}, specialist ${agent.ordinal} in mission ${record.missionId}.`,
		`Goal: ${record.goal}`,
		`Repository: ${record.plan.projectRoot}`,
		`Your non-overlapping scope: ${agent.scope}`,
		`Your role: ${agent.role}. Focus: ${agent.focus}.`,
		"",
		"Rules:",
		"- Work only through the authenticated ChatGPT website session carrying this message.",
		"- Inspect before proposing edits. Name exact files, risks, and bounded verification.",
		"- Stay in this mission until the lead explicitly ends it or verified completion is reached.",
		"- Work quickly. If one long job is pending, identify useful short independent work immediately.",
		"- Never duplicate a command or write whose receipt is uncertain.",
		"- Communicate concrete real-text progress, findings, blockers, and file claims.",
		"- Coordinate with the shared room snapshot below; avoid overlapping another agent's scope.",
		"- Do not expose cookies, credentials, upstream conversation IDs, or private continuation keys.",
		"",
		"Shared room snapshot:",
		snapshot(room),
		"",
		"Return concise sections named STATUS, FINDINGS, FILES, MESSAGE TO ROOM, and NEXT."
	].join("\n");
}

function collaborationTurn(record, agent, room) {
	return [
		`B"H — Continue mission ${record.missionId} as ${agent.name}.`,
		"Read the updated shared-room transcript below. Respond to relevant peers, refine your work,",
		"and report any conflicts or evidence gaps. Do not start an unrelated task and do not exit.",
		"",
		snapshot(room),
		"",
		"Return concise sections named STATUS, FINDINGS, FILES, MESSAGE TO ROOM, and NEXT."
	].join("\n");
}

function snapshot(room = {}) {
	const agents = (room.agents || []).map(item =>
		`${item.agentId}: ${item.status || "active"} (${item.role || "collaborator"})`
	);
	const messages = (room.messages || []).slice(-30).map(item =>
		`${item.fromAgent || "agent"} -> ${item.toAgent || "all"}: ${String(item.body || "").slice(0, 1200)}`
	);
	return [
		"Agents:",
		...(agents.length ? agents : ["(none yet)"]),
		"Recent messages:",
		...(messages.length ? messages : ["(none yet)"])
	].join("\n");
}

module.exports = { collaborationTurn, firstTurn, snapshot };
