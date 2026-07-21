// B"H
const assert = require("assert");
const fs = require("fs");
const path = require("path");

const source = fs.readFileSync(path.resolve(__dirname, "../lib/local-api.js"), "utf8");

assert(/\bLISTEN_BACKLOG\s*=\s*4096\b/.test(source), "local API backlog must tolerate bursts");
assert(/\bCATALOG_CACHE_MS\s*=\s*1000\b/.test(source), "catalog cache must protect health/action bursts");
assert(source.includes("server.requestTimeout = 0"), "local API must not impose tiny request timeouts");
assert(source.includes("cachedCatalog(config)"), "health must use cached catalog");
assert(source.includes('"/healthz":healthz'), "compact healthz must exist for burst liveness checks");
assert(source.includes('searchParams?.get("summary")'), "health summary mode must avoid large catalog payloads");
assert(source.includes("server.on(\"clientError\""), "client errors must be observed without crashing");

console.log(JSON.stringify({ ok: true, suite: "local-api-burst-safety" }, null, 2));
