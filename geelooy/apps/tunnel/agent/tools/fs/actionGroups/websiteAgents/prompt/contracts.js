// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Teaches website agents explicit continuity and optional unbounded fan-out.
 * @description
 * The Awtsmoos lets a shliach ask for help without making help compulsory. Awtsmoos.com
 * records continuation before work begins and permits any number of useful descendants,
 * while the runtime—not prose—enforces durable spacing between physical launches.
 */
function rules() {
	return [
		"Rules:",
		"- The browser tab closes after this prompt is accepted. Continue through tunnel and filesystem tools; do not depend on a chat reply.",
		"- Your continuation request was persisted before this first step; a successor may use it only if your assigned work remains unfinished.",
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
		"3. Publish plan before edits, progress after verified milestones, blockers for help, and handoff before transfer.",
		"4. Heartbeat while working and after long commands.",
		"5. Re-read the room periodically; blocking messages require response.",
		"6. Claim shared files before edits and release claims after verification."
	].join("\n");
}

function spawnContract(record, agent) {
	const spacing = Math.max(20000, Number(record.plan?.subagentPolicy?.subagentStartSpacingMs || 20000));
	return [
		"Optional durable child-agent fan-out:",
		"- You may create zero, one, or any number of useful non-overlapping child agents with aiAgentSpawnWebsiteMission. There is no count-based child ceiling.",
		`- Physical child launches are serialized by the runtime with at least ${spacing}ms between admissions; do not bypass that spacing.`,
		`- Params: {"parentWebsiteMissionId":"${record.id}","parentMissionId":"${record.missionId}","parentAgentId":"${agent.id}","requestKey":"stable-unique-key","role":"specialist role","scope":"relative/path","childPrompt":"bounded assignment and evidence"}.`,
		"- Children remain attached to this mission and room. Record delegation and handoff receipts.",
		"- Never resend a spawn merely because acknowledgement is late; recover its exact durable request."
	].join("\n");
}

function completionContract(record, agent) {
	return [
		"Durable completion contract:",
		`- Room mission=${record.missionId}; website mission=${record.id}; agent=${agent.id}.`,
		"- Keep working after the tab closes; verify files/tests and publish a handoff.",
		"- If your assigned work is complete, completion settles the pre-step continuation request without creating a successor.",
		`- When finished, call websiteAgentMissionMessage with websiteMissionId=${record.id}, agentId=${agent.id}, kind=completion, complete=true, reportId=${agent.id}.completion.`,
		"- Also publish missionRoomMessage kind=completion so peers can verify the outcome."
	].join("\n");
}

module.exports = { completionContract, roomContract, rules, spawnContract };
