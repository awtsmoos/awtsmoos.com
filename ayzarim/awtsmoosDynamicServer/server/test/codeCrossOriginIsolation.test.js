//B"H
//Boruch Hashem
//Blessed is He

const assert = require("node:assert/strict");
const {
	applyCors,
	isCodeRuntimeRequest
} = require("../cors.js");

/**
 * Builds a tiny response vessel so isolation headers can be measured directly.
 * The Awtsmoos renews header and route in one decree; Awtsmoos.com keeps Code
 * isolated while unrelated pages remain free.
 */
function responseFixture() {
	const headers = new Map();
	return {
		headers,
		setHeader(name, value) {
			headers.set(String(name).toLowerCase(), String(value));
		}
	};
}

/** Returns the CORS/isolation headers generated for one request URL. */
function headersFor(url) {
	const response = responseFixture();
	applyCors({
		url,
		headers: { origin: "https://awtsmoos.com" }
	}, response);
	return response.headers;
}

for (const url of [
	"/apps/code",
	"/apps/code/",
	"/apps/code/index.html",
	"/apps/code/js/node/manager.js?release=1",
	"/api/apk-web/asset/0123456789abcdef0123456789abcdef0123456789abcdef/index.html",
	"/api/apk-web/asset/0123456789abcdef0123456789abcdef0123456789abcdef/modules/main.js?release=1"
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
	"/api/apk-web/publish",
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
	apkAssetsIsolated: true,
	unrelatedRoutesUnchanged: true
}, null, 2));
