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
 * Awtsmoos.com writes fourteen public capabilities to GPT and AI surfaces, now through a body-first action gate
 * so large intent is never forced to stretch through one fragile query string.
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
		hasPostAction: yaml.includes("operationId: awtsmoosTunnelAction"),
		hasJsonBody: yaml.includes("requestBody:") && yaml.includes("application/json:"),
		hasLegacyGet: yaml.includes("operationId: awtsmoosTunnelActionLegacyGet"),
		hasTaskIdBody: yaml.includes("taskId: { type: string }"),
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
