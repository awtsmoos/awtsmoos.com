// B"H
const { handleRelay } = require("../../geelooy/apps/tunnel/agent/tools/relay/index.js");

async function main() {
  const status = await handleRelay({ action: "relayBrowserStatus" });
  console.log("STATUS", JSON.stringify({ ok: status.ok, connected: status.connected, port: status.port, error: status.error || null }));

  let launched = status.connected ? status : await handleRelay({ action: "relayBrowserLaunch", url: "https://chatgpt.com", startupWaitMs: 2500, timeoutMs: 45000 });
  console.log("LAUNCH", JSON.stringify({ ok: launched.ok, connected: launched.connected, action: launched.action, error: launched.error || null }));

  const nav = await handleRelay({ action: "relayBrowserNavigate", url: "https://chatgpt.com", timeoutMs: 45000, waitMs: 3000, snapshot: true, maxLogs: 40 });
  console.log("NAV", JSON.stringify({ ok: nav.ok, readyState: nav.navigation?.readyState, title: nav.snapshot?.title, url: nav.snapshot?.url, error: nav.error || null }));

  const cookies = await handleRelay({ action: "relayCookies", includeValues: false, syncToJar: true, jar: "chatgpt" });
  console.log("COOKIES", JSON.stringify({ ok: cookies.ok, count: cookies.count, cookieBytes: cookies.cookieBytes, synced: cookies.syncedJar?.copied, syncError: cookies.syncedJar?.error || null, error: cookies.error || null }));

  const header = await handleRelay({ action: "relayChatgptCookieHeader", source: "jar", jar: "chatgpt", url: "https://chatgpt.com/backend-api/accounts/check", includeValues: false });
  console.log("JAR", JSON.stringify({ ok: header.ok, count: header.count, cookieBytes: header.cookieBytes }));

  const cdp = await handleRelay({ action: "relayBrowserCdp", method: "Runtime.evaluate", params: { expression: "({title:document.title,href:location.href,ready:document.readyState})", returnByValue: true }, timeoutMs: 10000 });
  console.log("CDP", JSON.stringify({ ok: cdp.ok, value: cdp.result?.result?.value || null, error: cdp.error || null }));
}

main().catch(error => {
  console.error(error.stack || error.message || error);
  process.exit(1);
});
