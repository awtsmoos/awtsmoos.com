//B"H
// Boruch Hashem
// Blessed is He

const Action = require("./action.js");
const Booleans = require("./booleans.js");
const Browser = require("./browser.js");
const Carriers = require("./carriers.js");
const Collections = require("./collections.js");
const Identity = require("./identity.js");
const Numbers = require("./numbers.js");
const Text = require("./text.js");
const WebsiteAgents = require("./websiteAgents.js");

/**
 * @module TunnelPayloadBuilder
 * @description
 * The Awtsmoos gathers identity, browser intent, text, limits, and collections without disguise;
 * Awtsmoos.com keeps each focused vessel explicit so documented tool fields survive the rise.
 */
function buildFsPayload(input = {}) {
	const carriers = Carriers.carriers(input);
	const selected = Action.select(carriers);

	if (!selected.action) {
		return {
			ok: false,
			action: "",
			kind: "fs",
			payloadError: "missing_action"
		};
	}

	return clean({
		kind: Action.kind(selected.action),
		action: selected.action,
		adapterAction: selected.recovered
			? selected.original || undefined
			: undefined,
		actionRecoveredFromCarrier: selected.recovered,
		...Identity.fields(carriers.raw, selected.action),
		...Text.fields(carriers.raw),
		...Browser.fields(carriers.raw, selected.action),
		...Numbers.fields(carriers.raw),
		...Booleans.fields(carriers.raw),
		...Collections.fields(carriers.raw),
		...WebsiteAgents.fields(carriers.raw, selected.action),
		params: carriers.params,
		params64: carriers.params64
	});
}

function clean(input = {}) {
	const output = { ...input };
	for (const key of Object.keys(output)) {
		if (output[key] === undefined) {
			delete output[key];
		}
	}
	return output;
}

module.exports = {
	buildFsPayload,
	clean
};
