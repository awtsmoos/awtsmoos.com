// B"H
// Boruch Hashem
// Blessed is He

const Policy = require("./plannerPolicy.js");
const Scopes = require("./plannerScopes.js");

/**
 * @file Creates website-agent identities with stable mission groups and successor lineage.
 * @description
 * The Awtsmoos reveals many temporary browser messengers without fragmenting identity.
 * Awtsmoos.com gives ordinary peers one mission group, and a takeover generation keeps
 * its deterministic successor name so room, handoff, and browser testimony all agree.
 */
function create(count, scopes, projectRoot, input = {}) {
	const width = Math.max(2, String(count).length);
	const spawnGroupId = groupId(input);
	const generation = positive(input.generation, 1);
	return Array.from({ length: count }, (_, index) => {
		const [role, focus, claimMode] = Policy.ROLES[index % Policy.ROLES.length];
		const ordinal = String(index + 1).padStart(width, "0");
		const scope = scopes[index % scopes.length];
		const successorId = input.continuationOnly && index === 0
			? clean(input.successorAgentId, 100)
			: "";
		return {
			id: successorId || `website_${ordinal}_${role}`,
			name: successorId
				? `Awts Shliach Successor ${ordinal}`
				: `Website ${capitalize(role)} ${ordinal}`,
			role,
			focus,
			claimMode,
			scope,
			absoluteScope: Scopes.absoluteScope(projectRoot, scope),
			ordinal: index + 1,
			spawnGroupId,
			generation,
			parentAgentId: clean(input.parentAgentId, 120),
			sponsorAgentId: clean(input.sponsorAgentId, 120),
			predecessorAgentId: clean(input.predecessorAgentId, 120),
			handoffPaths: list(input.handoffPaths)
		};
	});
}

function groupId(input = {}) {
	const explicit = clean(input.spawnGroupId, 100);
	if (explicit) return explicit;
	const mission = clean(input.missionId || input.websiteMissionId, 80);
	return mission ? `website_group_${mission}`.slice(0, 120) : "";
}

function clean(value, limit) {
	return String(value || "")
		.trim()
		.replace(/[^a-zA-Z0-9_-]+/g, "_")
		.replace(/^_+|_+$/g, "")
		.slice(0, limit);
}

function list(value) {
	if (Array.isArray(value)) return value.map(String).filter(Boolean).slice(0, 20);
	return String(value || "").split(/[\n,]+/).map(item => item.trim()).filter(Boolean).slice(0, 20);
}

function positive(value, fallback) {
	const number = Number(value);
	return Number.isFinite(number) && number > 0 ? Math.floor(number) : fallback;
}

function capitalize(value) {
	return value.charAt(0).toUpperCase() + value.slice(1);
}

module.exports = { clean, create, groupId };
