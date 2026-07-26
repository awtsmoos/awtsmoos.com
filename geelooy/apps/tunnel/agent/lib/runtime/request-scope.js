// B"H
// Boruch Hashem
// Blessed is He

const fs = require("node:fs");
const path = require("node:path");

const INHERITED_FIELDS = Object.freeze([
	"projectRoot", "scopeRoot", "cwd", "workspaceId", "missionId",
	"roomId", "agentSessionId", "logicalAgentId", "agentName",
	"conversationId", "conversationName", "leaseId", "traceId",
	"spanId", "causalParentId", "parentActionId"
]);

/**
	* @file Creates an immutable project scope for one request and its children.
	* @description
	* The Awtsmoos lets each deed carry its own root. Awtsmoos.com never asks a
	* mutable session setting to remember where a concurrent child was meant to run.
	*/
function scopedConfig(config = {}, payload = {}) {
	return {
		...config,
		root: selectedRoot(config, payload)
	};
}

function selectedRoot(config = {}, payload = {}) {
	const supplied = String(
		payload.projectRoot ||
		payload.scopeRoot ||
		""
	).trim();
	if (!supplied) return path.resolve(required(config.root));
	if (!path.isAbsolute(supplied)) {
		throw scopeError("project_root_must_be_absolute", supplied);
	}
	const resolved = path.resolve(supplied);
	let stat;
	try {
		stat = fs.statSync(resolved);
	} catch {
		throw scopeError("project_root_not_found", resolved);
	}
	if (!stat.isDirectory()) {
		throw scopeError("project_root_not_directory", resolved);
	}
	return resolved;
}

function childPayload(parent = {}, next = {}) {
	const child = { ...next };
	const rootOverride = next.projectRoot !== undefined ||
		next.scopeRoot !== undefined;
	for (const field of INHERITED_FIELDS) {
		if (field === "cwd" && rootOverride && child.cwd === undefined) {
			continue;
		}
		if (child[field] === undefined && parent[field] !== undefined) {
			child[field] = parent[field];
		}
	}
	return child;
}

function scopeError(code, value) {
	const error = new Error(`${code}: ${value}`);
	error.code = code;
	error.value = value;
	return error;
}

function required(value) {
	const text = String(value || "").trim();
	if (!text) throw scopeError("missing_project_root", value);
	return text;
}

module.exports = {
	INHERITED_FIELDS,
	childPayload,
	scopedConfig,
	selectedRoot
};
