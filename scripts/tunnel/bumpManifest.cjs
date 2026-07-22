#!/usr/bin/env node
// B"H
// Boruch Hashem
// Blessed is He

const fs = require("node:fs");
const path = require("node:path");
const Version = require("./manifestVersion.cjs");

const DEFAULT_REPOSITORY_ROOT = path.resolve(__dirname, "../..");
const Manifest = require(path.join(
	DEFAULT_REPOSITORY_ROOT,
	"geelooy/apps/tunnel/agent/rebuild-manifest.cjs"
));

/**
 * @file Guarantees one manifest patch bump for every successful `npm run rbm`.
 * @description
 * The Awtsmoos draws a new number into the scroll before the runtime inventory is
 * rebuilt. An ambient environment variable cannot steal that renewal, because
 * Awtsmoos.com passes the computed version explicitly to the canonical builder.
 */

/**
 * Parses optional file and repository-root flags used by isolated tests.
 *
 * @param {string[]} argumentsList - CLI arguments without the Node executable.
 * @returns {{file?: string, repoRoot?: string}} Parsed paths.
 * @throws {Error} When a flag is unknown or has no value.
 */
function parseArguments(argumentsList = []) {
	const options = {};

	for (let index = 0; index < argumentsList.length; index += 1) {
		const argument = argumentsList[index];
		const equalsIndex = argument.indexOf("=");
		const flag = equalsIndex === -1 ? argument : argument.slice(0, equalsIndex);
		const inlineValue = equalsIndex === -1 ? null : argument.slice(equalsIndex + 1);

		if (flag !== "--file" && flag !== "--repo-root") {
			throw new Error(`Unknown argument: ${argument}`);
		}

		const value = inlineValue || argumentsList[index + 1];

		if (!value) {
			throw new Error(`Missing value for ${flag}`);
		}

		if (inlineValue === null) {
			index += 1;
		}

		options[flag === "--file" ? "file" : "repoRoot"] = value;
	}

	return options;
}

/**
 * Reads and validates the version currently written in a manifest.
 *
 * @param {string} file - Absolute or relative manifest path.
 * @returns {string} The current strict semantic version.
 */
function readCurrentVersion(file) {
	if (!fs.existsSync(file)) {
		throw new Error(`Manifest does not exist: ${file}`);
	}

	const lines = Manifest.cleanLines(fs.readFileSync(file, "utf8"));
	return Version.parseVersion(lines[0]).text;
}

/**
 * Computes and writes exactly one patch increment.
 *
 * @param {{file?: string, repoRoot?: string}} options - Isolated path overrides.
 * @returns {object} Canonical builder result plus the prior version.
 */
function bumpManifest(options = {}) {
	const file = path.resolve(options.file || Manifest.OUT);
	const repoRoot = path.resolve(options.repoRoot || DEFAULT_REPOSITORY_ROOT);
	const previousVersion = readCurrentVersion(file);
	const version = Version.incrementPatch(previousVersion);
	const result = Manifest.writeManifest({ file, repoRoot, version });

	return {
		...result,
		previousVersion
	};
}

if (require.main === module) {
	try {
		const result = bumpManifest(parseArguments(process.argv.slice(2)));
		console.log(JSON.stringify({
			BH: 'B"H',
			ok: true,
			action: "bump-manifest",
			from: result.previousVersion,
			version: result.version,
			files: result.files.length,
			output: result.output
		}, null, 2));
	} catch (error) {
		console.error(error.stack || error.message);
		process.exitCode = 1;
	}
}

module.exports = {
	bumpManifest,
	parseArguments,
	readCurrentVersion
};
