// B"H

function firstTurn(record, agent, room) {
	return [
		`B"H — You are ${agent.name}, specialist ${agent.ordinal} in mission ${record.missionId}.`,
		`Stable agent session: ${agent.agentSessionId}.`,
		`Goal: ${record.goal}`,
		`Repository: ${record.plan.projectRoot}`,
		`Your claimed scope: ${agent.scope}`,
		`Your role: ${agent.role}. Focus: ${agent.focus}.`,
		"",
		rules(),
		"",
		"At the start, state your concrete plan and file claim in MESSAGE TO ROOM.",
		"Shared room inbox:",
		snapshot(room, agent),
		"",
		responseContract()
	].join("\n");
}

function collaborationTurn(record, agent, room) {
	return [
		`B"H — Continue mission ${record.missionId} as ${agent.name}.`,
		`Stable agent session: ${agent.agentSessionId}. Keep the same scoped claim: ${agent.scope}.`,
		"Read every new room item below, answer relevant peers, teach useful findings,",
		"preserve unfinished work, and keep working until verified completion.",
		"If a long job is pending, perform short independent checks instead of idling.",
		"",
		"New shared room inbox:",
		snapshot(room, agent),
		"",
		responseContract()
	].join("\n");
}

function unfinishedTurn(record, agent, room) {
	const continuity = agent.conversationKey
		? "Continue the exact existing conversation and finish its recorded NEXT work."
		: "No prior continuation is available. Inspect the shared record, find all unfinished work in your scope, and finish it.";
	return [
		`B"H — Recovery/continuation turn for ${agent.name} in mission ${record.missionId}.`,
		`Stable agent session: ${agent.agentSessionId}.`,
		continuity,
		`Goal: ${record.goal}`,
		`Scope: ${agent.scope}`,
		"Do not repeat a completed write or command. Verify current repository state first.",
		"Do not declare completion while tests, conflicts, blockers, or explicit NEXT work remain.",
		"",
		"Shared room inbox:",
		snapshot(room, agent),
		"",
		responseContract()
	].join("\n");
}

function rules() {
	return [
		"Rules:",
		"- Use only the authenticated ChatGPT website session carrying this message.",
		"- Inspect before proposing edits. Name exact files, risks, and bounded verification.",
		"- Stay in this mission until the lead ends it or verified completion is reached.",
		"- Work quickly; do useful short work while long-running jobs remain pending.",
		"- Never duplicate a command, write, or website submission whose receipt is uncertain.",
		"- Publish concise actions, decisions, progress, blockers, handoffs, and claims—not hidden chain-of-thought.",
		"- Teach peers through MESSAGE TO ROOM and avoid overlapping another agent's claim.",
		"- Do not expose cookies, credentials, upstream conversation IDs, or private continuation keys."
	].join("\n");
}

function responseContract() {
	return [
		"Return concise sections named STATUS, FINDINGS, FILES, MESSAGE TO ROOM, and NEXT.",
		"STATUS must be either COMPLETE (only with verification) or UNFINISHED.",
		"NEXT must say none only when no scoped work remains."
	].join("\n");
}

function snapshot(room = {}, agent = {}) {
	const agents = (room.agents || []).map(item =>
		`${item.agentId}: ${item.status || "active"} (${item.role || "collaborator"})`
	);
	const cursor = Date.parse(agent.roomCursorAt || 0);
	const messages = (room.messages || [])
		.filter(item => {
			const addressed = !item.toAgent || item.toAgent === "all" ||
				item.toAgent === "any_agent" || item.toAgent === agent.id;
			return addressed && Date.parse(item.at || 0) > cursor;
		})
		.slice(-50)
		.map(item =>
			`${item.fromAgent || "agent"} -> ${item.toAgent || "all"}: ${String(item.body || "").slice(0, 1200)}`
		);
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

module.exports = {
	collaborationTurn,
	firstTurn,
	snapshot,
	unfinishedTurn
};
