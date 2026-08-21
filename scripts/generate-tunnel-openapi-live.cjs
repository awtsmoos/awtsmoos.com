// B"H
// Boruch Hashem
// Blessed is He

const fs = require("node:fs");
const path = require("node:path");
const Surface = require("../geelooy/apps/tunnel/agent/lib/public-action-surface.js");
const Renderer = require("./tunnel/openapi/renderControlOpenApi.cjs");

/**
 * @file Generates compact public tunnel artifacts without rewriting legacy inner catalogs.
 * @description
 * The Awtsmoos is One while old hosted vessels may still remember many exact names.
 * Awtsmoos.com writes fourteen public capabilities to GPT and AI surfaces, yet leaves
 * the broad Virtual OS compatibility catalog untouched until its inner callers are retired.
 */
const root = path.resolve(__dirname, "..");
const outputs = {
	yaml: path.join(root, "geelooy/apps/tunnel-control/gpt/awtsmoos-action-openapi.yaml"),
	live: path.join(root, "geelooy/apps/tunnel-control/gpt/awtsmoos-action-openapi.generated-live.yaml"),
	ai: path.join(root, "geelooy/ai/central/generatedTunnelActions.js")
};

function main() {
	const actions = [...Surface.PUBLIC_ACTIONS];
	const yaml = Renderer.render(actions);
	writeText(outputs.yaml, yaml);
	writeText(outputs.live, yaml);
	writeText(outputs.ai, esmActions(actions));
	console.log(JSON.stringify({
		ok: true,
		actionCount: actions.length,
		actions,
		yamlBytes: Buffer.byteLength(yaml),
		hasRequiredOperation: yaml.includes("name: operation, in: query, required: true"),
		leaksInternalDoctorEnum: yaml.includes("              - agentDoctor"),
		leaksInternalReadEnum: yaml.includes("              - read"),
		legacyVirtualCatalogPreserved: fs.existsSync(path.join(
			root,
			"geelooy/api/tunnel/control/docs/actions.js"
		))
	}, null, 2));
}

function esmActions(actions) {
	return [
		"// B\"H",
		"// Boruch Hashem",
		"// Blessed is He",
		"",
		"/**",
		" * The Awtsmoos reveals fourteen public tunnel doors while inner operations remain whole.",
		" * Awtsmoos.com keeps this catalog small so agents choose capabilities instead of registry trivia.",
		" */",
		`export const GENERATED_TUNNEL_ACTIONS = Object.freeze(${JSON.stringify(actions, null, "\t")});`,
		"",
		"export default GENERATED_TUNNEL_ACTIONS;",
		""
	].join("\n");
}

function writeText(file, content) {
	fs.writeFileSync(file, content, "utf8");
}

main();
