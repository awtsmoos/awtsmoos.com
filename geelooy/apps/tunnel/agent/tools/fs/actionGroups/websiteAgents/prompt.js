// B"H

function firstTurn(record, agent, room) {
	return [
		`B"H — You are ${agent.name}, specialist ${agent.ordinal} in mission ${record.missionId}.`,
		`Stable agent session: ${agent.agentSessionId}.`,
		`Goal: ${record.goal}`,
		`Repository: ${record.plan.projectRoot}`,
		`Website vessel: ${record.plan.customGptName || "ChatGPT custom GPT"}.`,
		...(agent.parentAgentId ? [
			`Parent website agent: ${agent.parentAgentId}. Recursive depth: ${Number(agent.depth || 0)}.`,
			`Exact child assignment: ${agent.assignmentPrompt || agent.focus || agent.scope}`
		] : []),
		`Your claimed scope: ${agent.scope}`,
		`Your role: ${agent.role}. Focus: ${agent.focus}.`,
		fanOutInstruction(record),
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
		`Website vessel: ${record.plan.customGptName || "ChatGPT custom GPT"}.`,
		fanOutInstruction(record),
		"Read every new room item below, answer relevant peers, teach useful findings,",
		"preserve unfinished work, and keep working until verified completion.",
		"If your claim is verified, adopt one unclaimed or explicitly handed-off unfinished item before inventing unrelated work.",
		"If a long job is pending, perform short independent checks instead of idling.",
		"",
		"New shared room inbox:",
		snapshot(room, agent),
		"",
		"Durable team handoffs:",
		teamHandoffContext(record, agent),
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
		`Website vessel: ${record.plan.customGptName || "ChatGPT custom GPT"}.`,
		fanOutInstruction(record),
		"Durable prior context:",
		durableContext(agent),
		"Do not repeat a completed write or command. Verify current repository state first.",
		"Do not declare completion while tests, conflicts, blockers, or explicit NEXT work remain.",
		"",
		"Shared room inbox:",
		snapshot(room, agent),
		"",
		"Durable team handoffs:",
		teamHandoffContext(record, agent),
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
		"- When sub-agent tools are available, fan out independent work to bounded single-use helpers; give each one exact scope, evidence, and a return-once handoff contract.",
		"- Do not leave helpers waiting: while one long job runs, start other safe independent work, then collect and persist every helper handoff.",
		"- If your scope is done, help an open unfinished delegation after checking claims; never strand work merely because its first owner stopped.",
		"- Do not expose cookies, credentials, upstream conversation IDs, or private continuation keys."
	].join("\n");
}

function responseContract() {
	return [
		"Return concise sections named STATUS, FINDINGS, FILES, MESSAGE TO ROOM, SPAWN, and NEXT.",
		"MESSAGE TO ROOM must contain concise PLAN, PROGRESS, HANDOFF, and COMPLETION lines so another agent can resume without this conversation.",
		"SPAWN must be exactly one JSON array, optionally inside one json code fence. Use [] when no child is needed.",
		"Each child object must contain only requestId, role, scope, and prompt. requestId is a stable unique lowercase id using a-z, 0-9, dot, underscore, colon, or hyphen.",
		"Example: [{\"requestId\":\"tests.transport-1\",\"role\":\"transport test specialist\",\"scope\":\"geelooy/apps/tunnel/agent/testing\",\"prompt\":\"Inspect the assigned transport tests, implement only the bounded missing coverage, verify it, and return a durable room handoff.\"}]",
		"Every child prompt must assign independent non-overlapping work and require PLAN, PROGRESS, HANDOFF, COMPLETION, evidence, remaining work, and this same SPAWN contract.",
		"Valid accepted requests are executed by the tunnel as real website child agents; they are not advisory suggestions.",
		"A request is not proof a child started. Emit each requestId once; the tunnel owns idempotency, depth/count limits, pacing, and start receipts.",
		"STATUS must be either COMPLETE (only with verification) or UNFINISHED.",
		"NEXT must name the exact resumable next action and evidence location; say none only when no scoped or adopted work remains."
	].join("\n");
}

function fanOutInstruction(record = {}) {
	const policy = record.plan?.subagentPolicy || {};
	const maxHelpers = Number(
		policy.maxSubagentsPerAgent ?? policy.maxHelpersPerAgent ?? 32
	);
	return [
		`Fan-out policy: ${policy.priority || "preferred"}; mode ${policy.mode || "bounded-single-use"}.`,
		`Use at most ${maxHelpers} single-use helpers at once, only for independent scoped work (default 32; hard maximum 96).`,
		"Request website children through SPAWN; never open tabs, resend, or self-start them outside that contract.",
		"The tunnel spaces child starts to prevent request bursts and ignores duplicate requestIds.",
		"Each helper must return files inspected/changed, evidence, remaining work, and a handoff; do not recursively delegate the same scope.",
		"A child may request its own independent children only when the prompt needs it and the tunnel's depth and total-agent caps permit it."
	].join(" ");
}

function durableContext(agent = {}) {
	const outcome = agent.lastOutcome || {};
	return [
		`Previous status: ${outcome.status || agent.status || "unknown"}.`,
		`Previous findings: ${String(outcome.findings || agent.lastUpdate || "none recorded").slice(0, 3000)}`,
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
				`NEXT=${String(outcome.next || "none recorded").slice(0, 600)}`,
				`FINDINGS=${String(outcome.findings || agent.lastUpdate || "none recorded").slice(0, 600)}`
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
	durableContext,
	fanOutInstruction,
	firstTurn,
	snapshot,
	teamHandoffContext,
	unfinishedTurn
};
