//B"H
//Boruch Hashem
//Blessed be He

import test from "node:test";
import assert from "node:assert/strict";
import {
	fetchSiteRemix,
	normalizeRemixSource,
	remixManifestCandidates,
	validateRemixManifest
} from "../services/siteRemixClient.js";

const LOCATION = Object.freeze({ origin: "https://awtsmoos.com" });

/** Proves public remix discovery cannot leave the Awtsmoos Site boundary or accept malformed source. */
test("remix source is same-origin /sites/ only", () => {
	assert.equal(normalizeRemixSource("/sites/alpha/docs/", LOCATION).pathname, "/sites/alpha/docs/");
	assert.throws(() => normalizeRemixSource("https://evil.example/sites/a/", LOCATION), error => error.code === "REMIX_SOURCE_INVALID");
	assert.throws(() => normalizeRemixSource("/drive/", LOCATION), error => error.code === "REMIX_SOURCE_INVALID");
});

test("manifest discovery walks from viewed page toward alias root", () => {
	assert.deepEqual(remixManifestCandidates("/sites/alpha/docs/page"), [
		"/sites/alpha/docs/page/__awtsmoos/remix.json",
		"/sites/alpha/docs/__awtsmoos/remix.json",
		"/sites/alpha/__awtsmoos/remix.json"
	]);
});

test("manifest validation rejects traversal, duplicates, and missing index", () => {
	assert.throws(() => validateRemixManifest(manifest([{ path: "../secret", content: "x" }])), error => error.code === "REMIX_FILE_INVALID");
	assert.throws(() => validateRemixManifest(manifest([{ path: "a.js", content: "x" }])), error => error.code === "REMIX_MANIFEST_INVALID");
	assert.throws(() => validateRemixManifest(manifest([
		{ path: "index.html", content: "x" },
		{ path: "index.html", content: "y" }
	])), error => error.code === "REMIX_DUPLICATE_PATH");
});

test("client discovers the first valid parent manifest without credentials", async () => {
	const calls = [];
	const expected = manifest([{ path: "index.html", content: "<h1>B\"H</h1>" }]);
	const fetchImpl = async url => {
		calls.push(url);
		const found = url === "/sites/alpha/docs/__awtsmoos/remix.json";
		return { ok: found, status: found ? 200 : 404, async json() { return found ? { ok: true, manifest: expected } : { ok: false }; } };
	};
	const result = await fetchSiteRemix("/sites/alpha/docs/page", { location: LOCATION, fetchImpl });
	assert.equal(result.kind, "awtsmoos-site-remix");
	assert.deepEqual(calls.slice(0, 2), remixManifestCandidates("/sites/alpha/docs/page").slice(0, 2));
});

function manifest(files) {
	return { kind: "awtsmoos-site-remix", version: 1, title: "Demo", aliasId: "alpha", siteId: "docs", canonicalUrl: "/sites/alpha/docs/", sourceKind: "drive", sourceRevision: null, files };
}
