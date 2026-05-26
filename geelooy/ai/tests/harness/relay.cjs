//B"H
const http = require("http");
const { ROOT, assert, test } = require("./assert.cjs");
const { startServer } = require("../../relay/split-browser/server.cjs");

/**
 * B"H — Spins up a local upstream and the split-browser relay.
 * It verifies multiple independent relay streams, POST body preservation,
 * generic allowed-origin behavior, and redirect mapping in one isolated run.
 */
async function run() {
  return test("node-relay-multi-streams-and-bodies", async () => {
    let upstream;
    let relay;
    try {
      upstream = http.createServer((req, res) => {
        if (req.url === "/redirect") { res.writeHead(302, { location: "/next" }); return res.end(); }
        const url = new URL(req.url, "http://x");
        const chunks = [];
        req.on("data", c => chunks.push(c));
        req.on("end", () => {
          if (url.pathname === "/stream") {
            res.writeHead(200, { "content-type": "text/plain" });
            return res.end(`${url.searchParams.get("id")}-0;${url.searchParams.get("id")}-1;${url.searchParams.get("id")}-2;`);
          }
          res.writeHead(200, { "content-type": "application/json" });
          res.end(JSON.stringify({ method: req.method, url: req.url, body: Buffer.concat(chunks).toString("utf8") }));
        });
      });
      await listen(upstream, 39821);
      const origin = "http://127.0.0.1:39821";
      relay = startServer({ port: 39822, host: "127.0.0.1", targetOrigin: origin, allowedOrigins: [origin], verbose: false });
      await new Promise(resolve => relay.on("listening", resolve));
      const base = "http://127.0.0.1:39822";
      const post = await (await fetch(base + "/echo", { method: "POST", headers: { "content-type": "text/plain" }, body: "hello" })).json();
      assert(post.method === "POST" && post.body === "hello", "proxy POST body must survive", post);
      const redirect = await fetch(base + "/redirect", { redirect: "manual" });
      assert(redirect.status === 302 && (redirect.headers.get("location") || "").includes("/next"), "redirect must map locally");
      const starts = [];
      for (let i = 0; i < 5; i++) {
        starts.push(await (await fetch(base + "/fetch", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ url: `${origin}/stream?id=${i}`, options: { method: "GET" } }) })).json());
      }
      const texts = [];
      for (const meta of starts) {
        texts.push((await (await fetch(base + "/body", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ id: meta.id, bodyAction: "text" }) })).json()).result);
      }
      assert(new Set(starts.map(s => s.id)).size === starts.length, "relay stream ids must be unique");
      assert(texts.every((text, i) => text === `${i}-0;${i}-1;${i}-2;`), "all relay streams must complete", { texts });
      return { post: true, redirect: true, streams: starts.length };
    } finally {
      try { relay?.close(); } catch {}
      try { upstream?.close(); } catch {}
    }
  });
}
function listen(server, port) { return new Promise(resolve => server.listen(port, "127.0.0.1", resolve)); }
module.exports = { run };
