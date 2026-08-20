//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Proves Street 2 collects a bounded remote text graph without executing it.
 * @description The Awtsmoos gathers scripts, modules, and styles through one fake
 * guarded road; Awtsmoos.com resolves cycles and redirects while dynamic and binary
 * journeys remain untouched testimony for later streets.
 */

import test from "node:test";
import assert from "node:assert/strict";
import {
	collectRemoteResourceGraph
} from "../programs/awtsmoos-browser/remoteResourceGraph.js";
import {
	remoteFileKey
} from "../programs/awtsmoos-browser/remoteResourceAddress.js";
import {
	HTML,
	PAGE_URL,
	createFixtureTransport
} from "./fixtures/awtsmoosBrowserRemoteGraphFixture.mjs";

test("remote graph collects and rewrites only bounded static textual resources", async () => {
	delete globalThis.__REMOTE_GRAPH_EXECUTED__;
	const calls = [];
	const graph = await collectRemoteResourceGraph({
		html: HTML,
		pageUrl: PAGE_URL,
		transport: createFixtureTransport(calls)
	});
	const entry = remoteFileKey(PAGE_URL);
	const classic = remoteFileKey("https://static.site.test/classic-v2.js");
	const mainCss = remoteFileKey("https://site.test/styles/main.css");
	const themeCss = remoteFileKey("https://site.test/styles/theme.css");
	const app = remoteFileKey("https://cdn.test/app.mjs");
	const dep = remoteFileKey("https://cdn.test/dep.mjs");
	const lib = remoteFileKey("https://cdn.test/lib/index.mjs");
	assert.equal(graph.entry, entry);
	assert.equal(globalThis.__REMOTE_GRAPH_EXECUTED__, undefined);
	assert.ok(graph.files[entry].includes(classic));
	assert.ok(graph.files[entry].includes(mainCss));
	assert.ok(graph.files[entry].includes(app));
	assert.ok(graph.files[app].includes(dep));
	assert.ok(graph.files[app].includes(lib));
	assert.ok(graph.files[app].includes(remoteFileKey("https://site.test/shared.mjs")));
	assert.ok(graph.files[app].includes(remoteFileKey("https://cdn.test/shared.mjs")));
	assert.match(graph.files[app], /import\("\.\/later\.mjs"\)/);
	assert.match(graph.files[app], /import "missing"/);
	assert.ok(graph.files[mainCss].includes(themeCss));
	assert.ok(graph.files[themeCss].includes(mainCss));
	assert.match(graph.files[mainCss], /url\("\.\/bg\.png"\)/);
	assert.deepEqual(graph.deferredAssets, [{
		from: "https://site.test/styles/main.css",
		specifier: "./bg.png",
		url: "https://site.test/styles/bg.png"
	}]);
	assert.ok(graph.warnings.some(item => {
		return item.code === "REMOTE_MODULE_SPECIFIER_UNRESOLVED"
			&& item.specifier === "missing";
	}));
	assert.equal(graph.manifest.length, 9);
	assert.equal(graph.usage.files, 10);
	assert.ok(graph.manifest.every(row => !("text" in row)));
	assert.equal(calls.length, 9);
	assert.equal(new Set(calls.map(call => call.url)).size, calls.length);
	assert.ok(!calls.some(call => /later\.mjs|bg\.png/.test(call.url)));
	assert.ok(!calls.some(call => call.url.endsWith("/missing")));
});

test("remote graph rejects file-count and byte budget overflow", async () => {
	const html = `<script src="/big.js"></script>`;
	const makeTransport = text => async request => ({
		headers: { "content-type": "text/javascript" },
		status: 200,
		text,
		url: request.url
	});
	await assert.rejects(
		collectRemoteResourceGraph({
			html,
			limits: { maxFileBytes: 100, maxFiles: 64, maxTotalBytes: 10000 },
			pageUrl: PAGE_URL,
			transport: makeTransport("x".repeat(200))
		}),
		error => error.code === "REMOTE_RESOURCE_FILE_BYTES_EXCEEDED"
	);
	await assert.rejects(
		collectRemoteResourceGraph({
			html,
			limits: { maxFileBytes: 1000, maxFiles: 1, maxTotalBytes: 10000 },
			pageUrl: PAGE_URL,
			transport: makeTransport("small")
		}),
		error => error.code === "REMOTE_RESOURCE_FILE_COUNT_EXCEEDED"
	);
	const entryBytes = new TextEncoder().encode(html).byteLength;
	await assert.rejects(
		collectRemoteResourceGraph({
			html,
			limits: { maxFileBytes: 1000, maxFiles: 64, maxTotalBytes: entryBytes + 5 },
			pageUrl: PAGE_URL,
			transport: makeTransport("ten-bytes!")
		}),
		error => error.code === "REMOTE_RESOURCE_TOTAL_BYTES_EXCEEDED"
	);
});
