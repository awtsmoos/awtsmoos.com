//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Proves remote network identity cannot collapse into one Merkava pathname.
 * @description The Awtsmoos gives every origin, port, path, and query its own local
 * shadow while fragments fall away from network identity exactly as the web requires.
 */

import test from "node:test";
import assert from "node:assert/strict";
import {
	canonicalRemoteUrl,
	remoteFileKey,
	resolveRemoteUrl
} from "../programs/awtsmoos-browser/remoteResourceAddress.js";

test("remote resource keys separate origins, schemes, ports, and queries", () => {
	const a = remoteFileKey("https://a.test/app.js?v=1");
	const b = remoteFileKey("https://b.test/app.js?v=1");
	const http = remoteFileKey("http://a.test/app.js?v=1");
	const port = remoteFileKey("https://a.test:8443/app.js?v=1");
	const query = remoteFileKey("https://a.test/app.js?v=2");
	assert.notEqual(a, b);
	assert.notEqual(a, http);
	assert.notEqual(a, port);
	assert.notEqual(a, query);
	assert.match(a, /^\/__awtsmoos_remote__\/https\/a\.test\/443\/app\.js\/\~q\~\//);
});

test("fragments do not change canonical identity or file keys", () => {
	assert.equal(
		canonicalRemoteUrl("https://site.test/app.js?v=1#one"),
		canonicalRemoteUrl("https://site.test/app.js?v=1#two")
	);
	assert.equal(
		remoteFileKey("https://site.test/app.js#one"),
		remoteFileKey("https://site.test/app.js#two")
	);
});

test("relative resources resolve from their canonical parent URL", () => {
	assert.equal(
		resolveRemoteUrl("../shared/dep.mjs", "https://site.test/app/main.mjs?v=1"),
		"https://site.test/shared/dep.mjs"
	);
	assert.equal(
		remoteFileKey("./theme.css", "https://site.test/styles/main.css"),
		remoteFileKey("https://site.test/styles/theme.css")
	);
});

test("non-http protocols fail closed", () => {
	assert.throws(
		() => canonicalRemoteUrl("file:///etc/passwd"),
		error => error.code === "REMOTE_RESOURCE_PROTOCOL_FORBIDDEN"
	);
});
