// B"H
const fs = require("fs");
const path = require("path");
const root = path.resolve(__dirname, "..");
const { buildActions } = require(path.join(root, "geelooy/apps/tunnel/agent/tools/fs/actions.js"));

const docsPath = path.join(root, "geelooy/api/tunnel/control/docs/actions.js");
const aiActionsPath = path.join(root, "geelooy/ai/central/generatedTunnelActions.js");
const yamlPath = path.join(root, "geelooy/apps/tunnel-control/gpt/awtsmoos-action-openapi.yaml");
const liveYamlPath = path.join(root, "geelooy/apps/tunnel-control/gpt/awtsmoos-action-openapi.generated-live.yaml");

const OPENAI_AGENT_MISSION_RULE = "OpenAI agent mission rule: never ask the user 'should I continue', 'would you like me to', 'let me know', or similar while safe autonomous work remains. After every action, inspect aiGuidance. If work remains, do the smallest safe inspect/test/checkpoint action and call finishAndContinue with remaining tasks instead of stopping. Ask the user only when blocked by a required decision, secret, or unsafe/destructive action, and include blocker proof: safeActionsTried, exact whyUserNeeded, checkpoint/handoff status, and nextIfApproved.";

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
  ["goal"], ["goal64"], ["command"], ["command64"], ["commands"], ["commands64"], ["script"], ["script64"], ["scriptText"], ["expression"], ["expression64"], ["html"], ["html64"],
  ["testCode"], ["testCode64"], ["workflow"], ["workflow64"], ["workflowName"], ["tree"], ["tree64"], ["commandTree"], ["commandTree64"], ["vars"], ["vars64"], ["steps"], ["steps64"], ["params"], ["params64"], ["probes"], ["probes64"],
  ["interactions"], ["interactions64"], ["actions"], ["actions64"], ["actionsJson"], ["actionsJson64"], ["browserActions"], ["browserActions64"], ["pageActions"], ["pageActions64"],
  ["returnValues"], ["returnValues64"], ["values"], ["values64"], ["url"], ["urlPath"], ["method", "GET"], ["headers"], ["headers64"], ["body"], ["body64"], ["bodyEncoding", "utf8"],
  ["selector"], ["chromePath"], ["userDataDir"], ["host", "127.0.0.1"], ["index", "index.html"], ["serverId"], ["sandboxId"], ["entry"], ["format", "png"],
  ["runtime"], ["engine"], ["mode"], ["readMode"], ["writeMode"], ["searchMode"], ["kind"], ["xml"], ["xmlInput"], ["writesXml"], ["filesXml"], ["bundle"], ["part"],
  ["continuationPrompt"], ["continuationPrompt64"], ["provider"], ["providerId"], ["agent"], ["agentId"], ["model"], ["apiKey"], ["apiKey64"], ["message"], ["message64"],
  ["prompt"], ["prompt64"], ["system"], ["system64"], ["taskId"], ["title"], ["outputDir"], ["fileName"], ["summaryAgentId"], ["summaryFileName"], ["parentTaskId"], ["rootTaskId"], ["taskKind"], ["treeId"], ["nodeId"], ["outputId"], ["outputRef"], ["resultId"], ["resultRef"], ["jobId"], ["stream"]
];
const integerParams = [
  ["offsetChars", 0], ["maxChars", 12000], ["totalMaxChars", 24000], ["offsetBytes", 0], ["maxBytes", 24000], ["maxFiles", 5], ["maxResults", 80], ["page", 1], ["pageSize", 50],
  ["cursor", 0], ["nextCursor"], ["maxInlineBytes", 12000], ["maxInlineChars", 12000], ["pageChars", 12000], ["depth", 2], ["limit", 150], ["timeoutMs", 240000], ["maxText", 4000], ["maxSteps", 50], ["maxIterations", 20],
  ["budgetPerutas"], ["budget"], ["maxPerutas"], ["estimatedPerutas"], ["ttlSeconds"],
  ["port", 9222], ["chromePort", 9222], ["waitMs", 800], ["pollMs", 1000], ["settleMs", 2500], ["startupWaitMs", 1200], ["maxDepth", 3], ["maxChildrenPerTask", 8],
  ["maxTotalTasks", 80], ["pollIntervalMs", 7000], ["promotionCycles", 7], ["agentCycles", 8], ["chapterCycles", 8], ["providerTimeoutMs", 45000]
];
const booleanParams = [
  ["checkSyntax", true], ["runtimeCheck", false], ["regex", false], ["replaceAll", true], ["dryRun", true], ["confirm", false], ["includeDirs", false], ["write", false],
  ["snapshot", true], ["headless", false], ["fullPage", true], ["allowWrite"], ["allowSecrets"], ["enableLocalHttpProxy"], ["allowCommands"], ["stream"], ["async"], ["asyncCommand"], ["background"], ["guidanceDebug", false],
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
    `      description: B\"H. Run one tunnel action. ${OPENAI_AGENT_MISSION_RULE} Old YAML remains compatible: action aliases still work, including commands/commands64 as aliases for command/command64. New callers can use commandTree tree/vars/budget fields, commandStart/commandStatus/commandJobOutputPage async command jobs, commandOutputPage sync output paging, mode/readMode/writeMode, XML write payloads, cursor pagination, Chrome-first simulateRuntime, and AI-agent params through the same GET endpoint.`,
    "      security: [{ OAuth2: [profile, tunnel.read, tunnel.write, tunnel.command, tunnel.browser, tunnel.admin] }]",
    "      parameters:",
    "        - { name: tunnelName, in: path, required: true, schema: { type: string }, description: Connected tunnel name, auto, or awtsmoos-virtual-os for hosted Virtual OS. }",
    "        - name: action",
    "          in: query",
    "          required: true",
    "          description: Select the tunnel action. If work remains after any action, use finishAndContinue instead of asking the user whether to continue.",
    "          schema:",
    "            type: string",
    "            enum:",
    ...actions.map(action => `              - ${action}`),
    ...stringParams.map(([name, def]) => paramLine(name, "string", def)),
    ...integerParams.map(([name, def]) => paramLine(name, "integer", def)),
    ...booleanParams.map(([name, def]) => paramLine(name, "boolean", def)),
    "      responses:",
    "        \"200\": { description: OK. Inspect aiGuidance; when aiGuidance.keepGoing is true or work remains, continue with the next safe action or finishAndContinue instead of asking the user to continue., content: { application/json: { schema: { $ref: \"#/components/schemas/AnyResponse\" } } } }"
  ];
}

function yaml() {
  return [
    "openapi: 3.1.0",
    "info:",
    "  title: Awtsmoos Tunnel Control GPT Actions Live Agent Surface",
    "  version: 6.1.0-generated",
    `  description: B\"H. Generated from the local tunnel registry. ${OPENAI_AGENT_MISSION_RULE} One backward-compatible action endpoint exposes old aliases and new mode-based internals.`,
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
    "        outputId: { type: string }",
    "        outputRef: { type: string }",
    "        jobId: { type: string }",
    "        statusPayload: { type: object, additionalProperties: true }",
    "        stdoutPagePayload: { type: object, additionalProperties: true }",
    "        stderrPagePayload: { type: object, additionalProperties: true }",
    "        nextRequest: { type: object, additionalProperties: true }",
    "        nextPagePayload: { type: object, additionalProperties: true }",
    "        nextStdoutPagePayload: { type: object, additionalProperties: true }",
    "        nextStderrPagePayload: { type: object, additionalProperties: true }",
    "        nextScanRequest: { type: object, additionalProperties: true }",
    "        aiGuidance: { type: object, additionalProperties: true, description: Read this after every action. If keepGoing/hardAutonomy is true, continue or call finishAndContinue; do not ask the user to continue unless blocked with proof. }",
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
  hasLegacyActions: ["read", "bulk", "tree", "write", "bulkWrite", "writeIfHash", "simulateRuntime", "aiAgentMessage"].every(x => yamlText.includes(`              - ${x}`)),
  hasNewModeParams: ["mode", "readMode", "writeMode", "xml", "writesXml", "cursor", "guidanceDebug"].every(x => yamlText.includes(`name: ${x}`)),
  hasCommandTreeParams: ["tree", "tree64", "vars", "vars64", "budgetPerutas", "treeId"].every(x => yamlText.includes(`name: ${x}`)),
  hasCommandPagingParams: ["commandOutputPage", "commandStart", "commandStatus", "commandJobOutputPage", "outputId", "jobId", "stream", "offsetChars", "maxChars", "asyncCommand", "background"].every(x => yamlText.includes(x.startsWith("command") ? `              - ${x}` : `name: ${x}`)),
  hasChatGptActions: ["chatgptLogin", "chatgptMessage", "chatgptContinueConversation"].every(x => yamlText.includes(`              - ${x}`)),
  hasRuntimeParams: ["actionsJson64", "browserActions64", "pageActions64", "engine"].every(x => yamlText.includes(`name: ${x}`)),
  hasHardAutonomyOpenApi: yamlText.includes("OpenAI agent mission rule") && yamlText.includes("finishAndContinue") && yamlText.includes("blocked with proof")
}, null, 2));
