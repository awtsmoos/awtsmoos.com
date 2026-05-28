//B"H
const fs = require("fs");
const path = require("path");
const vm = require("vm");
const { ROOT, assert, test } = require("./assert.cjs");

async function run() {
  const results = [];
  results.push(await safeExtensionAuthFailureTest());
  return { ok:results.every(r => r.ok), name:"extension-auth-automation-hardening", ms:results.reduce((n,r)=>n+r.ms,0), facts:Object.fromEntries(results.map(r => [r.name, r.facts])) };
}

function safeExtensionAuthFailureTest() {
  return test("extension-auth-failures-structured-no-secret-no-commit", async () => {
    const ext = path.join(ROOT, "../scripts/tricks/extensions/server/bgAutomation");
    const context = makeContext();
    vm.runInNewContext(fs.readFileSync(path.join(ext, "authErrors.js"), "utf8"), context, { filename:"authErrors.js" });
    vm.runInNewContext(fs.readFileSync(path.join(ext, "turnState.js"), "utf8"), context, { filename:"turnState.js" });
    vm.runInNewContext(fs.readFileSync(path.join(ext, "sendVerifier.js"), "utf8"), context, { filename:"sendVerifier.js" });

    context.__fetchMode = "missing-token";
    const missing = await capture(() => context.AwtsmoosBgSendVerifier.sendAndVerify({ conversationId:"c", prompt:"p" }));
    const missingPublic = context.AwtsmoosBgAuthErrors.publicError(missing.error);
    const missingTurn = context.AwtsmoosBgTurnState.errorTurn(missing.error);

    context.__fetchMode = "rate-limit";
    const limited = await capture(() => context.AwtsmoosBgSendVerifier.sendAndVerify({ conversationId:"c", prompt:"p" }));
    const limitedPublic = context.AwtsmoosBgAuthErrors.publicError(limited.error);

    const serialized = JSON.stringify({ missingPublic, missingTurn, limitedPublic });
    assert(missingPublic.status === "missing_token" && missingPublic.error === "token_absent", "missing token must become structured auth failure", missingPublic);
    assert(missingTurn.pendingTurn === 0 && missingTurn.status === "error" && missingTurn.error === "token_absent", "missing token must not commit a fake turn", missingTurn);
    assert(limitedPublic.status === "rate_limited" && limitedPublic.error === "rate_limited", "429 must become structured rate-limit failure", limitedPublic);
    assert(!serialized.includes("secret-token"), "safe extension auth errors must not leak raw tokens");
    return { missing:missingPublic.status, missingTurn:missingTurn.error, limited:limitedPublic.status };
  });
}

function makeContext() {
  const context = { console, TextDecoder, crypto:{ randomUUID:() => "uuid-1" }, globalThis:null };
  context.globalThis = context;
  context.AwtsmoosBgSettledConversationPoller = {
    waitForReadyParent: async () => ({ parentNodeId:"assistant-0" }),
    waitForSettledAssistantAfter: async () => ({ ok:true, text:"reply", assistantMessageId:"assistant-1", userMessageId:"user-1", conversationId:"c" }),
    messageText: msg => msg?.content?.parts?.[0] || ""
  };
  context.fetch = async (url, options = {}) => {
    const text = String(url);
    if (text.includes("/api/auth/session")) return fakeJson(200, context.__fetchMode === "missing-token" ? { user:null } : { accessToken:"secret-token" });
    if (text.includes("/backend-api/conversation")) return context.__fetchMode === "rate-limit" ? fakeJson(429, { error:"slow down" }) : fakeStream();
    return fakeJson(404, {});
  };
  return context;
}

function fakeJson(status, body) { return { ok:status >= 200 && status < 300, status, json:async()=>body }; }
function fakeStream() { return { ok:true, status:200, body:{ getReader(){ return { read:async()=>({ done:true }) }; } } }; }
async function capture(fn) { try { return { ok:true, value:await fn() }; } catch (error) { return { ok:false, error }; } }
module.exports = { run };
