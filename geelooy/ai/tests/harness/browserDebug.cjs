//B"H
const http = require("http");
const { assert, test } = require("./assert.cjs");
const { toLocalForTest, browserRewriteScript } = require("../../relay/split-browser/browserRewrite.cjs");
const { loadConfig } = require("../../relay/split-browser/config.cjs");
const { startServer } = require("../../relay/split-browser/server.cjs");
const { autoLoginScript } = require("../../relay/split-browser/autoLogin.cjs");
const { debugClientScript } = require("../../relay/split-browser/debugClient.cjs");
const { isImportant } = require("../../relay/split-browser/logger.cjs");
const { transformBody } = require("../../relay/split-browser/bodyTransform.cjs");

/**
 * B"H — Tests the local-browser illusion and Puppeteer-style queue.
 * It does not need Chrome: it verifies deterministic URL mapping, default auth
 * origins, generated shim syntax, and the server command queue endpoints.
 */
async function run() {
  return test("browser-rewrite-and-debug-api", async () => {
    const config = loadConfig();
    assert(config.allowedOrigins.includes("https://accounts.google.com"), "Google login origin should be allowed by default");
    assert(toLocalForTest("https://chatgpt.com/c/abc?x=1", { targetOrigin: "https://chatgpt.com" }) === "/c/abc?x=1", "target URL should become local path");
    assert(toLocalForTest("/backend-api/me", { targetOrigin: "https://chatgpt.com" }) === "/backend-api/me", "local-relative URL should remain local");
    const google = toLocalForTest("https://accounts.google.com/o/oauth2/v2/auth?client_id=x", { targetOrigin: "https://chatgpt.com" });
    assert(google.startsWith("/proxy?u="), "Google login URL should route through local proxy", { google });
    new Function(browserRewriteScript("https://chatgpt.com"));
    new Function(autoLoginScript());
    new Function(debugClientScript());
    assert(!isImportant("route:incoming", { method: "POST", status: 200 }), "normal POST route logs should be quiet by default");
    assert(isImportant("proxy:error", { status: 500 }), "errors should still log");
    const transformed = transformBody(Buffer.from("console.log('x')"), "application/javascript", new URL("/app.js", "http://localhost"), "https://chatgpt.com");
    const transformedText = String(transformed.body);
    assert(transformedText.includes("awtsmoosAutoLoginClicked"), "auto login script must be injected into JS responses");
    assert(transformedText.includes("__awtsmoosDebugClient"), "debug client must be injected into JS responses");
    let relay;
    try {
      relay = startServer({ port: 39922, host: "127.0.0.1", targetOrigin: "https://chatgpt.com", allowedOrigins: config.allowedOrigins, verbose: false });
      await new Promise(resolve => relay.on("listening", resolve));
      const base = "http://127.0.0.1:39922";
      const session = await (await fetch(base + "/debug/session")).json();
      assert(session.ok && session.session?.id, "debug session should be created", session);
      const goto = await (await fetch(base + "/debug/goto", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ session: session.session.id, url: "https://chatgpt.com/g/g-1" }) })).json();
      assert(goto.ok && goto.command.payload.url === "/g/g-1", "debug goto should rewrite target URL", goto);
      const evalCmd = await (await fetch(base + "/debug/evaluate", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ session: session.session.id, expression: "1+1" }) })).json();
      assert(evalCmd.ok, "debug evaluate command should enqueue", evalCmd);
      const pending = await (await fetch(base + "/debug/commands?session=" + encodeURIComponent(session.session.id))).json();
      assert(pending.commands.length === 2, "debug pending commands should include goto and evaluate", pending);
      const result = await (await fetch(base + "/debug/result", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ session: session.session.id, command: pending.commands[0].id, ok: true, result: { href: "/g/g-1" } }) })).json();
      assert(result.ok, "debug result should be accepted", result);
      return { authOrigins: config.allowedOrigins.length, commands: pending.commands.length };
    } finally {
      try { relay?.close(); } catch {}
    }
  });
}

module.exports = { run };
