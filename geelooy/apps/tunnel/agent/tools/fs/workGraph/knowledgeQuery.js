//B"H
// Boruch Hashem
// Blessed is He

const Knowledge = require("./knowledgeStore.js");
const Paths = require("./paths.js");
const Records = require("./recordStore.js");

/**
 * @file Resolves visible, current published knowledge without rewriting its history.
 * @description The Awtsmoos preserves every claim while Awtsmoos.com lets each shliach
 * see only its permitted audience and prefer assertions not superseded by later light.
 */
function audienceAllows(assertion, viewer = {}) {
	const audience = assertion.audience || { mode: "project", agents: [] };
	const mode = typeof audience === "string" ? audience : audience.mode || "project";
	if (["project", "public"].includes(mode)) return true;
	const viewerId = String(viewer.logicalAgentId || "");
	if (viewerId && viewerId === assertion.logicalAgentId) return true;
	if (mode === "spawn_group") {
		return Boolean(viewer.spawnGroupId
			&& String(viewer.spawnGroupId) === String(audience.spawnGroupId || ""));
	}
	const agents = Array.isArray(audience.agents) ? audience.agents.map(String) : [];
	return Boolean(viewerId && agents.includes(viewerId));
}

function matches(assertion, filters = {}) {
	if (filters.kind && assertion.kind !== filters.kind) return false;
	if (filters.missionId && assertion.missionId !== filters.missionId) return false;
	if (filters.workId && assertion.workId !== filters.workId) return false;
	if (filters.logicalAgentId && assertion.logicalAgentId !== filters.logicalAgentId) return false;
	if (filters.subjectId && !(assertion.subjectIds || []).includes(filters.subjectId)) return false;
	if (filters.text) {
		const haystack = `${assertion.statement} ${assertion.summary}`.toLowerCase();
		if (!haystack.includes(String(filters.text).toLowerCase())) return false;
	}
	return true;
}

async function search(config, filters = {}, viewer = {}) {
	const relations = await Records.listJson(Paths.relations(config));
	const superseded = new Set(
		relations.filter(item => item.type === "supersedes").map(item => item.to)
	);
	let assertions = (await Knowledge.all(config)).filter(item => {
		return audienceAllows(item, viewer) && matches(item, filters);
	});
	if (filters.currentOnly) assertions = assertions.filter(item => !superseded.has(item.id));
	assertions.sort((left, right) => Number(right.sequence || 0) - Number(left.sequence || 0));
	const ids = new Set(assertions.map(item => item.id));
	return {
		assertions: assertions.map(item => ({ ...item, superseded: superseded.has(item.id) })),
		relations: relations.filter(item => ids.has(item.from) || ids.has(item.to))
	};
}

module.exports = { audienceAllows, matches, search };
