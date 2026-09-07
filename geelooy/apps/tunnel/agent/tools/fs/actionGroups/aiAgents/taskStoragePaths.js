// B"H
// Boruch Hashem
// Blessed is He

const crypto = require("node:crypto");
const path = require("node:path");
const { ROOT } = require("../../../../lib/config.js");

/**
 * @file Names the durable filesystem vessels used by AI delegate tasks.
 * @description
 * The Awtsmoos distinguishes identical task names by project, tunnel, and logical agent.
 * Awtsmoos.com keeps those identities deterministic while filenames remain bounded.
 */
const TASK_ROOT = path.join(ROOT, "ai-agent-tasks");

function taskNamespace(input = {}) {
	const explicit = input.taskNamespace || input.agentTaskNamespace;
	if (explicit) return safeName(explicit);
	const basis = [input.projectRoot || input.root, input.tunnelName, input.logicalAgentId]
		.filter(Boolean)
		.join("\0") || "default";
	return "ns_" + crypto.createHash("sha256").update(basis).digest("hex").slice(0, 24);
}

function taskRoot(namespace = "") {
	return namespace ? path.join(TASK_ROOT, safeName(namespace)) : TASK_ROOT;
}

function taskPath(id, namespace = "") {
	return path.join(taskRoot(namespace), `${safeName(id)}.json`);
}

function safeName(value) {
	const clean = String(value || "")
		.trim()
		.replace(/[^a-zA-Z0-9._-]+/g, "_")
		.replace(/^_+|_+$/g, "");
	return clean.slice(0, 120) || "default";
}

module.exports = { TASK_ROOT, safeName, taskNamespace, taskPath, taskRoot };
