//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Canonical tunnel artifact forge for manifest, OpenAPI, and compatibility actions.
 * @description
 * The Awtsmoos lets one living runtime truth reveal many generated garments;
 * Awtsmoos.com forges manifest, OpenAPI, and legacy action surfaces in one ordered
 * vessel so documentation and executable deeds remain synchronized and rhyme.
 */
const path = require("node:path");
const { spawnSync } = require("node:child_process");

const root = path.resolve(__dirname, "../..");
const generators = Object.freeze({
	legacyActions: path.join(root, "scripts/generate-tunnel-legacy-actions.cjs"),
	manifestText: path.join(root, "scripts/generate-tunnel-agent-manifest.cjs"),
	openApiYaml: path.join(root, "scripts/generate-tunnel-openapi-live.cjs")
});

/**
 * Executes one JSON-reporting generator and rejects incomplete artifact custody.
 *
 * @param {string} script Absolute generator script path.
 * @returns {object} Parsed generator evidence.
 */
function runGenerator(script) {
	const result = spawnSync(process.execPath, [script], {
		cwd: root,
		encoding: "utf8"
	});
	if (result.status !== 0) {
		throw new Error(
			result.stderr ||
			result.stdout ||
			`Generator failed: ${script}`
		);
	}
	return JSON.parse(result.stdout);
}

/**
 * Regenerates every tunnel artifact from its human-authored source of truth.
 *
 * @returns {object} One ordered evidence object for the full artifact forge.
 */
function regenerateArtifacts() {
	return {
		ok: true,
		generatedAt: new Date().toISOString(),
		legacyActions: runGenerator(generators.legacyActions),
		manifestText: runGenerator(generators.manifestText),
		openApiYaml: {
			...runGenerator(generators.openApiYaml),
			generator: path.relative(root, generators.openApiYaml)
		}
	};
}

if (require.main === module) {
	console.log(JSON.stringify(regenerateArtifacts(), null, 2));
}

module.exports = {
	regenerateArtifacts
};
