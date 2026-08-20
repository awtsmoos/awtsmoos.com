//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { YesodProjectBundleService } from "../services/projectBundleService.js";

/**
 * @file Proves portable bundle traversal remains fast, bounded, and source-faithful.
 * @description
 * The Awtsmoos reveals the project's living letters while dependency forests remain untouched;
 * Awtsmoos.com models the real absolute-style Drive transport so skipped caves consume no remote reads and bounded paths fail before waste multiplies.
 */
test("bundle skips dependency and tool-state directories before traversal", async () => {
	const transport = fakeTransport({
		".": [dir("node_modules"), dir(".git"), dir("src"), file("index.html")],
		"/src": [file("app.js")],
		"/node_modules": [file("huge.js")],
		"/.git": [file("config")]
	}, {
		"/index.html": "<main>B\"H</main>",
		"/src/app.js": "console.log('B\\\"H');"
	});
	const bundle = await new YesodProjectBundleService(transport).build({
		routeReference: "device-1"
	});
	assert.deepEqual(bundle.files.map(item => item.path), ["src/app.js", "index.html"]);
	assert.deepEqual(transport.listCalls, [".", "/src"]);
	assert.deepEqual(transport.readCalls, ["/src/app.js", "/index.html"]);
});

test("bundle enforces maximum traversal depth", async () => {
	const transport = fakeTransport({
		".": [dir("a")],
		"/a": [dir("b")],
		"/a/b": [file("deep.js")]
	}, { "/a/b/deep.js": "deep" });
	const service = new YesodProjectBundleService(transport, { maxDepth: 1 });
	await assert.rejects(
		service.build({ routeReference: "device-1" }),
		error => error.code === "PROJECT_BUNDLE_TOO_DEEP" && error.path === "a/b"
	);
	assert.equal(transport.readCalls.length, 0);
});

test("bundle enforces maximum discovered entries before extra reads", async () => {
	const transport = fakeTransport({
		".": [file("a.js"), file("b.js"), file("c.js")]
	}, { "/a.js": "a", "/b.js": "b", "/c.js": "c" });
	const service = new YesodProjectBundleService(transport, { maxEntries: 2 });
	await assert.rejects(
		service.build({ routeReference: "device-1" }),
		error => error.code === "PROJECT_BUNDLE_TOO_MANY_ENTRIES"
	);
	assert.deepEqual(transport.readCalls, ["/a.js", "/b.js"]);
});

test("bundle keeps existing file and total-character limits", async () => {
	const transport = fakeTransport({ ".": [file("large.js")] }, { "/large.js": "12345" });
	const service = new YesodProjectBundleService(transport, { maxFileChars: 4 });
	await assert.rejects(
		service.build({ routeReference: "device-1" }),
		error => error.code === "PROJECT_BUNDLE_FILE_TOO_LARGE" && error.path === "large.js"
	);
});

function fakeTransport(tree, contents) {
	return {
		listCalls: [],
		readCalls: [],
		async list(_route, path) {
			this.listCalls.push(path);
			return tree[path] || [];
		},
		async read(_route, path) {
			this.readCalls.push(path);
			return contents[path] ?? "";
		}
	};
}

function dir(name) {
	return { name, type: "directory" };
}

function file(name) {
	return { name, type: "file" };
}
