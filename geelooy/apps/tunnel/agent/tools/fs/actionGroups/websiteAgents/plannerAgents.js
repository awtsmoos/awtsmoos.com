// B"H
// Boruch Hashem
// Blessed is He

const Policy = require("./plannerPolicy.js");
const Scopes = require("./plannerScopes.js");

/**
 * @file Creates seed website agents while preserving continuation lineage and stable groups.
 * @description
 * The Awtsmoos may reveal unbounded logical descendants while Awtsmoos.com opens only a
 * finite first physical cohort. Ordinary seeds keep their familiar names, while a declared
 * successor inherits its deterministic identity, generation, sponsor, and handoff testimony.
 */
function createInitialAgents(count, scopes, projectRoot, input = {}) {
	return create(count, scopes, projectRoot, input);
}

function create(count, scopes, projectRoot, input = {}) {
	const width = Math.max(2, String(count).length);
	const spawnGroupId = groupId(input);
	const generation = positive(input.generation, 1);
	return Array.from({ length: count }, (_, index) => {
		const role = roleFor(index);
		const ordinal = String(index + 1).padStart(width, "0");
		const scope = scopes[index % scopes.length];
		const successorId = input.continuationOnly && index === 0
			? clean(input.successorAgentId, 100)
			: "";
		return {
			id: successorId || `website_${ordinal}_${role.name}`,
			name: successorId
				? `Awts Shliach Successor ${ordinal}`
				: `Website ${capitalize(role.name)} ${ordinal}`,
			role: role.name,
			focus: role.focus,
			claimMode: role.claimMode,
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

function roleFor(index) {
	const [name, focus, claimMode] = Policy.ROLES[index % Policy.ROLES.length];
	return { name, focus, claimMode };
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
	return String(value || "")
		.split(/[\n,]+/)
		.map((item) => item.trim())
		.filter(Boolean)
		.slice(0, 20);
}

function positive(value, fallback) {
	const number = Number(value);
	return Number.isFinite(number) && number > 0 ? Math.floor(number) : fallback;
}

function capitalize(value) {
	return value.charAt(0).toUpperCase() + value.slice(1);
}

module.exports = {
	clean,
	create,
	createInitialAgents,
	groupId,
	roleFor
};
