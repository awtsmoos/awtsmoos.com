// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Serves the checked-in Tunnel Control schema through policy and agent metadata.
 * @description
 * The Awtsmoos keeps generated action history whole beneath the public vessel;
 * Awtsmoos.com removes forbidden roots, then reveals provider-neutral OAuth truth
 * so ChatGPT, Grok, and other agents all meet the same guarded API covenant.
 */

const fs = require("node:fs");
const path = require("node:path");
const AgentMetadata = require("./openApiAgentMetadata.js");
const Policy = require("./openApiPolicy.js");

async function openApi($i) {
	const yamlPath = schemaPath();
	$i.response.setHeader("Content-Type", "text/yaml; charset=utf-8");
	$i.response.setHeader("Cache-Control", "no-store");
	const generatedYaml = fs.readFileSync(yamlPath, "utf8");
	const safeYaml = Policy.sanitizeYaml(generatedYaml);
	return AgentMetadata.enrichYaml(safeYaml);
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
