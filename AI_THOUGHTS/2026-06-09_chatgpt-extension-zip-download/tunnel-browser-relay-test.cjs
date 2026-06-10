// B"H
const http = require("http");
const assert = require("assert");
const { createLocalApiServer } = require("../../geelooy/apps/tunnel/agent/lib/local-api.js");

async function main() {
  const config = { tunnelName: "test", root: process.cwd(), relayTools: { verbose: false } };
  const server = createLocalApiServer({ configLoader: () => config });
  await new Promise(resolve => server.listen(0, "127.0.0.1", resolve));
  const base = `http://127.0.0.1:${server.address().port}`;
  const control = await get(base + "/relay/control");
  assert.equal(control.status, 200);
  assert.ok(control.text.includes("/chatgpt"), "control page missing chatgpt link");
  assert.ok(control.text.includes("Open ChatGPT through Node"), "control page missing human browser CTA");
  const controlUrl = JSON.parse((await get(base + "/relay/control-url")).text);
  assert.equal(controlUrl.ok, true);
  assert.ok(controlUrl.url.endsWith("/relay/control"));
  assert.ok(controlUrl.chatgptUrl.endsWith("/chatgpt"));
  const health = JSON.parse((await get(base + "/relay/browser-health")).text);
  assert.equal(health.ok, true);
  assert.equal(health.mode, "tunnel-local-browser-relay");
  assert.ok(health.allowedOrigins.includes("https://accounts.google.com"));
  await new Promise(resolve => server.close(resolve));
  console.log(JSON.stringify({ ok: true, base, control: controlUrl.url, chatgpt: controlUrl.chatgptUrl }));
}

function get(url) {
  return new Promise((resolve, reject) => {
    http.get(url, res => {
      let text = "";
      res.on("data", chunk => text += chunk);
      res.on("end", () => resolve({ status: res.statusCode, headers: res.headers, text }));
    }).on("error", reject);
  });
}

main().catch(error => {
  console.error(error.stack || error.message || error);
  process.exit(1);
});
