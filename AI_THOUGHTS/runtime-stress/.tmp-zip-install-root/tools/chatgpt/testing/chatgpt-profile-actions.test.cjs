// B"H
const assert = require("assert");
const path = require("path");
const { buildActions } = require("../../fs/actions.js");
const { buildManifest } = require("../../../rebuild-manifest.cjs");
const { idFromUrl } = require("../conversations/registry.js");
const { browserScript: promptScript } = require("../runtime/sendPrompt.js");
const { browserScript: responseScript } = require("../runtime/waitForResponse.js");

/**
 * B"H
 * Source-level tests for the ChatGPT profile wing. They do not require an
 * authenticated account; live login/message tests are deliberately separate.
 */
const config = { root: process.cwd(), allowWrite: true, allowSecrets: false, tools: { chrome: true, fsRead: true, fsWrite: true, fsBulk: true, fsList: true, fsTree: true }, chrome: { enabled: true, port: 9223 } };

function testActionRegistration() {
  const actions = buildActions(config, { action: "chatgptStatus" }, null);
  for (const name of ["chatgptLogin", "chatgptOpenLogin", "chatgptStatus", "chatgptMessage", "chatgptContinueConversation", "chatgptNewConversation", "chatgptCurrentConversation", "chatgptListConversations"]) assert.equal(typeof actions[name], "function", name);
  return true;
}

function testConversationId() {
  assert.equal(idFromUrl("https://chatgpt.com/c/abc_DEF-123"), "abc_DEF-123");
  assert.equal(idFromUrl("https://chatgpt.com/"), null);
  return true;
}

function testScriptsCompile() {
  assert.ok(promptScript("hello").includes("promptSelectors"));
  assert.ok(responseScript().includes("ASSISTANT") === false);
  return true;
}

function testManifestCoverage() {
  const manifest = buildManifest();
  for (const needed of ["tools/chatgpt/index.js", "tools/chatgpt/actions/login.js", "tools/chatgpt/runtime/sendPrompt.js", "tools/chatgpt/auth/sessionCheck.js"]) assert.ok(manifest.files.includes(needed), "manifest missing " + needed);
  return manifest.files.length;
}

(async () => {
  const summary = { registration: testActionRegistration(), conversationId: testConversationId(), scripts: testScriptsCompile(), manifestFiles: testManifestCoverage() };
  console.log(JSON.stringify({ ok: true, summary }, null, 2));
  process.exit(0);
})().catch(error => {
  console.error(JSON.stringify({ ok: false, error: error.message, stack: error.stack }, null, 2));
  process.exit(1);
});
