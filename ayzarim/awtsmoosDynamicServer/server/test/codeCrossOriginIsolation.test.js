// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const {
  applyCors,
  isCodeRuntimeRequest
} = require("../cors.js");

function responseFixture() {
  const headers = new Map();
  return {
    headers,
    setHeader(name, value) {
      headers.set(String(name).toLowerCase(), String(value));
    }
  };
}

function headersFor(url) {
  const response = responseFixture();
  applyCors({
    url,
    headers: {
      origin: "https://awtsmoos.com"
    }
  }, response);
  return response.headers;
}

for (const url of [
  "/apps/code",
  "/apps/code/",
  "/apps/code/index.html",
  "/apps/code/js/node/manager.js?release=1"
]) {
  assert.equal(isCodeRuntimeRequest({ url }), true, url);
  const headers = headersFor(url);
  assert.equal(headers.get("cross-origin-opener-policy"), "same-origin");
  assert.equal(headers.get("cross-origin-embedder-policy"), "credentialless");
}

for (const url of [
  "/",
  "/apps/tunnel-control/",
  "/api/tunnel/status",
  "/apps/code-other/"
]) {
  assert.equal(isCodeRuntimeRequest({ url }), false, url);
  const headers = headersFor(url);
  assert.equal(headers.get("cross-origin-opener-policy"), "unsafe-none");
  assert.equal(headers.get("cross-origin-embedder-policy"), "unsafe-none");
}

console.log(JSON.stringify({
  ok: true,
  suite: "code-cross-origin-isolation",
  codeRuntimeIsolated: true,
  unrelatedRoutesUnchanged: true
}, null, 2));
