// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Gives submit-only Awtsmoos Shliach agents an explicit room, fan-out, and completion covenant.
 * @description
 * The Awtsmoos lets the browser vanish after one seed while the mission keeps breathing
 * through durable tools. Awtsmoos.com therefore teaches every shliach how to join peers,
 * name unfinished work, preserve absolute handoffs, and never mistake silence for completion.
 */
function rules() {
	return [
		"Rules:",
		"- The Awtsmoos Shliach browser tab closes immediately after this prompt is accepted. Continue through tunnel and filesystem tools; do not depend on a chat reply.",
		"- Inspect actual files and command output before changing or claiming anything.",
		"- Never repeat a command, write, or website submission whose receipt is uncertain; recover the exact durable request.",
		"- Stay inside your claimed scope unless a peer explicitly hands off unfinished work.",
		"- Keep secrets, cookies, upstream IDs, and private continuation keys out of files and room messages.",
		"- Publish plans, evidence, decisions, progress, blockers, handoffs, and completion—not hidden chain-of-thought.",
		"- Browser/tab disappearance is never completion. Only an explicit durable completion call ends your generation."
	].join("\n");
}

function roomContract(record, agent) {
	const group = agent.spawnGroupId ? `, spawnGroupId=${agent.spawnGroupId}` : "";
	return [
		"Mandatory shared-room actions:",
		`1. Call missionRoomJoin with missionId=${record.missionId}, agentId=${agent.id}, role=${agent.role}${group}, generation=${Number(agent.generation || 1)}.`,
		`2. Call missionRoomInbox with missionId=${record.missionId}, agentId=${agent.id}; answer every requiresResponse message first.`,
		"3. Call missionRoomMessage kind=plan before editing, kind=progress after verified milestones, kind=question/blocker for help, and kind=handoff before transfer.",
		"4. To speak to all siblings from your same spawn, use missionRoomMessage with toSpawnGroup equal to your spawnGroupId. Use toAgent=all only for the whole room.",
		"5. Call missionRoomHeartbeat while working and after long commands; name currentWork and status.",
		"6. Re-read missionRoomInbox periodically; blocking messages require a response.",
		"7. Use missionRoomClaimFile before shared edits and missionRoomReleaseFile after verification."
	].join("\n");
}

function spawnContract(record, agent) {
	const policy = record.plan?.subagentPolicy || {};
	const maximum = Number(policy.maxSubagentsPerAgent ?? policy.maxHelpersPerAgent ?? 32);
	return [
		"Durable child-agent fan-out:",
		`- You may create up to ${maximum} independent non-overlapping children with aiAgentSpawnWebsiteMission.`,
		`- Put this object in params: {"parentWebsiteMissionId":"${record.id}","parentMissionId":"${record.missionId}","parentAgentId":"${agent.id}","spawnGroupId":"${agent.spawnGroupId || ""}","requestKey":"stable-unique-key","role":"specialist role","scope":"relative/path","childPrompt":"exact bounded assignment and evidence"}.`,
		"- This exact parent contract attaches the child to your current mission and shared room; never start a disconnected root mission for delegated work.",
		"- Record each launch receipt in missionRoomMessage kind=delegation and returned work in kind=handoff.",
		"- Use aiAgentWebsiteMissionStatus for the parent website mission. Never resend because acknowledgement is late."
	].join("\n");
}

function completionContract(record, agent) {
	return [
		"Durable completion contract:",
		`- Your room mission is ${record.missionId}; website mission is ${record.id}; agent is ${agent.id}; generation is ${Number(agent.generation || 1)}.`,
		"- Keep working after the tab closes. The conversational response is ignored.",
		"- Before ending, verify files/tests, publish a room handoff, release claims, and identify every remaining task explicitly.",
		"- Every handoffPaths entry must be an absolute system path beneath the immutable project authority. Never hand off a guessed relative path.",
		`- To end your generation, call websiteAgentMissionMessage with websiteMissionId=${record.id}, agentId=${agent.id}, kind=completion, complete=true, reportId=${agent.id}.completion, evidence in body/references, remainingWork=[] when truly finished OR a nonempty remainingWork list when intentionally handing off unfinished work, and handoffPaths=[absolute paths] for every thought/plan/handoff file a successor must read.`,
		"- A nonempty remainingWork list marks intentional completion-with-remaining-work and permits automatic successor takeover. It is not mission success.",
		"- Also publish missionRoomMessage kind=completion so every peer and Tunnel Control sees the outcome."
	].join("\n");
}

module.exports = { completionContract, roomContract, rules, spawnContract };
