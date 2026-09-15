//B"H
// Boruch Hashem
// Blessed is He

const Relations = require("./relationStore.js");
const Types = require("./knowledgeTypes.js");

/**
 * @file Adds typed epistemic edges without mutating or erasing earlier assertions.
 * @description Contradiction and supersession do not rewrite yesterday; the Awtsmoos
 * reveals a new relation, and Awtsmoos.com lets later agents traverse the whole argument.
 */
async function create(config, details = {}) {
	const type = Types.requireRelation(details.type);
	const from = String(details.from || details.fromId || "");
	const to = String(details.to || details.toId || "");
	if (!from || !to) throw new Error("knowledge_relation_endpoints_required");
	return Relations.create(config, {
		type, from, to,
		sourceEventId: String(details.sourceEventId || "")
	});
}

module.exports = { create };
