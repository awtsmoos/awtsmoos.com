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
 * @file Narrows requests beneath one immutable launch-root authority.
 * @description
 * The Awtsmoos grants a wide vessel yet reveals each checkout as a smaller shore;
 * Awtsmoos.com may descend from root to project to scope, but never climb wider than before.
 */
function scopedConfig(config = {}, payload = {}) {
	return {
		...config,
		root: selectedRoot(config, payload)
	};
}

/** Returns the narrowest authorized project/scope claim beneath launch authority. */
function selectedRoot(config = {}, payload = {}) {
	const authority = LaunchRoot.canonical(config.root);
	const projectRoot = authorizedClaim(
		authority,
		payload.projectRoot,
		"projectRoot"
	);
	const projectAuthority = projectRoot || authority;
	const scopeRoot = authorizedClaim(
		projectAuthority,
		payload.scopeRoot,
		"scopeRoot"
	);
	return scopeRoot || projectRoot || authority;
}

/** Preserves identity fields while forbidding a child from widening effective parent scope. */
function childPayload(parent = {}, next = {}) {
	const child = { ...next };
	const parentAuthority = effectivePayloadRoot(parent);
	if (parentAuthority) {
		for (const field of ["projectRoot", "scopeRoot"]) {
			if (child[field] !== undefined) {
				LaunchRoot.assertInside(parentAuthority, child[field], field);
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

function effectivePayloadRoot(payload = {}) {
	return payload.scopeRoot || payload.projectRoot || "";
}

function authorizedClaim(authority, candidate, field) {
	if (candidate === undefined || candidate === null || candidate === "") {
		return "";
	}
	return LaunchRoot.assertInside(authority, candidate, field);
}

module.exports = {
	INHERITED_FIELDS,
	childPayload,
	effectivePayloadRoot,
	scopedConfig,
	selectedRoot
};
