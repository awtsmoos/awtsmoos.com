// B"H
const assert = require("assert");
const { handleRelay, ACTIONS } = require("../../geelooy/apps/tunnel/agent/tools/relay/index.js");

async function main() {
  assert.ok(ACTIONS.relayBrowserCdp, "raw CDP relay action missing");
  assert.ok(ACTIONS.relayBrowserSessionExport, "browser session export action missing");
  assert.ok(ACTIONS.relaySyncChromeToJar, "Chrome->jar sync action missing");
  assert.ok(ACTIONS.relaySyncJarToChrome, "jar->Chrome sync action missing");

  const jar = "bh-relay-test";
  const clear = await handleRelay({ action: "relayJarClear", jar });
  assert.equal(clear.ok, true, "jar clear failed");

  const set = await handleRelay({
    action: "relayJarSetCookie",
    jar,
    url: "https://chatgpt.com/",
    name: "__Secure-bh-test",
    value: "spark",
    domain: "chatgpt.com",
    path: "/",
    secure: true,
    includeValues: true
  });
  assert.equal(set.ok, true, "jar set failed");

  const header = await handleRelay({ action: "relayChatgptCookieHeader", source: "jar", jar, url: "https://chatgpt.com/backend-api/accounts/check", includeValues: true });
  assert.equal(header.ok, true, "jar header failed");
  assert.ok(header.cookieHeader.includes("__Secure-bh-test=spark"), "jar header missing test cookie");

  const listed = await handleRelay({ action: "relayJarCookies", jar, domain: "chatgpt.com", includeValues: true });
  assert.equal(listed.ok, true, "jar list failed");
  assert.ok(listed.cookies.some(cookie => cookie.name === "__Secure-bh-test" && cookie.value === "spark"), "jar list missing cookie");

  console.log(JSON.stringify({ ok: true, actions: Object.keys(ACTIONS).length, headerBytes: header.cookieBytes, listed: listed.cookies.length }));
}

main().catch(error => {
  console.error(error.stack || error.message || error);
  process.exit(1);
});
