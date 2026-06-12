// B"H
const assert = require("assert");
const fs = require("fs");
const path = require("path");
const { buildActions } = require("../../fs/actions.js");
const { buildManifest } = require("../../../rebuild-manifest.cjs");
const { idFromUrl } = require("../conversations/registry.js");
const { browserScript: promptScript } = require("../runtime/sendPrompt.js");
const { browserScript: responseScript } = require("../runtime/waitForResponse.js");
const { legacyConversationBody } = require("../direct/legacyRequest.js");
const { browserPreparedFetchScript } = require("../direct/browserInjectedRequest.js");

const ROOT = path.resolve(__dirname, "../../../../..");
const config = {
  root: process.cwd(),
  allowWrite: true,
  allowSecrets: false,
  tools: { chrome: true, fsRead: true, fsWrite: true, fsBulk: true, fsList: true, fsTree: true },
  chrome: { enabled: true, port: 9223 }
};

/**
 * B"H
 * Chapter 438: The Test Suite Drew A Holy Boundary Around The Fire.
 *
 * These tests are source-level research guards. They prove the request path is
 * shaped for debug Chrome injection, while refusing to make Node synthesize
 * protected Sentinel or Turnstile secrets. The Awtsmoos lets the page speak from
 * its real browser mouth; Node remains the scribe that prepares body and CDP
 * expression only.
 */
function testActionRegistration() {
  const actions = buildActions(config, { action: "chatgptStatus" }, null);
  const names = [
    "chatgptLogin",
    "chatgptOpenLogin",
    "chatgptStatus",
    "chatgptMessage",
    "chatgptContinueConversation",
    "chatgptNewConversation",
    "chatgptCurrentConversation",
    "chatgptListConversations"
  ];
  for (const name of names) assert.equal(typeof actions[name], "function", name);
  return names.length;
}

function testConversationId() {
  assert.equal(idFromUrl("https://chatgpt.com/c/abc_DEF-123"), "abc_DEF-123");
  assert.equal(idFromUrl("https://chatgpt.com/g/example/c/abc_DEF-123"), "abc_DEF-123");
  assert.equal(idFromUrl("https://chatgpt.com/"), null);
  return true;
}

function testManualTextareaScriptsCompile() {
  assert.ok(promptScript("hello").includes("promptSelectors"));
  assert.ok(responseScript().includes("ASSISTANT") === false);
  return true;
}

function testInjectedRequestExpressionCompiles() {
  const body = exampleConversationBody();
  const expression = browserPreparedFetchScript({ token: "token-for-shape-only", body, priorConduitToken: "" });
  assert.doesNotThrow(() => new Function("return " + expression));
  assert.ok(expression.includes("/backend-api/f/conversation/prepare"));
  assert.ok(expression.includes("/backend-api/sentinel/chat-requirements/prepare"));
  assert.ok(expression.includes("/backend-api/sentinel/ping"));
  assert.ok(expression.includes("/backend-api/f/conversation"));
  return expression.length;
}

function testInjectedRequestSendsFinalBodyToPrepare() {
  const body = exampleConversationBody();
  const expression = browserPreparedFetchScript({ token: "token-for-shape-only", body, priorConduitToken: "" });
  assert.ok(expression.includes("const preparedBody = { ...finalBody, client_prepare_state: 'success' };"));
  assert.ok(expression.includes("paths.conversationPrepare"));
  assert.ok(expression.includes("preparedBody"));
  assert.ok(expression.includes("body: JSON.stringify(preparedBody)"));
  return true;
}

function testInjectedRequestUsesBrowserCredentialsOnly() {
  const expression = browserPreparedFetchScript({ token: "token-for-shape-only", body: exampleConversationBody(), priorConduitToken: "" });
  assert.ok(expression.includes("credentials: 'include'"));
  assert.ok(!expression.includes("'cookie'"));
  assert.ok(!expression.includes("'user-agent'"));
  assert.ok(!expression.includes("tokenClassLegacy"));
  return true;
}

function testConsoleTransportDoesNotImportLegacySentinel() {
  const source = readProjectFile("tools/chatgpt/direct/browserConsoleConversation.js");
  assert.ok(source.includes("browserPreparedFetchScript"));
  assert.ok(source.includes("chromeEval"));
  assert.ok(!source.includes("sentinelHeaders"));
  assert.ok(!source.includes("tokenClassLegacy"));
  assert.ok(!source.includes("getChatRequirements"));
  return true;
}

function testResearchBoundaryIsEncoded() {
  const injected = readProjectFile("tools/chatgpt/direct/browserInjectedRequest.js");
  assert.ok(injected.includes("chat-requirements/prepare"));
  assert.ok(injected.includes("sentinelPing"));
  assert.ok(injected.includes("turnstileToken"));
  assert.ok(!injected.includes("getRequirementsToken"));
  assert.ok(!injected.includes("getEnforcementToken"));
  assert.ok(!injected.includes("tokenClassLegacy"));
  return true;
}

function testManifestCoverage() {
  const manifest = buildManifest();
  const needed = [
    "tools/chatgpt/index.js",
    "tools/chatgpt/actions/login.js",
    "tools/chatgpt/runtime/sendPrompt.js",
    "tools/chatgpt/auth/sessionCheck.js",
    "tools/chatgpt/direct/browserConsoleConversation.js",
    "tools/chatgpt/direct/browserInjectedRequest.js"
  ];
  for (const file of needed) assert.ok(manifest.files.includes(file), "manifest missing " + file);
  return manifest.files.length;
}

function exampleConversationBody() {
  return legacyConversationBody({
    payload: {
      conversationId: "conversation-id-for-shape-only",
      timezone: "America/New_York",
      timezoneOffsetMin: 240
    },
    message: "B'H source-level shape test only.",
    parentMessageId: "parent-id-for-shape-only",
    userMessageId: "user-id-for-shape-only",
    prepared: { ok: true, conversation: { ok: true }, tokens: { conduitToken: "browser-prepared" } }
  });
}

function readProjectFile(relative) {
  return fs.readFileSync(path.join(ROOT, "agent", relative), "utf8");
}

(async () => {
  const summary = {
    registrationCount: testActionRegistration(),
    conversationId: testConversationId(),
    manualTextareaScripts: testManualTextareaScriptsCompile(),
    injectedExpressionLength: testInjectedRequestExpressionCompiles(),
    prepareBodyShape: testInjectedRequestSendsFinalBodyToPrepare(),
    browserCredentialBoundary: testInjectedRequestUsesBrowserCredentialsOnly(),
    consoleTransportBoundary: testConsoleTransportDoesNotImportLegacySentinel(),
    researchBoundary: testResearchBoundaryIsEncoded(),
    manifestFiles: testManifestCoverage()
  };
  console.log(JSON.stringify({ ok: true, summary }, null, 2));
  process.exit(0);
})().catch(error => {
  console.error(JSON.stringify({ ok: false, error: error.message, stack: error.stack }, null, 2));
  process.exit(1);
});
