// B"H
const fs = require("fs");
const path = require("path");
const root = path.resolve(__dirname, "..");
const { buildActions } = require(path.join(root, "geelooy/apps/tunnel/agent/tools/fs/actions.js"));

const outYaml = path.join(root, "geelooy/apps/tunnel-control/gpt/awtsmoos-action-openapi.yaml");
const outLive = path.join(root, "geelooy/apps/tunnel-control/gpt/awtsmoos-action-openapi.generated-live.yaml");
const outDocs = path.join(root, "geelooy/api/tunnel/control/docs/actions.js");
const outAi = path.join(root, "geelooy/ai/central/generatedTunnelActions.js");
const RULE = "After every response, obey responseFocus.oneMainThing. If multipleChoiceSelfInterrogation is present, answer with multipleChoiceAnswer/choice/answer before any unrelated action. If ignored, the server returns allCapsPrompt and blocks continuation.";

/**
 * B"H
 * Chapter 819: The schema stopped shouting and kept only the covenant.
 */
function actions() {
  const config = { root, allowWrite: true, allowCommands: true, tools: { fsRead: true, fsWrite: true, fsBulk: true, command: true, chrome: true, browser: true } };
  return [...new Set([...Object.keys(buildActions(config, { action: "list" }, null)), "commandWait"])].filter(x => x !== "findReplace").sort((a, b) => a.localeCompare(b));
}

function param(name, type = "string", def) {
  const tail = def === undefined ? "" : `, default: ${JSON.stringify(def)}`;
  return `        - { name: ${name}, in: query, schema: { type: ${type}${tail} } }`;
}

function params() {
  const strings = ["p", "path", "cwd", "root", "content", "content64", "find", "find64", "replace", "replace64", "query", "query64", "command", "command64", "text", "text64", "goal", "goal64", "params", "params64", "actions", "actions64", "actionsJson", "actionsJson64", "writes", "writes64", "files", "files64", "paths", "paths64", "url", "selector", "targetVessel", "vessel", "fallback", "jobId", "stream", "continuationPrompt", "continuationPrompt64", "multipleChoiceAnswer", "choice", "answer", "missionId", "projectRoot", "logicalAgentId", "agentSessionId", "agentId", "agentName", "claimId", "delegationId", "provider", "providerId", "model", "apiKey", "apiKey64", "message", "message64", "prompt", "prompt64", "system", "system64"];
  const ints = [["offsetChars", 0], ["maxChars", 12000], ["totalMaxChars", 24000], ["maxFiles", 5], ["depth", 2], ["limit", 150], ["timeoutMs", 240000], ["page", 1], ["pageSize", 50], ["port", 9222], ["pollIntervalMs", 7000], ["leaseMs", 3600000]];
  const bools = [["allowWrite"], ["allowCommands"], ["allowSecrets"], ["enableLocalHttpProxy"], ["regex", false], ["replaceAll", true], ["dryRun", true], ["confirm", false], ["stream"], ["guidanceDebug", false], ["debugGuidance", false], ["blockOnUserMessage", true], ["allowContinue", false]];
  return [...strings.map(x => param(x)), ...ints.map(([n, d]) => param(n, "integer", d)), ...bools.map(([n, d]) => param(n, "boolean", d))];
}

function yaml(actionNames) {
  return [
    "openapi: 3.1.0", "info:", "  title: Awtsmoos Tunnel Control GPT Actions", "  version: 7.0.0-generated", `  description: B\"H. ${RULE}`, "servers:", "  - url: https://awtsmoos.com", "paths:",
    "  /api/tunnel/control/bootstrap:", "    get:", "      operationId: awtsmoosBootstrap", "      summary: Get setup instructions.", "      security: []", "      responses:", "        \"200\": { description: OK, content: { application/json: { schema: { $ref: \"#/components/schemas/AnyResponse\" } } } }",
    "  /api/tunnel/control/my-device:", "    get:", "      operationId: awtsmoosMyDevice", "      summary: Discover active connected tunnel.", "      security: [{ OAuth2: [profile, tunnel.read] }]", "      responses:", "        \"200\": { description: OK, content: { application/json: { schema: { $ref: \"#/components/schemas/AnyResponse\" } } } }",
    "  /api/tunnel/control/fs/{tunnelName}:", "    get:", "      operationId: awtsmoosTunnelAction", "      summary: Run one tunnel action.", `      description: B\"H. ${RULE} Use guidanceDebug=true only when raw protocol details are needed.`, "      security: [{ OAuth2: [profile, tunnel.read, tunnel.write, tunnel.command, tunnel.browser, tunnel.admin] }]", "      parameters:", "        - { name: tunnelName, in: path, required: true, schema: { type: string } }", "        - name: action", "          in: query", "          required: true", "          schema:", "            type: string", "            enum:", ...actionNames.map(x => `              - ${x}`), ...params(), "      responses:", "        \"200\": { description: OK. Read responseFocus first. If multipleChoiceSelfInterrogation exists, answer it before any unrelated action., content: { application/json: { schema: { $ref: \"#/components/schemas/AnyResponse\" } } } }",
    "  /api/tunnel/control/preview/{tunnelName}:", "    get:", "      operationId: awtsmoosPreviewProxy", "      summary: Fetch preview through tunnel.", "      security: [{ OAuth2: [profile, tunnel.read] }]", "      parameters:", "        - { name: tunnelName, in: path, required: true, schema: { type: string } }", "        - { name: url, in: query, schema: { type: string } }", "        - { name: maxChars, in: query, schema: { type: integer, default: 500000 } }", "      responses:", "        \"200\": { description: Preview response body }",
    "components:", "  schemas:", "    AnyResponse:", "      type: object", "      additionalProperties: true", "      properties:", "        ok: { type: boolean }", "        error: { type: string }", "        action: { type: string }", "        jobId: { type: string }", "        content: { type: string }", "        responseFocus: { type: object, additionalProperties: true }", "        awtsmoosNext: { type: object, additionalProperties: true }", "        multipleChoiceSelfInterrogation: { type: object, additionalProperties: true }", "        allCapsPrompt: { type: string }", "        acceptedAnswerFormat: { type: string }", "        mustContinue: { type: boolean }", "        mustCallNext: { type: object, additionalProperties: true }", "        finalAnswerAllowed: { type: boolean }", "  securitySchemes:", "    OAuth2:", "      type: oauth2", "      flows:", "        authorizationCode:", "          authorizationUrl: https://awtsmoos.com/api/oauth/start", "          tokenUrl: https://awtsmoos.com/api/oauth/token", "          scopes:", "            profile: Basic identity access.", "            tunnel.read: Read tunnel state.", "            tunnel.write: Modify authorized files.", "            tunnel.command: Execute command diagnostics.", "            tunnel.browser: Browser automation.", "            tunnel.admin: Administrative tunnel operations.", ""
  ].join("\n");
}

function main() {
  const list = actions();
  const text = yaml(list);
  fs.writeFileSync(outYaml, text, "utf8");
  fs.writeFileSync(outLive, text, "utf8");
  fs.writeFileSync(outDocs, `// B\"H\nconst actions = ${JSON.stringify(list, null, 2)};\nmodule.exports = { actions };\n`, "utf8");
  fs.writeFileSync(outAi, `// B\"H\nexport const GENERATED_TUNNEL_ACTIONS = Object.freeze(${JSON.stringify(list, null, 2)});\nexport default GENERATED_TUNNEL_ACTIONS;\n`, "utf8");
  console.log(JSON.stringify({ ok: true, actionCount: list.length, yamlBytes: Buffer.byteLength(text), hasForcedChoice: text.includes("multipleChoiceAnswer") && text.includes("allCapsPrompt"), hasAliases: ["commandBatch", "aiCommandBatch", "nodeCheckFiles"].every(x => text.includes(`              - ${x}`)) }, null, 2));
}
main();
