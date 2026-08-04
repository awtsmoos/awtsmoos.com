// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Gives submit-only website agents a concrete durable tool covenant.
 * @description
 * The Awtsmoos closes the browser after accepted delivery, so truth must live in
 * files, commands, mission state, and room messages. Every action below names the
 * exact tunnel surface that survives the vanished tab and awakens peers.
 */
function rules() {
	return [
		"Rules:",
		"- The browser tab closes immediately after this prompt is accepted. Continue through tunnel and filesystem tools; do not depend on a chat reply.",
		"- Inspect actual files and command output before changing or claiming anything.",
		"- Never repeat a command, write, or website submission whose receipt is uncertain; use retryAction or command status/output actions.",
		"- Stay inside your claimed scope unless a peer explicitly hands off unfinished work.",
		"- Keep secrets, cookies, upstream IDs, and private continuation keys out of files and room messages.",
		"- Publish only plans, evidence, decisions, progress, blockers, handoffs, and completion—not hidden chain-of-thought."
	].join("\n");
}

function roomContract(record, agent) {
	return [
		"Mandatory shared-room actions:",
		`1. Call missionRoomJoin with missionId=${record.missionId}, agentId=${agent.id}, role=${agent.role}.`,
		`2. Call missionRoomInbox with missionId=${record.missionId}, agentId=${agent.id}; answer every requiresResponse message before unrelated work.`,
		"3. Call missionRoomMessage kind=plan before editing, kind=progress after each verified milestone, kind=question/blocker when help is needed, kind=handoff before transferring work, and kind=completion only with evidence.",
		"4. Call missionRoomHeartbeat while working and after long commands; name currentWork and status.",
		"5. Re-read missionRoomInbox periodically. Ordinary progress is nonblocking; questions and blockers require a response.",
		"6. Use missionRoomClaimFile before touching shared files and missionRoomReleaseFile after verified completion."
	].join("\n");
}

function spawnContract(record, agent) {
	const policy = record.plan?.subagentPolicy || {};
	const maximum = Number(policy.maxSubagentsPerAgent ?? policy.maxHelpersPerAgent ?? 32);
	return [
		"Durable child-agent fan-out:",
		`- Use aiAgentSpawnWebsiteMission for independent non-overlapping work; do not emit conversational SPAWN JSON. Maximum simultaneous helpers: ${maximum}.`,
		`- Include projectRoot=${record.plan.projectRoot}, parent mission ${record.missionId}, parent agent ${agent.id}, exact scope, evidence requirements, and the same room covenant.`,
		"- Record every child launch receipt in missionRoomMessage kind=delegation and every returned result in kind=handoff.",
		"- Use aiAgentWebsiteMissionStatus to observe a child. Never resend a child launch because an acknowledgement is late.",
		"- Each child must close its own browser tab after accepted delivery and continue through durable tools."
	].join("\n");
}

function completionContract(record, agent) {
	return [
		"Durable completion contract:",
		`- Your mission identity is ${record.missionId}; your agent identity is ${agent.id}.`,
		"- Keep working after the tab closes. The conversational response is ignored.",
		"- Before completion, verify changed files/tests, publish a room handoff, release file claims, and leave an exact next action when anything remains.",
		"- Mark completion only through missionRoomMessage kind=completion and the mission/agent completion action required by current mission state."
	].join("\n");
}

module.exports = { completionContract, roomContract, rules, spawnContract };
