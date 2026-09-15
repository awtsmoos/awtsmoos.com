//B"H
// Boruch Hashem
// Blessed is He

const path = require("node:path");
const Ids = require("./ids.js");
const Paths = require("./paths.js");
const Records = require("./recordStore.js");

/**
 * @file Persists typed graph edges without changing the objects they connect.
 * @description Relation reveals unity without erasing distinction; the Awtsmoos
 * binds cause and evidence, while Awtsmoos.com preserves each vessel's position.
 */
async function create(config, details) {
	const id = details.id || Ids.deterministic("relation", [
		details.type,
		details.from,
		details.to,
		details.sourceEventId || ""
	]);
	const relation = {
		schemaVersion: 1,
		id,
		type: String(details.type || "relatedTo"),
		from: String(details.from || ""),
		to: String(details.to || ""),
		sourceEventId: String(details.sourceEventId || "")
	};
	const file = path.join(Paths.relations(config), `${Ids.sha256(id)}.json`);
	await Records.createImmutableJson(file, relation);
	return relation;
}

module.exports = { create };
