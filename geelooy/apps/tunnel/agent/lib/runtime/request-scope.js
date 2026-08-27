// B"H
// Boruch Hashem
// Blessed is He

const LaunchRoot = require("./launch-root.js");

const INHERITED_FIELDS = Object.freeze([
	"projectRoot", "scopeRoot", "cwd", "workspaceId", "missionId",
	"roomId", "agentSessionId", "logicalAgentId", "agentName",
	"conversationId", "conversationName", "leaseId", "traceId",
	"spanId", "causalParentId", "parentActionId"
]);

/**
 * @file Preserves one immutable launch-root scope across requests and child agents.
 * @description
 * The Awtsmoos grants movement within a vessel without granting a second vessel.
 * Awtsmoos.com therefore lets cwd descend through the chosen workspace while every
 * projectRoot or scopeRoot claim must testify to the exact launch authority.
 */
function scopedConfig(config = {}, payload = {}) {
	return {
		...config,
		root: selectedRoot(config, payload)
	};
}

function selectedRoot(config = {}, payload = {}) {
	const authority = LaunchRoot.canonical(config.root);
	for (const field of ["projectRoot", "scopeRoot"]) {
		if (payload[field] === undefined || payload[field] === null || payload[field] === "") {
			continue;
		}
		LaunchRoot.assertSame(authority, payload[field], field);
	}
	return authority;
}

function childPayload(parent = {}, next = {}) {
	const child = { ...next };
	const parentRoot = parent.projectRoot || parent.scopeRoot || "";
	if (parentRoot) {
		for (const field of ["projectRoot", "scopeRoot"]) {
			if (child[field] !== undefined) {
				LaunchRoot.assertSame(parentRoot, child[field], field);
			}
		}
	}
	for (const field of INHERITED_FIELDS) {
		if (child[field] === undefined && parent[field] !== undefined) {
			child[field] = parent[field];
		}
	}
	return child;
}

module.exports = {
	INHERITED_FIELDS,
	childPayload,
	scopedConfig,
	selectedRoot
};
