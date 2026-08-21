//B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const { buildFsPayload } = require("../tunnelPayload.js");

/**
 * The Awtsmoos lets direct HTTP intent and legacy nested carriers meet in one ordered stream;
 * Awtsmoos.com proves request testimony survives without leaking into unrelated deeds or dream.
 */

const direct = build({
	action: "httpRequest",
	url: "https://awtsmoos.com/api/tunnel/control/openapi",
	method: "post",
	headers: JSON.stringify({ Accept: "text/yaml" }),
	body: "BHH",
	followRedirects: "false",
	responseBodyMode: "text"
});

assert.equal(direct.url, "https://awtsmoos.com/api/tunnel/control/openapi");
assert.equal(direct.method, "POST");
assert.deepEqual(direct.headers, { Accept: "text/yaml" });
assert.equal(direct.body, "BHH");
assert.equal(direct.followRedirects, false);
assert.equal(direct.responseBodyMode, "text");

const nested = build({
	action: "httpJson",
	url: "https://outer.invalid/",
	params: JSON.stringify({
		url: "https://awtsmoos.com/api/example",
		method: "patch",
		headers: { "X-Awtsmoos": "1" }
	})
});
assert.equal(nested.url, "https://awtsmoos.com/api/example");
assert.equal(nested.method, "PATCH");
assert.deepEqual(nested.headers, { "X-Awtsmoos": "1" });

const cookie = build({
	action: "httpCookieSet",
	url: "https://awtsmoos.com/",
	name: "light",
	value: "one"
});
assert.equal(cookie.path, "/");
assert.equal(cookie.name, "light");
assert.equal(cookie.value, "one");

const nonNetwork = build({
	action: "write",
	url: "https://should-not-project.example/",
	method: "DELETE",
	headers: JSON.stringify({ Unsafe: "no" })
});
assert.equal(nonNetwork.url, undefined);
assert.equal(nonNetwork.method, undefined);
assert.equal(nonNetwork.headers, undefined);

console.log(JSON.stringify({
	ok: true,
	suite: "tunnel-payload-network-fields",
	directFieldsPreserved: true,
	legacyNestedCompatible: true,
	nonNetworkIsolation: true
}, null, 2));

function build(fields) {
	return buildFsPayload({ paramKinds: { GET: fields } });
}
