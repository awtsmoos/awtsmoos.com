// B"H
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const { buildActions } = require(path.join(root, "geelooy/apps/tunnel/agent/tools/fs/actions.js"));

const docsPath = path.join(root, "geelooy/api/tunnel/control/docs/actions.js");
const yamlPath = path.join(root, "geelooy/apps/tunnel-control/gpt/awtsmoos-action-openapi.yaml");
const liveYamlPath = path.join(root, "geelooy/apps/tunnel-control/gpt/awtsmoos-action-openapi.generated-live.yaml");

const baseConfig = { root, allowWrite: true, allowSecrets: false, tools: { fsRead: true, fsWrite: true, fsBulk: true, fsList: true } };
const actions = Object.keys(buildActions(baseConfig, { action: "list" }, null)).filter(Boolean).filter(action => action !== "findReplace").sort((a, b) => a.localeCompare(b));

const stringParams = [
  ["p", "."], ["path"], ["paths"], ["files"], ["files64"], ["writes"], ["edits"], ["from"], ["to"],
  ["source"], ["dest"], ["target"], ["cwd", "."], ["root"], ["content"], ["find"], ["replace"],
  ["query"], ["text"], ["goal"], ["command"], ["script"], ["scriptText"], ["expression"],
  ["html"], ["testCode"], ["workflow"], ["workflow64"], ["workflowName"], ["steps"], ["steps64"],
  ["params"], ["probes"], ["probes64"], ["interactions"], ["interactions64"],
  ["actions"], ["actions64"], ["actionsJson"], ["actionsJson64"], ["browserActions"], ["browserActions64"],
  ["pageActions"], ["pageActions64"], ["returnValues"], ["returnValues64"], ["values"], ["values64"],
  ["url"], ["urlPath"], ["method", "GET"], ["headers"], ["body"], ["bodyEncoding", "utf8"],
  ["selector"], ["chromePath"], ["userDataDir"], ["host", "127.0.0.1"], ["index", "index.html"],
  ["serverId"], ["sandboxId"], ["entry"], ["format", "png"], ["runtime"], ["engine"], ["continuationPrompt"]
];
const integerParams = [
  ["offsetChars", 0], ["maxChars", 12000], ["totalMaxChars", 24000], ["offsetBytes", 0],
  ["maxBytes", 24000], ["maxFiles", 5], ["maxResults", 80], ["page", 1], ["pageSize", 50],
  ["maxInlineBytes", 12000], ["depth", 2], ["limit", 150], ["timeoutMs", 240000], ["maxText", 4000],
  ["maxSteps", 50], ["maxIterations", 20], ["port", 9222], ["waitMs", 800]
];
const booleanParams = [
  ["checkSyntax", true], ["runtimeCheck", false], ["regex", false], ["replaceAll", true], ["dryRun", true],
  ["confirm", false], ["includeDirs", false], ["write", false], ["snapshot", true], ["headless", false], ["fullPage", true]
];

function q(value) { return JSON.stringify(value); }
function scalar(value) { return typeof value === "string" ? q(value) : String(value); }
function paramLine(name, type, def) { const suffix = def === undefined ? "" : `, default: ${scalar(def)}`; return `        - { name: ${name}, in: query, schema: { type: ${type}${suffix} } }`; }

function actionDocsSource() {
  return `// B"H\n/**\n * Generated public tunnel action surface.\n * Source: local agent dispatcher buildActions().\n * Rebuild with: node scripts/generate-tunnel-openapi-live.cjs\n */\nconst actions = ${JSON.stringify(actions, null, 2)};\n\nmodule.exports = { actions };\n`;
}

function yaml() {
  return [
    "openapi: 3.1.0",
    "info:",
    "  title: Awtsmoos Tunnel Control GPT Actions Live Agent Surface",
    "  version: 5.6.0-generated",
    "  description: B\"H. Generated from the local tunnel agent action registry. GET-only transport with UTF-8 query parameters. simulateRuntime is Merkava-backed by default: pass url to collect a same-origin page into the synthetic DOM, and pass actions/browserActions/pageActions/actionsJson for Puppeteer-like operations without launching Chromium.",
    "servers:", "  - url: https://awtsmoos.com", "paths:",
    "  /api/tunnel/control/bootstrap:", "    get:", "      operationId: awtsmoosBootstrap", "      summary: Get setup instructions.", "      security: []", "      responses:", "        \"200\": { description: OK, content: { application/json: { schema: { $ref: \"#/components/schemas/AnyResponse\" } } } }",
    "  /api/tunnel/control/my-device:", "    get:", "      operationId: awtsmoosMyDevice", "      summary: Discover active connected tunnel.", "      security: [{ OAuth2: [profile, tunnel.read] }]", "      responses:", "        \"200\": { description: OK, content: { application/json: { schema: { $ref: \"#/components/schemas/AnyResponse\" } } } }",
    "  /api/tunnel/control/fs/{tunnelName}:", "    get:", "      operationId: awtsmoosTunnelAction", "      summary: Unified tunnel action endpoint.",
    "      description: B\"H. Run one tunnel action. For simulateRuntime, use url/html/files plus actions/browserActions/pageActions/actionsJson to run Puppeteer-like actions in Merkava's synthetic browser. For long autonomous loops, call finishAndContinue after finishing.",
    "      parameters:", "        - { name: tunnelName, in: path, required: true, schema: { type: string } }", "        - name: action", "          in: query", "          required: true", "          schema:", "            type: string", "            enum:",
    ...actions.map(action => `              - ${action}`),
    ...stringParams.map(([name, def]) => paramLine(name, "string", def)),
    ...integerParams.map(([name, def]) => paramLine(name, "integer", def)),
    ...booleanParams.map(([name, def]) => paramLine(name, "boolean", def)),
    "      responses:", "        \"200\": { description: OK, content: { application/json: { schema: { $ref: \"#/components/schemas/AnyResponse\" } } } }",
    "  /api/tunnel/control/preview/{tunnelName}:", "    get:", "      operationId: awtsmoosPreviewProxy", "      summary: Fetch preview through tunnel.", "      parameters:", "        - { name: tunnelName, in: path, required: true, schema: { type: string } }", "        - { name: url, in: query, schema: { type: string } }", "        - { name: maxChars, in: query, schema: { type: integer, default: 500000 } }", "        - { name: timeoutMs, in: query, schema: { type: integer, default: 30000 } }", "      responses:", "        \"200\": { description: Preview response body }",
    "components:", "  schemas:", "    AnyResponse:", "      type: object", "      additionalProperties: true", "      properties:", "        ok: { type: boolean }", "        BH: { type: string }", "        error: { type: string }", "        message: { type: string }", "        finalInstruction:", "          type: object", "          additionalProperties: true", "          properties:", "            role: { type: string }", "            content: { type: string }",
    "  securitySchemes:", "    OAuth2:", "      type: oauth2", "      flows:", "        authorizationCode:", "          authorizationUrl: https://awtsmoos.com/api/oauth/start", "          tokenUrl: https://awtsmoos.com/api/oauth/token", "          scopes:", "            profile: Basic identity access.", "            tunnel.read: Read tunnel state.", "            tunnel.write: Modify files.", "            tunnel.command: Execute diagnostics.", "            tunnel.browser: Browser automation.", "            tunnel.admin: Administrative tunnel operations.", ""
  ].join("\n");
}

const yamlText = yaml();
fs.writeFileSync(docsPath, actionDocsSource(), "utf8");
fs.writeFileSync(yamlPath, yamlText, "utf8");
fs.writeFileSync(liveYamlPath, yamlText, "utf8");
console.log(JSON.stringify({ ok: true, actionCount: actions.length, docsPath: path.relative(root, docsPath).replace(/\\/g, "/"), yamlPath: path.relative(root, yamlPath).replace(/\\/g, "/"), liveYamlPath: path.relative(root, liveYamlPath).replace(/\\/g, "/"), hasSimulateRuntime: yamlText.includes("simulateRuntime"), hasBrowserActions: yamlText.includes("name: browserActions"), hasPageActions64: yamlText.includes("name: pageActions64") }, null, 2));
