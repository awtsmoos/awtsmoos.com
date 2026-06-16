// B"H
const fs = require("fs");
const path = require("path");
const root = path.resolve(__dirname, "..");
const { buildActions } = require(path.join(root, "geelooy/apps/tunnel/agent/tools/fs/actions.js"));

const docsPath = path.join(root, "geelooy/api/tunnel/control/docs/actions.js");
const aiActionsPath = path.join(root, "geelooy/ai/central/generatedTunnelActions.js");
const yamlPath = path.join(root, "geelooy/apps/tunnel-control/gpt/awtsmoos-action-openapi.yaml");
const liveYamlPath = path.join(root, "geelooy/apps/tunnel-control/gpt/awtsmoos-action-openapi.generated-live.yaml");

/**
 * B"H
 * Chapter 409: The YAML learned to carry full commandTree seeds.
 * Legacy GPT Actions still call one endpoint. The query vessel now explicitly
 * accepts tree/vars/budget carriers so agents can run a one-line commandTree
 * without hiding the real plan in an unsupported field.
 */
const baseConfig = {
  root,
  allowWrite: true,
  allowSecrets: false,
  allowCommands: true,
  enableLocalHttpProxy: true,
  tools: { fsRead: true, fsWrite: true, fsBulk: true, fsList: true, fsTree: true, command: true, chrome: true, browser: true }
};
const actions = Object.keys(buildActions(baseConfig, { action: "list" }, null)).filter(Boolean).filter(name => name !== "findReplace").sort((a, b) => a.localeCompare(b));

const stringParams = [
  ["p", "."], ["path"], ["paths"], ["files"], ["files64"], ["writes"], ["edits"], ["from"], ["to"], ["source"], ["dest"], ["target"], ["targetVessel"], ["vessel"], ["fallback"],
  ["fs"], ["cwd", "."], ["root"], ["content"], ["content64"], ["find"], ["find64"], ["replace"], ["replace64"], ["query"], ["query64"], ["text"], ["text64"],
  ["goal"], ["goal64"], ["command"], ["command64"], ["script"], ["script64"], ["scriptText"], ["expression"], ["expression64"], ["html"], ["html64"],
  ["testCode"], ["testCode64"], ["workflow"], ["workflow64"], ["workflowName"], ["tree"], ["tree64"], ["commandTree"], ["commandTree64"], ["vars"], ["vars64"], ["steps"], ["steps64"], ["params"], ["params64"], ["probes"], ["probes64"],
  ["interactions"], ["interactions64"], ["actions"], ["actions64"], ["actionsJson"], ["actionsJson64"], ["browserActions"], ["browserActions64"], ["pageActions"], ["pageActions64"],
  ["returnValues"], ["returnValues64"], ["values"], ["values64"], ["url"], ["urlPath"], ["method", "GET"], ["headers"], ["headers64"], ["body"], ["body64"], ["bodyEncoding", "utf8"],
  ["selector"], ["chromePath"], ["userDataDir"], ["host", "127.0.0.1"], ["index", "index.html"], ["serverId"], ["sandboxId"], ["entry"], ["format", "png"],
  ["runtime"], ["engine"], ["mode"], ["readMode"], ["writeMode"], ["searchMode"], ["kind"], ["xml"], ["xmlInput"], ["writesXml"], ["filesXml"], ["bundle"], ["part"],
  ["continuationPrompt"], ["continuationPrompt64"], ["provider"], ["providerId"], ["agent"], ["agentId"], ["model"], ["apiKey"], ["apiKey64"], ["message"], ["message64"],
  ["prompt"], ["prompt64"], ["system"], ["system64"], ["taskId"], ["title"], ["outputDir"], ["fileName"], ["summaryAgentId"], ["summaryFileName"], ["parentTaskId"], ["rootTaskId"], ["taskKind"], ["treeId"], ["nodeId"]
];
const integerParams = [
  ["offsetChars", 0], ["maxChars", 12000], ["totalMaxChars", 24000], ["offsetBytes", 0], ["maxBytes", 24000], ["maxFiles", 5], ["maxResults", 80], ["page", 1], ["pageSize", 50],
  ["cursor", 0], ["nextCursor"], ["maxInlineBytes", 12000], ["depth", 2], ["limit", 150], ["timeoutMs", 240000], ["maxText", 4000], ["maxSteps", 50], ["maxIterations", 20],
  ["budgetPerutas"], ["budget"], ["maxPerutas"], ["estimatedPerutas"], ["ttlSeconds"],
  ["port", 9222], ["chromePort", 9222], ["waitMs", 800], ["pollMs", 1000], ["settleMs", 2500], ["startupWaitMs", 1200], ["maxDepth", 3], ["maxChildrenPerTask", 8],
  ["maxTotalTasks", 80], ["pollIntervalMs", 7000], ["promotionCycles", 7], ["agentCycles", 8], ["chapterCycles", 8], ["providerTimeoutMs", 45000]
];
const booleanParams = [
  ["checkSyntax", true], ["runtimeCheck", false], ["regex", false], ["replaceAll", true], ["dryRun", true], ["confirm", false], ["includeDirs", false], ["write", false],
  ["snapshot", true], ["headless", false], ["fullPage", true], ["allowWrite"], ["allowSecrets"], ["enableLocalHttpProxy"], ["allowCommands"], ["stream"], ["guidanceDebug", false],
  ["debugGuidance", false], ["allowRecursiveSpawn", true], ["continueCurrent", false], ["open", false], ["wait", false], ["optional", false], ["required", true], ["continueOnError", false]
];

function scalar(value) { return typeof value === "string" ? JSON.stringify(value) : String(value); }
function paramLine(name, type, def) { return `        - { name: ${name}, in: query, schema: { type: ${type}${def === undefined ? "" : `, default: ${scalar(def)}`} } }`; }
function docsSource() { return `// B\"H\n/** Generated public tunnel action surface. Rebuild with node scripts/generate-tunnel-openapi-live.cjs */\nconst actions = ${JSON.stringify(actions, null, 2)};\nmodule.exports = { actions };\n`; }
function aiActionsSource() { return `// B\"H\n/** Generated ESM tunnel action list for every AI agent bridge. Rebuild with node scripts/generate-tunnel-openapi-live.cjs */\nexport const GENERATED_TUNNEL_ACTIONS = Object.freeze(${JSON.stringify(actions, null, 2)});\nexport default GENERATED_TUNNEL_ACTIONS;\n`; }

function fsPathLines() {
  return [
    "  /api/tunnel/control/fs/{tunnelName}:",
    "    get:",
    "      operationId: awtsmoosTunnelAction",
    "      summary: Unified tunnel action endpoint.",
    "      description: B\"H. Run one tunnel action. Old YAML remains compatible: action aliases still work. New callers can use commandTree tree/vars/budget fields, mode/readMode/writeMode, XML write payloads, cursor pagination, Chrome-first simulateRuntime, and AI-agent params through the same GET endpoint.",
    "      security: [{ OAuth2: [profile, tunnel.read, tunnel.write, tunnel.command, tunnel.browser, tunnel.admin] }]",
    "      parameters:",
    "        - { name: tunnelName, in: path, required: true, schema: { type: string }, description: Connected tunnel name, auto, or awtsmoos-virtual-os for hosted Virtual OS. }",
    "        - name: action",
    "          in: query",
    "          required: true",
    "          schema:",
    "            type: string",
    "            enum:",
    ...actions.map(action => `              - ${action}`),
    ...stringParams.map(([name, def]) => paramLine(name, "string", def)),
    ...integerParams.map(([name, def]) => paramLine(name, "integer", def)),
    ...booleanParams.map(([name, def]) => paramLine(name, "boolean", def)),
    "      responses:",
    "        \"200\": { description: OK, content: { application/json: { schema: { $ref: \"#/components/schemas/AnyResponse\" } } } }"
  ];
}

function yaml() {
  return [
    "openapi: 3.1.0",
    "info:",
    "  title: Awtsmoos Tunnel Control GPT Actions Live Agent Surface",
    "  version: 6.0.0-generated",
    "  description: B\"H. Generated from the local tunnel registry. One backward-compatible action endpoint exposes old aliases and new mode-based internals.",
    "servers:",
    "  - url: https://awtsmoos.com",
    "paths:",
    "  /api/tunnel/control/bootstrap:",
    "    get:",
    "      operationId: awtsmoosBootstrap",
    "      summary: Get setup instructions.",
    "      security: []",
    "      responses:",
    "        \"200\": { description: OK, content: { application/json: { schema: { $ref: \"#/components/schemas/AnyResponse\" } } } }",
    "  /api/tunnel/control/my-device:",
    "    get:",
    "      operationId: awtsmoosMyDevice",
    "      summary: Discover active connected tunnel.",
    "      security: [{ OAuth2: [profile, tunnel.read] }]",
    "      responses:",
    "        \"200\": { description: OK, content: { application/json: { schema: { $ref: \"#/components/schemas/AnyResponse\" } } } }",
    ...fsPathLines(),
    "  /api/tunnel/control/preview/{tunnelName}:",
    "    get:",
    "      operationId: awtsmoosPreviewProxy",
    "      summary: Fetch preview through tunnel.",
    "      security: [{ OAuth2: [profile, tunnel.read] }]",
    "      parameters:",
    "        - { name: tunnelName, in: path, required: true, schema: { type: string } }",
    "        - { name: url, in: query, schema: { type: string } }",
    "        - { name: maxChars, in: query, schema: { type: integer, default: 500000 } }",
    "        - { name: timeoutMs, in: query, schema: { type: integer, default: 30000 } }",
    "      responses:",
    "        \"200\": { description: Preview response body }",
    "components:",
    "  schemas:",
    "    AnyResponse:",
    "      type: object",
    "      additionalProperties: true",
    "      properties:",
    "        ok: { type: boolean }",
    "        BH: { type: string }",
    "        error: { type: string }",
    "        message: { type: string }",
    "        nextRequest: { type: object, additionalProperties: true }",
    "        nextPagePayload: { type: object, additionalProperties: true }",
    "        nextScanRequest: { type: object, additionalProperties: true }",
    "        aiGuidance: { type: object, additionalProperties: true }",
    "        finalInstruction:",
    "          type: object",
    "          additionalProperties: true",
    "          properties:",
    "            role: { type: string }",
    "            content: { type: string }",
    "  securitySchemes:",
    "    OAuth2:",
    "      type: oauth2",
    "      flows:",
    "        authorizationCode:",
    "          authorizationUrl: https://awtsmoos.com/api/oauth/start",
    "          tokenUrl: https://awtsmoos.com/api/oauth/token",
    "          scopes:",
    "            profile: Basic identity access.",
    "            tunnel.read: Read tunnel state and Virtual OS content.",
    "            tunnel.write: Modify files in authorized local or Virtual OS roots.",
    "            tunnel.command: Execute command-class diagnostics where permitted.",
    "            tunnel.browser: Browser automation where permitted.",
    "            tunnel.admin: Administrative tunnel operations.",
    ""
  ].join("\n");
}

const yamlText = yaml();
fs.writeFileSync(docsPath, docsSource(), "utf8");
fs.writeFileSync(aiActionsPath, aiActionsSource(), "utf8");
fs.writeFileSync(yamlPath, yamlText, "utf8");
fs.writeFileSync(liveYamlPath, yamlText, "utf8");
console.log(JSON.stringify({
  ok: true,
  actionCount: actions.length,
  yamlBytes: Buffer.byteLength(yamlText),
  generatedAiActions: path.relative(root, aiActionsPath),
  generatedYaml: path.relative(root, yamlPath),
  generatedLiveYaml: path.relative(root, liveYamlPath),
  hasFsOAuth: yamlText.includes("operationId: awtsmoosTunnelAction") && yamlText.includes("OAuth2"),
  hasLegacyActions: ["read", "bulk", "tree", "simulateRuntime", "aiAgentMessage"].every(x => yamlText.includes(`              - ${x}`)),
  hasNewModeParams: ["mode", "readMode", "writeMode", "xml", "writesXml", "cursor", "guidanceDebug"].every(x => yamlText.includes(`name: ${x}`)),
  hasCommandTreeParams: ["tree", "tree64", "vars", "vars64", "budgetPerutas", "treeId"].every(x => yamlText.includes(`name: ${x}`)),
  hasChatGptActions: ["chatgptLogin", "chatgptMessage", "chatgptContinueConversation"].every(x => yamlText.includes(`              - ${x}`)),
  hasRuntimeParams: ["actionsJson64", "browserActions64", "pageActions64", "engine"].every(x => yamlText.includes(`name: ${x}`))
}, null, 2));
