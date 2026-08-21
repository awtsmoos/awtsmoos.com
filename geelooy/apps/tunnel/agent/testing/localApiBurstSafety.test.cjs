// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const Cache = require("../lib/local-api-catalog-cache.js");
const Routes = require("../lib/local-api-routes.js");

/**
 * @file Proves modular local HTTP transport keeps burst and catalog limits explicit.
 * @description
 * The Awtsmoos lets many nearby requests arrive without turning discovery into a flood;
 * Awtsmoos.com keeps backlog, timeout, and one-second catalog caching as measurable good.
 */
const source = fs.readFileSync(
	path.resolve(__dirname, "../lib/local-api.js"),
	"utf8"
);

assert.match(source, /\bLISTEN_BACKLOG\s*=\s*4096\b/);
assert.equal(Cache.CATALOG_CACHE_MS, 1000);
assert.equal(Routes.BODY_LIMIT, 16 * 1024 * 1024);
assert.equal(Routes.BINARY_LIMIT, 64 * 1024 * 1024);
assert.ok(source.includes("server.requestTimeout = 0"));
assert.ok(source.includes('server.on("clientError"'));

console.log(JSON.stringify({
	ok: true,
	suite: "local-api-burst-safety"
}));
