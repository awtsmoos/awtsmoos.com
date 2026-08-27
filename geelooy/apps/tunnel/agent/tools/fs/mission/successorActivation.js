// B"H
// Boruch Hashem
// Blessed is He

const WebsiteStore = require("../actionGroups/websiteAgents/store.js");
const WebsiteSpawning = require("../actionGroups/websiteAgents/spawning.js");
const HandoffPrompt = require("./successorHandoffPrompt.js");

/**
 * @file Plans terminal successors through the existing fresh-owned-chat website gateway.
 * @description
 * The Awtsmoos does not open a secret second browser road; Awtsmoos.com carries verified
 * current project authority into one deterministic successor prompt, while stale evidence
 * stays redacted and the existing pressure-aware verified-close gateway remains sovereign.
 */
function plan(config, mission, predecessorId, terminalKey, work) {
	const record = websiteRecord(mission.id, predecessorId);
	if (!record) return { mode: "room" };
	const predecessor = record.agents.find(agent => agent.id === predecessorId);
	const role = predecessor?.role || "successor";
	const generation = Number(predecessor?.generation || 1) + 1;
	const successorId = WebsiteSpawning.stableChildId(
		record.id,
		predecessorId,
		terminalKey,
		role
	);
	const handoff = HandoffPrompt.build(config, mission, {
		requestKey: terminalKey,
		predecessorId,
		successorId,
		generation,
		spawnGroupId: predecessor?.spawnGroupId || "",
		work
	});
	if (!handoff.projectRootPrecise) {
		return {
			mode: "room",
			reason: "verified_project_root_unavailable"
		};
	}
	return {
		mode: "website",
		websiteMissionId: record.id,
		predecessorId,
		requestKey: terminalKey,
		role,
		scope: predecessor?.scope || ".",
		projectRoot: handoff.projectRoot,
		projectRootSource: handoff.projectRootSource,
		absoluteHandoffPaths: handoff.absoluteHandoffPaths,
		handoffReferences: handoff.handoffReferences,
		successorId,
		spawnGroupId: predecessor?.spawnGroupId || "",
		generation,
		freshChat: true,
		prompt: handoff.prompt
	};
}

async function activate(config, activation = {}) {
	if (activation.mode !== "website") {
		return { ok: true, mode: "room", successorId: activation.successorId };
	}
	const Spawn = require("../actionGroups/websiteAgents/runner/spawn.js");
	const result = await Spawn.spawn(config, {
		parentWebsiteMissionId: activation.websiteMissionId,
		parentAgentId: activation.predecessorId,
		requestKey: activation.requestKey,
		role: activation.role,
		scope: activation.scope,
		childPrompt: activation.prompt,
		spawnGroupId: activation.spawnGroupId,
		generation: activation.generation,
		predecessorAgentId: activation.predecessorId,
		handoffPaths: activation.absoluteHandoffPaths || activation.handoffReferences
	});
	const child = result.accepted?.[0]?.childAgentId ||
		result.duplicates?.[0]?.childAgentId || activation.successorId;
	return {
		ok: result.ok === true,
		mode: "website",
		successorId: child,
		activationReceipt: compactWebsiteReceipt(result)
	};
}

function websiteRecord(missionId, predecessorId) {
	return WebsiteStore.list(200).find(record =>
		record.missionId === missionId &&
		(record.agents || []).some(agent => agent.id === predecessorId)
	) || null;
}

function compactWebsiteReceipt(result = {}) {
	return {
		websiteMissionId: result.websiteMissionId,
		accepted: result.accepted?.length || 0,
		duplicates: result.duplicates?.length || 0,
		rejected: result.rejected?.length || 0,
		activationMode: result.activation?.mode || null
	};
}

module.exports = {
	activate,
	plan,
	websiteRecord
};
