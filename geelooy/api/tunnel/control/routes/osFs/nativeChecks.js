// B"H
const fs = require("fs");
const path = require("path");
const child = require("child_process");

/**
 * Chapter 21: The Command Became a Native Vessel.
 *
 * The Awtsmoos does not require every diagnostic spark to pass through a shell.
 * These checks read the filesystem directly, run syntax validation with Node's
 * parser, and report structured truth for AI agents without fragile copy-paste.
 */
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
  if (!fs.existsSync(abs)) return { file: label, ok: true, optional: true, missing: true, warning: "optional_file_not_present" };
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
  const checks = {
    simulateRuntimeAction: /- simulateRuntime/.test(text),
    engineParam: /name: engine/.test(text),
    runtimeParam: /name: runtime/.test(text),
    nativeChecks: /- doctorAll/.test(text) && /- yamlValidate/.test(text),
    getOnlyTunnelAction: /operationId: awtsmoosTunnelAction[\s\S]*?parameters:/.test(text)
  };
  return { file: label, ok: Object.values(checks).every(Boolean), checks };
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
