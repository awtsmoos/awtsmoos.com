// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Teaches website agents explicit continuity, room actions, and optional fan-out.
 * @description
 * The Awtsmoos lets a shliach continue after its browser vessel closes. Awtsmoos.com
 * names every durable action literally so an awakened custom GPT never has to infer which
 * room, heartbeat, claim, status, or completion tool the mission contract requires.
 */
function rules() {
	return [
		"Rules:",
		"- The browser tab closes immediately after this prompt is accepted. Continue through tunnel and filesystem tools; do not depend on a chat reply.",
		"- Any conversational response in ChatGPT is ignored by the runtime; durable tool actions and verified filesystem/tunnel evidence are the continuation path.",
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
		"3. Publish plan, progress, blockers, handoffs, and completion with missionRoomMessage.",
		`4. Call missionRoomHeartbeat with missionId=${record.missionId}, agentId=${agent.id} while working and after long commands.`,
		"5. Re-read with missionRoomInbox periodically; blocking messages require response.",
		"6. Before shared-file edits call missionRoomClaimFile; after verification call missionRoomReleaseFile."
	].join("\n");
}

function spawnContract(record, agent) {
	const websiteMissionId = missionId(record);
	const spacing = Math.max(20000, Number(record.plan?.subagentPolicy?.subagentStartSpacingMs || 20000));
	return [
		"Optional durable child-agent fan-out:",
		"- You may create zero, one, or any number of useful non-overlapping child agents with aiAgentSpawnWebsiteMission. There is no count-based child ceiling.",
		`- Physical child launches are serialized by the runtime with at least ${spacing}ms between admissions; do not bypass that spacing.`,
		`- Params: {"parentWebsiteMissionId":"${websiteMissionId}","parentMissionId":"${record.missionId}","parentAgentId":"${agent.id}","requestKey":"stable-unique-key","role":"specialist role","scope":"relative/path","childPrompt":"bounded assignment and evidence"}.`,
		"- After spawning, inspect durable progress with aiAgentWebsiteMissionStatus instead of resending the spawn.",
		"- Children remain attached to this mission and room. Record delegation and handoff receipts.",
		"- Never resend a spawn merely because acknowledgement is late; recover its exact durable request."
	].join("\n");
}

function completionContract(record, agent) {
	const websiteMissionId = missionId(record);
	return [
		"Durable completion contract:",
		`- Room mission=${record.missionId}; website mission=${websiteMissionId}; agent=${agent.id}.`,
		"- Keep working after the tab closes; verify files/tests and publish a handoff.",
		"- If your assigned work is complete, completion settles the pre-step continuation request without creating a successor.",
		`- When finished, call websiteAgentMissionMessage with websiteMissionId=${websiteMissionId}, agentId=${agent.id}, kind=completion, complete=true, reportId=${agent.id}.completion.`,
		"- Also publish missionRoomMessage kind=completion so peers can verify the outcome."
	].join("\n");
}

function missionId(record = {}) {
	return record.id || record.websiteMissionId || "current-website-mission";
}

module.exports = { completionContract, roomContract, rules, spawnContract };
