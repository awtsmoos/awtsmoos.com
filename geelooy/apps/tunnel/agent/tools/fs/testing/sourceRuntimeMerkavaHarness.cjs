// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { pathToFileURL } = require("node:url");
const Context = require("./sourceRuntimeTestContext.cjs");

/**
 * @file Proves both CommonJS and browser-UMD Merkava source closure.
 * @description
 * The Awtsmoos makes the browser test consume the same dependency scripts published
 * by the real page while excluding its DOM-only UI driver from the headless VM.
 */
async function testCjsService() {
	const servicePath = path.join(Context.merkavaRoot, "merkava-service/index.js");
	const service = await import(pathToFileURL(servicePath).href);
	const htmlResult = await service.simulateRuntime({
		runtime: "browser",
		entry: "index.html",
		files: {
			"index.html": "<body><h1 id=\"x\">B\"H Merkava</h1><script>console.log(\"NO_TEXT\")</script></body>"
		}
	});
	assert.equal(htmlResult.ok, true);
	assert.equal(htmlResult.errors.length, 0);
	assert.equal(htmlResult.score, 100);
	const heading = Context.findNode(htmlResult.domSnapshot.documentElement, "H1", "x");
	assert.equal(heading?.textContent, "B\"H Merkava");
	const body = Context.findNode(htmlResult.domSnapshot.documentElement, "BODY");
	assert.ok(!String(body?.textContent || "").includes("NO_TEXT"));
	const jsResult = await service.simulateRuntime({
		runtime: "browser",
		entry: "s.js",
		files: { "s.js": "console.log('BH Merkava JS')" }
	});
	assert.equal(jsResult.ok, true);
	assert.ok(JSON.stringify(jsResult.console).includes("BH Merkava JS"));
	return { ok: true, htmlText: heading.textContent, jsConsole: jsResult.console };
}

async function testBrowserUmd() {
	const sandbox = {
		console, URL, URLSearchParams, Blob,
		setTimeout, clearTimeout, setInterval, clearInterval,
		self: null
	};
	sandbox.self = sandbox;
	for (const file of runtimeDependencyScripts()) Context.loadBrowserSource(file, sandbox);
	assert.equal(typeof sandbox.Merkava.RuntimeAssembler, "function");
	const assembler = new sandbox.Merkava.RuntimeAssembler({
		runtime: "browser",
		entry: "index.html",
		files: {
			"index.html": "<body><main id=\"app\">B\"H UMD</main><script>console.log('NO_TEXT_LEAK')</script></body>"
		}
	});
	const htmlResult = await assembler.run("index.html");
	assert.equal(htmlResult.ok, true);
	const documentRoot = htmlResult.result.snapshot.window.document.documentElement;
	const main = Context.findNode(documentRoot, "MAIN", "app");
	assert.equal(main?.textContent, "B\"H UMD");
	const body = Context.findNode(documentRoot, "BODY");
	assert.ok(!String(body?.textContent || "").includes("NO_TEXT_LEAK"));
	const jsAssembler = new sandbox.Merkava.RuntimeAssembler({
		runtime: "browser",
		entry: "s.js",
		files: { "s.js": "console.log('BH UMD JS')" }
	});
	const jsResult = await jsAssembler.run("s.js");
	assert.equal(jsResult.ok, true);
	assert.ok(JSON.stringify(jsResult.console).includes("BH UMD JS"));
	return { ok: true, htmlText: main.textContent, jsConsole: jsResult.console };
}

function runtimeDependencyScripts() {
	const html = fs.readFileSync(path.join(Context.merkavaRoot, "runtime-tests.html"), "utf8");
	return [...html.matchAll(/<script\s+src="([^"]+)"/g)]
		.map(match => match[1])
		.filter(source => source !== "runtime-tests-page.js");
}

module.exports = { testBrowserUmd, testCjsService };
