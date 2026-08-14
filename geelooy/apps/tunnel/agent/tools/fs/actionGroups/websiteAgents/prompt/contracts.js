// B"H
// Boruch Hashem
// Blessed is He

/** Gives submit-only website agents one concrete durable tool covenant. */
function rules() {
	return [
		"Rules:",
		"- The browser tab closes immediately after this prompt is accepted. Continue through tunnel and filesystem tools; do not depend on a chat reply.",
		"- Inspect actual files and command output before changing or claiming anything.",
		"- Never repeat a command, write, or website submission whose receipt is uncertain; recover the exact durable request.",
		"- Stay inside your claimed scope unless a peer explicitly hands off unfinished work.",
		"- Keep secrets, cookies, upstream IDs, and private continuation keys out of files and room messages.",
		"- Publish plans, evidence, decisions, progress, blockers, handoffs, and completion—not hidden chain-of-thought."
	].join("\n");
}

function roomContract(record, agent) {
	return [
		"Mandatory shared-room actions:",
		`1. Call missionRoomJoin with missionId=${record.missionId}, agentId=${agent.id}, role=${agent.role}.`,
		`2. Call missionRoomInbox with missionId=${record.missionId}, agentId=${agent.id}; answer every requiresResponse message first.`,
		"3. Call missionRoomMessage kind=plan before editing, kind=progress after verified milestones, kind=question/blocker for help, and kind=handoff before transfer.",
		"4. Call missionRoomHeartbeat while working and after long commands; name currentWork and status.",
		"5. Re-read missionRoomInbox periodically; blocking messages require a response.",
		"6. Use missionRoomClaimFile before shared edits and missionRoomReleaseFile after verification."
	].join("\n");
}

function spawnContract(record, agent) {
	const policy = record.plan?.subagentPolicy || {};
	const maximum = Number(policy.maxSubagentsPerAgent ?? policy.maxHelpersPerAgent ?? 32);
	return [
		"Durable child-agent fan-out:",
		`- You may create up to ${maximum} independent non-overlapping children with aiAgentSpawnWebsiteMission.`,
		`- Put this object in params: {"parentWebsiteMissionId":"${record.id}","parentMissionId":"${record.missionId}","parentAgentId":"${agent.id}","requestKey":"stable-unique-key","role":"specialist role","scope":"relative/path","childPrompt":"exact bounded assignment and evidence"}.`,
		"- This exact parent contract attaches the child to your current mission and shared room; never start a disconnected root mission for delegated work.",
		"- Record each launch receipt in missionRoomMessage kind=delegation and returned work in kind=handoff.",
		"- Use aiAgentWebsiteMissionStatus for the parent website mission. Never resend because acknowledgement is late."
	].join("\n");
}

function completionContract(record, agent) {
	return [
		"Durable completion contract:",
		`- Your room mission is ${record.missionId}; website mission is ${record.id}; agent is ${agent.id}.`,
		"- Keep working after the tab closes. The conversational response is ignored.",
		"- Verify files/tests, publish a room handoff, release claims, and leave exact NEXT work when anything remains.",
		`- When truly finished, call websiteAgentMissionMessage with websiteMissionId=${record.id}, agentId=${agent.id}, kind=completion, complete=true, reportId=${agent.id}.completion, and evidence in body/references. Reuse that reportId when recovering an uncertain receipt.`,
		"- Also publish missionRoomMessage kind=completion so every peer and Tunnel Control sees the outcome."
	].join("\n");
}

module.exports = { completionContract, roomContract, rules, spawnContract };
