// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Defines the durable collaboration, fan-out, and response covenant.
 * @description
 * The Awtsmoos reveals many voices without collision. Awtsmoos.com requires every
 * shliach to publish verifiable room state, bounded recursive requests, exact file
 * claims, remaining work, and a single resumable handoff before declaring completion.
 */
function rules() {
	return [
		"Rules:",
		"- Use only the authenticated ChatGPT website session carrying this message.",
		"- Use only the canonical project root or an absolute path inside it.",
		"- Reject any command, scope, symlink resolution, or child request outside that root.",
		"- Inspect before proposing edits; name exact files, risks, and bounded verification.",
		"- Stay in this mission until verified completion or an exact durable blocker exists.",
		"- Never duplicate a command, write, or website submission whose receipt is uncertain.",
		"- Publish PLAN, PROGRESS, HANDOFF, and COMPLETION with evidence, remaining work, and file claims.",
		"- Teach peers through MESSAGE TO ROOM and avoid overlapping another agent's claim.",
		"- Request bounded children only through SPAWN; never open or resend browser tabs yourself.",
		"- Give every child the canonical root, relative scope, absolute scope, evidence contract, and return-once handoff.",
		"- Continue through filesystem commands, tunnel actions, mission records, and rooms after the prompt tab closes.",
		"- Do not expose cookies, credentials, upstream conversation IDs, or private continuation keys."
	].join("\n");
}

function fanOutInstruction(record = {}) {
	const policy = record.plan?.subagentPolicy || {};
	const maximum = Number(policy.maxSubagentsPerAgent ?? policy.maxHelpersPerAgent ?? 32);
	return [
		`Fan-out policy: ${policy.priority || "preferred"}; mode ${policy.mode || "bounded-single-use"}.`,
		`Use at most ${maximum} single-use helpers at once (default 32; hard maximum 96).`,
		"Every child must own independent non-overlapping work and a stable requestId.",
		"The tunnel owns idempotency, depth/count limits, pacing, queue, memory, and browser limits.",
		"A child may request its own independent children only through the same bounded contract."
	].join(" ");
}

function responseContract() {
	return [
		"Return concise sections named STATUS, FINDINGS, FILES, MESSAGE TO ROOM, SPAWN, and NEXT.",
		"MESSAGE TO ROOM must contain PLAN, PROGRESS, HANDOFF, and COMPLETION with evidence, remaining work, and file claims.",
		"SPAWN must be exactly one JSON array; use [] when no child is needed.",
		"Each child object must contain only requestId, role, scope, and prompt.",
		"Each child prompt must repeat the canonical project root plus claimed relative and absolute scope.",
		"These requests are executed by the tunnel as real website child agents.",
		"A request alone is not proof a child started; wait for the durable start receipt.",
		"Emit each requestId once; the tunnel owns start receipts and duplicate suppression.",
		"STATUS is COMPLETE only with verification; otherwise UNFINISHED.",
		"NEXT names the exact resumable action and evidence location; say none only when nothing remains."
	].join("\n");
}

module.exports = {
	fanOutInstruction,
	responseContract,
	rules
};
