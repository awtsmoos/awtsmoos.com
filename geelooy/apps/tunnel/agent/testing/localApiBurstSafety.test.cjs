// B"H
const assert = require("assert");
const fs = require("fs");
const path = require("path");

const source = fs.readFileSync(path.resolve(__dirname, "../lib/local-api.js"), "utf8");

assert(source.includes("const LISTEN_BACKLOG = 4096;"), "local API backlog must tolerate bursts");
assert(source.includes("const CATALOG_CACHE_MS = 1000;"), "catalog cache must protect health/action bursts");
assert(source.includes("server.requestTimeout = 0"), "local API must not impose tiny request timeouts");
assert(source.includes("cachedCatalog(config)"), "health must use cached catalog");
assert(source.includes("server.on(\"clientError\""), "client errors must be observed without crashing");

console.log(JSON.stringify({ ok: true, suite: "local-api-burst-safety" }, null, 2));
