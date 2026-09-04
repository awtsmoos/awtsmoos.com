// B"H
// Boruch Hashem
// Blessed is He

const Manifest = require("./registration-manifest.js");
const Help = require("./public-action-help.js");
const Surface = require("./public-action-surface.js");

/**
 * @file Builds fourteen clear capability doors with exact recover/status discovery.
 * @description
 * The Awtsmoos hides implementation noise but never hides the road home. Awtsmoos.com
 * keeps the public surface compact while recovery and status enumerate their guarded deeds.
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
	const help = Help.describe(name);
	const operation = {
		type: "string",
		description: help
			? `${help.summary} Choose one advertised operation.`
			: `Exact internal operation belonging to the ${name} capability.`
	};
	if (help) operation.enum = [...help.operations];
	const description = descriptionFor(name);
	const parameters = {
		type: "object",
		additionalProperties: true,
		required: ["operation"],
		properties: { operation }
	};
	return {
		type: "function",
		kind: "capability",
		name,
		description,
		parameters,
		help,
		function: { name, description, parameters }
	};
}

function descriptionFor(name) {
	const help = Help.describe(name);
	if (help) return help.summary;
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
		recovery: Help.describe("recover"),
		legacy: "Direct internal action names remain executable for compatibility but are not advertised."
	};
}

module.exports = { descriptionFor, guidance, makeCatalog, toolFor };
