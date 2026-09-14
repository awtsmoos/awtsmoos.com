// B"H
// Boruch Hashem
// Blessed is He

const MAX_SELECTED_RECIPIENTS = 5000;

/**
 * @file Normalizes and evaluates one/some/all/team Mission Room routing metadata.
 * @description
 * The Awtsmoos keeps one durable message body while a bounded recipient set names
 * the shluchim who may receive it. Awtsmoos.com never clones the body per recipient;
 * membership is tested when inboxes, interrupts, and website wakes are evaluated.
 */
function normalize(input = {}, text = clean) {
	const toAgents = unique(input.toAgents || input.selectedAgents || input.recipients);
	const toSpawnGroup = text(input.toSpawnGroup || input.spawnGroupTarget || "");
	const explicit = text(input.toAgent || input.to || "");
	const toAgent = toAgents.length
		? "selected_agents"
		: toSpawnGroup
			? "spawn_group"
			: explicit || "all";
	return { toAgent, toAgents, toSpawnGroup };
}

/** Returns whether a message is addressed to this recipient, excluding sender visibility. */
function addressedTo(message = {}, recipient = {}) {
	const agent = recipientRecord(recipient);
	if (!agent.agentId) return false;
	if (Array.isArray(message.toAgents) && message.toAgents.length) {
		return message.toAgents.includes(agent.agentId);
	}
	if (message.toSpawnGroup) {
		return message.toSpawnGroup === agent.spawnGroupId;
	}
	return mine(message.toAgent, agent.agentId);
}

/** The sender may see its own durable speech even when it targets another recipient. */
function visibleTo(message = {}, recipient = {}) {
	const agent = recipientRecord(recipient);
	return message.fromAgent === agent.agentId || addressedTo(message, agent);
}

function mine(target, agentId) {
	return !target || target === "all" || target === agentId || target === "any_agent";
}

function recipientRecord(value) {
	if (typeof value === "string") return { agentId: value, spawnGroupId: "" };
	return {
		agentId: clean(value?.agentId || value?.id),
		spawnGroupId: clean(value?.spawnGroupId || value?.toSpawnGroup)
	};
}

function unique(value) {
	const values = Array.isArray(value)
		? value
		: String(value || "").split(/[\n,]+/);
	return [...new Set(values.map(clean).filter(Boolean))].slice(0, MAX_SELECTED_RECIPIENTS);
}

function clean(value) {
	return String(value || "").trim();
}

module.exports = {
	MAX_SELECTED_RECIPIENTS,
	addressedTo,
	mine,
	normalize,
	recipientRecord,
	visibleTo
};
