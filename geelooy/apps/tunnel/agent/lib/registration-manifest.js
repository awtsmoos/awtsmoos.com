// B"H
// Boruch Hashem
// Blessed is He

const fs = require("node:fs");
const path = require("node:path");
const Digest = require("./registration-digest.js");
const Surface = require("./public-action-surface.js");
const { schemaFor } = require("./tool-schema/schema-for.js");

/**
 * @file Separates the fourteen public capabilities from complete executable truth.
 * @description
 * The Awtsmoos is One while every internal deed keeps its exact name below the gate.
 * Awtsmoos.com advertises a small stable surface, yet hashes every executable action
 * so routing, provenance, and security remain complete rather than merely ornate.
 */
function build(config = {}) {
	const actions = actionInventory(config);
	const schemas = schemasFor(actions);
	const supportedActions = [...Surface.PUBLIC_ACTIONS];
	return {
		releaseSourceSha: sourceSha(),
		actionManifestHash: Digest.digest(actions),
		actionSchemaDigest: Digest.digest(schemas),
		publicActionDigest: Digest.digest(Surface.descriptor()),
		publicActionCount: supportedActions.length,
		actions,
		supportedActions
	};
}

/**
 * Loads every executable family for the internal native manifest.
 *
 * @param {object} config Native agent configuration with sealed project authority.
 * @returns {object} Sorted internal action names grouped by runtime family.
 */
function actionInventory(config = {}) {
	const FsActions = require("../tools/fs/actions.js");
	const Command = require("../tools/command/index.js");
	const Relay = require("../tools/relay/index.js");
	const Streaming = require("../tools/streaming/index.js");
	return {
		fs: names(FsActions.buildActions(config, { action: "list" }, null)),
		command: names(Command.ACTIONS),
		chrome: browserActions(),
		relay: names(Relay.ACTIONS),
		streaming: names(Streaming.ACTIONS)
	};
}

/**
 * Reads only the executable Chrome registry for compatibility capability callers.
 *
 * @returns {string[]} Sorted Chrome action names.
 */
function browserActions() {
	const Chrome = require("../tools/chrome/index.js");
	return names(Chrome.ACTIONS);
}

function names(registry = {}) {
	return Object.keys(registry || {}).sort();
}

function schemasFor(actions) {
	const output = {};
	for (const [kind, actionNames] of Object.entries(actions)) {
		for (const name of actionNames) {
			output[`${kind}:${name}`] = kind === "streaming"
				? { type: "object", additionalProperties: true }
				: schemaFor(kind, name);
		}
	}
	return output;
}

function sourceSha() {
	const environment = String(process.env.AWTSMOOS_RELEASE_SOURCE_SHA || "").trim();
	if (environment) return environment;
	const file = path.resolve(__dirname, "../release-source-sha.txt");
	try {
		return String(fs.readFileSync(file, "utf8")).trim() || "unknown";
	} catch {
		return "unknown";
	}
}

function uniqueActions(actions) {
	return [...new Set(Object.values(actions).flat())].sort();
}

module.exports = {
	actionInventory,
	browserActions,
	build,
	names,
	schemasFor,
	sourceSha,
	uniqueActions
};
