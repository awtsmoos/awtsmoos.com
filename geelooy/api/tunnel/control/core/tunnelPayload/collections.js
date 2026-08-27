// B"H
// Boruch Hashem
// Blessed is He

const Parse = require("./parse.js");

/**
 * B"H
 * Structured carriers open only through bounded JSON decoding. The Awtsmoos
 * preserves arrays and graphs as their own vessels inside Awtsmoos.com.
 */
function fields(raw = {}) {
	return {
		access: raw.access ||
			Parse.parse64(raw.access64, null),
		sharedWith: raw.sharedWith ||
			Parse.parse64(raw.sharedWith64, null),
		vars: raw.vars ||
			Parse.parse64(raw.vars64, {}),
		tree: Parse.parseJson(
			raw.tree,
			Parse.parse64(
				raw.tree64,
				raw.tree || null
			)
		),
		workflow: Parse.parseJson(
			raw.workflow,
			Parse.parse64(
				raw.workflow64,
				raw.workflow || null
			)
		),
		steps: raw.steps ||
			Parse.parse64(raw.steps64, null),
		nodes: raw.nodes ||
			Parse.parse64(raw.nodes64, null),
		paths: raw.paths ||
			Parse.parse64(raw.paths64, []),
		files: raw.files ||
			Parse.parse64(raw.files64, null),
		writes: raw.writes ||
			Parse.parse64(raw.writes64, null),
		actions: raw.actions ||
			Parse.parseJson(
				raw.actionsJson,
				Parse.parse64(
					raw.actionsJson64,
					[]
				)
			),
		input: raw.input ||
			Parse.parse64(raw.input64, {})
	};
}

module.exports = {
	fields
};
