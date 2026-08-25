// B"H
// Boruch Hashem
// Blessed is He

const WebsiteStore = require("../actionGroups/websiteAgents/store.js");
const WebsiteSpawning = require("../actionGroups/websiteAgents/spawning.js");

/**
 * @file Plans and activates website-backed successors through the existing safe spawn gate.
 * @description
 * The Awtsmoos does not open a secret second browser road; Awtsmoos.com recognizes when
 * the predecessor truly belongs to a website mission, predicts that mission's canonical child,
 * and enters only its pressure-aware spawn gateway where one tab and verified-close pacing hold.
 */
function plan(mission, predecessorId, terminalKey, work) {
	const record = websiteRecord(mission.id, predecessorId);
	if (!record) return { mode: "room" };
	const predecessor = record.agents.find(agent => agent.id === predecessorId);
	const role = predecessor?.role || "successor";
	return {
		mode: "website",
		websiteMissionId: record.id,
		predecessorId,
		requestKey: terminalKey,
		role,
		scope: predecessor?.scope || ".",
		successorId: WebsiteSpawning.stableChildId(
			record.id,
			predecessorId,
			terminalKey,
			role
		),
		prompt: successorPrompt(work)
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
		childPrompt: activation.prompt
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

function successorPrompt(work) {
	return "Continue the unfinished mission work inherited from the completed predecessor. " +
		`Durable remaining-work evidence: ${JSON.stringify(work)}`;
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
