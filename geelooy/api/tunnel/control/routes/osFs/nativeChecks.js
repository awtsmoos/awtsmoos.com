// B"H
// Boruch Hashem
// Blessed is He

const fs = require("fs");
const path = require("path");
const child = require("child_process");

/** Native source checks used by tunnel doctor surfaces without invoking a shell pipeline. */
function checkAiRender(rootDir = process.cwd()) {
	const roots = ["geelooy/ai/js/render", "geelooy/ai/js/chatgpt/conversations/history"];
	const syntaxFiles = [
		"geelooy/ai/js/chatgpt/conversations/history/historyMessages.js",
		"geelooy/ai/js/chatgpt/conversations/history/turnFold.js",
		"geelooy/ai/js/render/runtime/shellRuntime.js",
		"geelooy/ai/js/render/messageRenderer.js",
		"geelooy/ai/js/render/runtime/recordRuntime.js",
		"geelooy/ai/js/render/eventDetails.js"
	];
	const syntax = syntaxFiles.map(file => nodeCheck(path.join(rootDir, file), file));
	const duplicateImports = duplicateImportScan(rootDir, roots);
	return { ok: syntax.every(item => item.ok) && !duplicateImports.length, syntax, duplicateImports };
}

function checkTunnelSurface(rootDir = process.cwd()) {
	const syntaxFiles = ["geelooy/api/tunnel/control/routes/openApi.js"];
	const optionalSyntaxFiles = ["scripts/generate-tunnel-openapi-live.cjs"];
	const yamlFiles = [
		"geelooy/apps/tunnel-control/gpt/awtsmoos-action-openapi.generated-live.yaml",
		"geelooy/apps/tunnel-control/gpt/awtsmoos-action-openapi.yaml"
	];
	const syntax = syntaxFiles.map(file => nodeCheck(path.join(rootDir, file), file));
	const optionalSyntax = optionalSyntaxFiles.map(file => optionalNodeCheck(path.join(rootDir, file), file));
	const yamlChecks = yamlFiles.map(file => checkYamlSurface(path.join(rootDir, file), file));
	return { ok: syntax.every(item => item.ok) && yamlChecks.every(item => item.ok), syntax, optionalSyntax, yamlChecks };
}

function checkAwtsmoosAi(rootDir = process.cwd()) {
	const aiRender = checkAiRender(rootDir);
	const tunnelSurface = checkTunnelSurface(rootDir);
	return { ok: aiRender.ok && tunnelSurface.ok, aiRender, tunnelSurface };
}

function nodeCheck(abs, label) {
	const result = child.spawnSync(process.execPath, ["--check", abs], { encoding: "utf8" });
	return { file: label, ok: result.status === 0, stderr: result.stderr.trim() };
}

function optionalNodeCheck(abs, label) {
	if (!fs.existsSync(abs)) return { file: label, ok: true, optional: true, missing: true };
	return { ...nodeCheck(abs, label), optional: true };
}

function duplicateImportScan(rootDir, roots) {
	const bad = [];
	for (const root of roots) walk(path.join(rootDir, root), file => {
		const imports = fs.readFileSync(file, "utf8").split(/\r?\n/).filter(line => line.startsWith("import "));
		const dup = imports.filter((line, index) => imports.indexOf(line) !== index);
		if (dup.length) bad.push({ file: path.relative(rootDir, file).replace(/\\/g, "/"), dup });
	});
	return bad;
}

function checkYamlSurface(abs, label) {
	const text = fs.readFileSync(abs, "utf8");
	const primary = actionPostSection(text);
	const checks = {
		publicCapabilities: ["runtime", "test", "system"].every(name => primary.includes(`- ${name}`)),
		postBodyTunnelAction: primary.includes("operationId: awtsmoosTunnelAction")
			&& primary.includes("requestBody:")
			&& primary.includes("application/json:"),
		legacyGetSeparated: text.includes("operationId: awtsmoosTunnelActionLegacyGet"),
		taskIdAvailable: primary.includes("taskId: { type: string }")
	};
	return { file: label, ok: Object.values(checks).every(Boolean), checks };
}

function actionPostSection(text) {
	const start = text.indexOf("    post:\n      operationId: awtsmoosTunnelAction");
	if (start < 0) return "";
	const end = text.indexOf("\n    get:\n      operationId: awtsmoosTunnelActionLegacyGet", start);
	return end < 0 ? text.slice(start) : text.slice(start, end);
}

function walk(dir, visit) {
	for (const name of fs.readdirSync(dir)) {
		const file = path.join(dir, name);
		const stat = fs.statSync(file);
		if (stat.isDirectory()) walk(file, visit);
		else if (/\.js$/.test(name)) visit(file);
	}
}

module.exports = { checkAiRender, checkTunnelSurface, checkAwtsmoosAi };
