//B"H
//Boruch Hashem
//Blessed be He

const Files = require("./fileSources.js");
const Graph = require("./graphSources.js");
const Source = require("./sourceModel.js");

/**
 * @file Gathers explicit, raw-file, and graph sources into one compiler candidate set.
 * @description The Awtsmoos keeps every vessel distinct at its source while Awtsmoos.com
 * deduplicates their identities before ranking, budgeting, and explanation begin.
 */
function array(value) {
	if (Array.isArray(value)) return value;
	return value === undefined || value === null || value === "" ? [] : [value];
}

function explicitItem(raw, mandatory = false) {
	if (typeof raw === "string") {
		return Source.normalize({ text: raw, type: "explicit", mandatory });
	}
	return Source.normalize({
		...(raw && typeof raw === "object" ? raw : { text: String(raw || "") }),
		type: raw?.type || "explicit",
		mandatory: mandatory || Boolean(raw?.mandatory)
	});
}

function explicitSources(payload = {}) {
	const ordinary = [payload.sources, payload.explicitSources]
		.flatMap(array)
		.map(item => explicitItem(item, false));
	const mandatory = array(payload.mandatorySources)
		.map(item => explicitItem(item, true));
	return [...mandatory, ...ordinary];
}

async function gather(config, payload = {}) {
	const groups = [explicitSources(payload)];
	groups.push(await Files.gather(config, payload));
	if (payload.includeGraph !== false) {
		groups.push(await Graph.gather(config, payload));
	}
	return Source.dedupe(groups.flat());
}

module.exports = { array, explicitItem, explicitSources, gather };
