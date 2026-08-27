// B"H
const assert = require("assert");
const fs = require("fs");
const fsp = require("fs/promises");
const http = require("http");
const path = require("path");
const { maybeSendBundle } = require("../../zipBundles/bundleRoute.js");
const { parseManifest } = require("../../zipBundles/bundleManifest.js");
const { readZip } = require("./zipTestReader.cjs");

/**
 * B"H
 * Chapter 403: Before the living tunnel restarts, a temporary universe installs
 * itself from local bundle requests. This proves the ZIP route and installer
 * extraction without touching ~/.awtsmoos-tunnel.
 */
const repoRoot = process.cwd();
const publicRoot = path.join(repoRoot, "geelooy");
const agentRoot = path.join(publicRoot, "apps/tunnel/agent");
const manifestPath = path.join(agentRoot, "manifest.txt");
const installRoot = path.join(repoRoot, "AI_THOUGHTS/runtime-stress/.tmp-zip-install-root");

function makeResponse(res) {
  return { statusCode: 200, setHeader: (k, v) => res.setHeader(k, v), end: body => res.end(body) };
}

function serveManifest(res) {
  res.setHeader("Content-Type", "text/plain; charset=utf-8");
  res.end(fs.readFileSync(manifestPath));
}

function server() {
  return http.createServer(async (req, res) => {
    try {
      const url = new URL(req.url, "http://127.0.0.1");
      if (url.pathname !== "/apps/tunnel/agent/manifest.txt") { res.statusCode = 404; res.end("no"); return; }
      if (!url.searchParams.get("bundle")) { serveManifest(res); return; }
      const query = Object.fromEntries(url.searchParams.entries());
      const sent = await maybeSendBundle({
        filePath: manifestPath,
        dependencies: {
          fs: fsp,
          request: { method: "GET", socket: { remoteAddress: "isolated-test" }, headers: {}, yeser: {} },
          response: makeResponse(res),
          paramKinds: { GET: query }
        }
      });
      if (!sent) { res.statusCode = 500; res.end("not sent"); }
    } catch (error) {
      res.statusCode = 500;
      res.end(error.stack || error.message);
    }
  });
}

async function fetchBuffer(url) {
  const r = await fetch(url);
  const body = Buffer.from(await r.arrayBuffer());
  assert.equal(r.ok, true, `${url} failed: ${r.status} ${body.toString("utf8").slice(0, 500)}`);
  return body;
}

async function installFromBundles(baseUrl) {
  fs.rmSync(installRoot, { recursive: true, force: true });
  await fsp.mkdir(installRoot, { recursive: true });
  const manifestText = (await fetchBuffer(baseUrl + "/apps/tunnel/agent/manifest.txt")).toString("utf8");
  const parsed = parseManifest(manifestText);
  const bundleManifest = JSON.parse((await fetchBuffer(baseUrl + "/apps/tunnel/agent/manifest.txt?bundle=manifest")).toString("utf8"));
  assert.ok(bundleManifest.bundles.length >= 3, "expected several bundles");
  for (const bundle of bundleManifest.bundles) {
    const zip = await fetchBuffer(baseUrl + bundle.url);
    const entries = readZip(zip);
    assert.equal(entries.size, bundle.files, `entry count mismatch for ${bundle.name}`);
    for (const [name, content] of entries) {
      const dest = path.join(installRoot, name);
      assert.ok(path.relative(installRoot, dest).indexOf("..") !== 0, "unsafe extraction path");
      await fsp.mkdir(path.dirname(dest), { recursive: true });
      await fsp.writeFile(dest, content);
    }
  }
  assert.ok(fs.existsSync(path.join(installRoot, parsed.entry)), "entry missing after install");
  for (const file of parsed.files) assert.ok(fs.existsSync(path.join(installRoot, file)), "missing " + file);
  return { version: parsed.version, entry: parsed.entry, files: parsed.files.length, bundles: bundleManifest.bundles.length };
}

(async () => {
  const s = server();
  await new Promise(resolve => s.listen(0, "127.0.0.1", resolve));
  const port = s.address().port;
  try {
    const result = await installFromBundles(`http://127.0.0.1:${port}`);
    console.log(JSON.stringify({ ok: true, result }, null, 2));
  } finally {
    await new Promise(resolve => s.close(resolve));
  }
})().catch(error => {
  console.error(JSON.stringify({ ok: false, error: error.message, stack: error.stack }, null, 2));
  process.exit(1);
});
