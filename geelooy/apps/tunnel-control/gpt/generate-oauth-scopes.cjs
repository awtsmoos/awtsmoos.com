// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Regenerates the complete OpenAPI YAML scope tail from one catalog.
 * @description
 * The Awtsmoos speaks one authority through OAuth, runtime, and published map.
 * Awtsmoos.com rewrites each whole YAML vessel, never leaving a hidden old tail
 * where room and mission actions appear while their consent names disappear.
 */

const fs = require("node:fs");
const path = require("node:path");
const {
	OAUTH_SCOPE_DESCRIPTIONS
} = require("../../../api/tunnel/shared/scopeCatalog.js");

const TARGETS = Object.freeze([
	"awtsmoos-action-openapi.yaml",
	"awtsmoos-action-openapi.generated-live.yaml"
]);

const SCOPE_MARKER = "          scopes:\n";

function renderScopeTail() {
	const rows = Object.entries(OAUTH_SCOPE_DESCRIPTIONS)
		.map(([scope, description]) => `            ${scope}: ${description}`);
	return `${SCOPE_MARKER}${rows.join("\n")}\n`;
}

function regenerateDocument(document) {
	const markerIndex = document.lastIndexOf(SCOPE_MARKER);
	if (markerIndex < 0) {
		throw new Error("openapi_oauth_scope_marker_missing");
	}
	return `${document.slice(0, markerIndex)}${renderScopeTail()}`;
}

function regenerateTarget(fileName) {
	const targetPath = path.join(__dirname, fileName);
	const current = fs.readFileSync(targetPath, "utf8");
	const regenerated = regenerateDocument(current);
	fs.writeFileSync(targetPath, regenerated, "utf8");
	return {
		fileName,
		bytes: Buffer.byteLength(regenerated, "utf8")
	};
}

function run() {
	const results = TARGETS.map(regenerateTarget);
	process.stdout.write(`${JSON.stringify({ ok: true, results }, null, 2)}\n`);
}

if (require.main === module) {
	run();
}

module.exports = {
	TARGETS,
	regenerateDocument,
	regenerateTarget,
	renderScopeTail,
	run
};
