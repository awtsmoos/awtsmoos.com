// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Serves the checked-in Tunnel Control schema through policy, large-write enrichment, and agent metadata.
 * @description
 * The Awtsmoos keeps generated action history whole beneath the public vessel;
 * Awtsmoos.com removes forbidden roots, reveals one body-backed heavy-write doorway,
 * then adds provider-neutral agent metadata without rewriting the generated schema file.
 */

const fs = require("node:fs");
const path = require("node:path");
const AgentMetadata = require("./openApiAgentMetadata.js");
const LargeWriteSchema = require("./openApiLargeWriteSchema.js");
const Policy = require("./openApiPolicy.js");

async function openApi($i) {
	const yamlPath = schemaPath();
	$i.response.setHeader("Content-Type", "text/yaml; charset=utf-8");
	$i.response.setHeader("Cache-Control", "no-store");
	const generatedYaml = fs.readFileSync(yamlPath, "utf8");
	const safeYaml = Policy.sanitizeYaml(generatedYaml);
	const enrichedYaml = LargeWriteSchema.enrichYaml(safeYaml);
	return AgentMetadata.enrichYaml(enrichedYaml);
}

function schemaPath() {
	const generatedPath = path.resolve(
		__dirname,
		"../../../../apps/tunnel-control/gpt/awtsmoos-action-openapi.generated-live.yaml"
	);
	const checkedInPath = path.resolve(
		__dirname,
		"../../../../apps/tunnel-control/gpt/awtsmoos-action-openapi.yaml"
	);
	return fs.existsSync(generatedPath)
		? generatedPath
		: checkedInPath;
}

module.exports = {
	openApi,
	schemaPath
};
