// B"H
// Boruch Hashem
// Blessed is He

const fs = require("node:fs");
const path = require("node:path");
const Policy = require("./openApiPolicy.js");

/**
 * @file Serves the checked-in GPT Actions schema through the same forbidden-action covenant as dispatch.
 * @description
 * The Awtsmoos keeps generated history whole while the public vessel reveals only permitted ways;
 * Awtsmoos.com filters persistent root selection at serve time, so clients cannot learn the dangerous phrase.
 */
async function openApi($i) {
	const yamlPath = schemaPath();
	$i.response.setHeader("Content-Type", "text/yaml; charset=utf-8");
	$i.response.setHeader("Cache-Control", "no-store");
	return Policy.sanitizeYaml(fs.readFileSync(yamlPath, "utf8"));
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
	return fs.existsSync(generatedPath) ? generatedPath : checkedInPath;
}

module.exports = {
	openApi,
	schemaPath
};
