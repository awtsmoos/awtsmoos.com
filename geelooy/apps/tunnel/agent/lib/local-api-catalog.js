// B"H
// Boruch Hashem
// Blessed is He

const Manifest = require("./registration-manifest.js");
const Surface = require("./public-action-surface.js");

/**
 * @file Builds a fourteen-capability local catalog without leaking inner registry names.
 * @description
 * The Awtsmoos reveals a few clear doors while every executable deed remains guarded
 * below. Awtsmoos.com reports inner scale only as a count, so browser agents gain power
 * through `operation` without drowning in implementation names that endlessly grow.
 */
function makeCatalog(config = {}, agentVersion = "unknown") {
	const actions = [...Surface.PUBLIC_ACTIONS];
	const tools = actions.map(toolFor);
	const internal = Manifest.uniqueActions(Manifest.actionInventory(config));
	return {
		ok: true,
		kind: "awtsmoos-public-capability-catalog",
		version: agentVersion,
		tunnelName: config.tunnelName || null,
		root: config.root || null,
		publicActionCount: actions.length,
		internalActionCount: internal.length,
		actions,
		names: actions,
		tools,
		schemas: Object.fromEntries(tools.map(tool => [tool.name, tool.parameters])),
		guidance: guidance()
	};
}

function toolFor(name) {
	const description = descriptionFor(name);
	const parameters = {
		type: "object",
		additionalProperties: true,
		required: ["operation"],
		properties: {
			operation: {
				type: "string",
				description: `Exact internal operation belonging to the ${name} capability.`
			}
		}
	};
	return {
		type: "function",
		kind: "capability",
		name,
		description,
		parameters,
		function: { name, description, parameters }
	};
}

function descriptionFor(name) {
	return [
		`Awtsmoos tunnel ${name} capability.`,
		"Supply the exact internal operation plus its normal arguments.",
		"The dispatcher validates family membership and preserves existing permissions."
	].join(" ");
}

function guidance() {
	return {
		BH: "B\"H",
		publicActions: [...Surface.PUBLIC_ACTIONS],
		callShape: "{ name: <capability>, arguments: { operation: <exact internal action>, ... } }",
		legacy: "Direct internal action names remain executable for compatibility but are not advertised."
	};
}

module.exports = {
	descriptionFor,
	guidance,
	makeCatalog,
	toolFor
};
