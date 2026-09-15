//B"H
// Boruch Hashem
// Blessed is He

const Entities = require("./entityStore.js");
const Ledger = require("./eventLedger.js");
const Paths = require("./paths.js");
const Records = require("./recordStore.js");

/**
 * @file Reads Chronicle history as an additive lens over the living filesystem.
 * @description Files remain files and RAG folders remain folders; the Awtsmoos also
 * reveals their causal procession, and Awtsmoos.com lets navigation follow identity.
 */
function normalizePath(value = "") {
	return String(value).replace(/\\/g, "/").replace(/^\.\//, "");
}

function witnesses(event = {}) {
	return [
		...(Array.isArray(event.facts?.before) ? event.facts.before : []),
		...(Array.isArray(event.facts?.after) ? event.facts.after : [])
	];
}

function matches(event, filters = {}) {
	if (filters.missionId && event.missionId !== filters.missionId) return false;
	if (filters.workId && event.workId !== filters.workId) return false;
	if (filters.type && event.type !== filters.type) return false;
	if (filters.subject && !(event.subjects || []).includes(filters.subject)) return false;
	if (filters.logicalAgentId && event.actor?.logicalAgentId !== filters.logicalAgentId) return false;
	if (filters.agentSessionId && event.actor?.agentSessionId !== filters.agentSessionId) return false;
	if (filters.afterSequence && event.sequence <= Number(filters.afterSequence)) return false;
	if (filters.beforeSequence && event.sequence >= Number(filters.beforeSequence)) return false;
	if (filters.text) {
		const haystack = JSON.stringify(event).toLowerCase();
		if (!haystack.includes(String(filters.text).toLowerCase())) return false;
	}
	return true;
}

function ordered(events, options = {}) {
	const ascending = String(options.order || "desc").toLowerCase() === "asc";
	const sorted = [...events].sort((left, right) => ascending
		? left.sequence - right.sequence
		: right.sequence - left.sequence);
	return sorted.slice(0, Math.max(1, Math.min(Number(options.limit || 50), 500)));
}

async function relatedRelations(config, events) {
	const ids = new Set(events.map(event => event.id));
	const subjects = new Set(events.flatMap(event => event.subjects || []));
	const relations = await Records.listJson(Paths.relations(config));
	return relations.filter(relation => ids.has(relation.sourceEventId)
		|| subjects.has(relation.from)
		|| subjects.has(relation.to));
}

async function search(config, filters = {}) {
	const events = ordered(
		(await Ledger.list(config)).filter(event => matches(event, filters)),
		filters
	);
	return { events, relations: await relatedRelations(config, events) };
}

async function fileEntityIds(config, events, filePath) {
	const ids = new Set();
	const current = filePath ? await Entities.lookup(config, filePath) : "";
	if (current) ids.add(current);
	for (const event of events) {
		for (const witness of witnesses(event)) {
			if (normalizePath(witness.path) === filePath && witness.entityId) {
				ids.add(witness.entityId);
			}
		}
	}
	return ids;
}

async function fileHistory(config, requestedPath, options = {}) {
	const filePath = normalizePath(requestedPath);
	const allEvents = await Ledger.list(config);
	const entityIds = await fileEntityIds(config, allEvents, filePath);
	const matching = allEvents.filter(event => {
		if (!String(event.type || "").startsWith("filesystem.")) return false;
		return witnesses(event).some(witness => {
			return normalizePath(witness.path) === filePath
				|| entityIds.has(witness.entityId);
		});
	});
	const events = ordered(
		matching.filter(event => matches(event, options)),
		options
	);
	return {
		path: filePath,
		entityIds: [...entityIds],
		events,
		relations: await relatedRelations(config, events)
	};
}

async function workHistory(config, missionId, workId, options = {}) {
	return search(config, { ...options, missionId, workId });
}

module.exports = { fileHistory, matches, normalizePath, search, workHistory };
