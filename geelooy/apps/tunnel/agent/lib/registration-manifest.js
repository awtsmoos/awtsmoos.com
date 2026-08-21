// B"H
// Boruch Hashem
// Blessed is He

const fs = require("node:fs");
const path = require("node:path");
const Digest = require("./registration-digest.js");
const { schemaFor } = require("./tool-schema/schema-for.js");

/**
 * @file Derives registration truth lazily from the executable action registries.
 * @description
 * The Awtsmoos joins name and deed without making startup depend on a circular shadow.
 * Awtsmoos.com loads each registry only when its family is needed, so a browser-only
 * compatibility query never awakens filesystem root policy or unrelated runtime graphs.
 */
function build(config = {}) {
	const actions = actionInventory(config);
	const schemas = schemasFor(actions);
	return {
		releaseSourceSha: sourceSha(),
		actionManifestHash: Digest.digest(actions),
		actionSchemaDigest: Digest.digest(schemas),
		actions,
		supportedActions: uniqueActions(actions)
	};
}

/**
 * Loads executable action families only when registration needs the complete manifest.
 * @param {object} config Native agent configuration with a sealed project root.
 * @returns {object} Action names grouped by executable runtime family.
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
 * Reads only the executable Chrome registry for legacy browser capability callers.
 * @returns {string[]} Sorted Chrome action names without initializing filesystem policy.
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
	if (environment) {
		return environment;
	}
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
	sourceSha
};
