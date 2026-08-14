// B"H
const assert = require("assert");
const path = require("path");

const TEST_URL = "http://localhost:8080/games/mitzvahWorld/?path=ladder-1.json";
const ENTRY = "games/mitzvahWorld/index.html";

function requireFromRoot(rel) { return require(path.join(process.cwd(), rel)); }
function config() { return { root: process.cwd(), allowWrite: true, allowSecrets: false, tools: { fsRead: true, fsWrite: true, fsBulk: true, fsList: true } }; }

/** Proves URL-mode preserves public-root module identity and runtime errors. */
async function assertMitzvahWorldUrlRuntime() {
	const { buildRuntimeActions, collectOptions } = requireFromRoot("geelooy/apps/tunnel/agent/tools/fs/actionGroups/runtimeActions.js");
	const payload = { action: "simulateRuntime", runtime: "browser", engine: "merkava", url: TEST_URL, p: ".", maxFiles: 20, timeoutMs: 240000, returnValues: ["window.__AWTSMOOS_LAST_ERROR__"] };
	const options = await collectOptions(payload, config());
	assert.equal(options.virtualEnv.source, "url");
	assert.equal(options.entry, ENTRY);
	assert.equal(options.origin, "http://localhost:8080");
	assert.ok(options.files[ENTRY], "collected public-root entry from URL");
	assert.ok(options.files["games/mitzvahWorld/experiments/Awtsmoos/src/mitzvah-world.compact.js"], "collected public-root compact entry");
	assert.ok(options.files["games/mitzvahWorld/experiments/Awtsmoos/src/launcher/MinimalSharedMeadowPage.js"], "collected public-root launcher");
	assert.ok(!options.files[ENTRY].includes("importmap"), "importmap is not executable JS");

	const result = await buildRuntimeActions({ payload, config: config() }).simulateRuntime();
	assert.equal(result.ok, false, "console errors must fail URL runtime simulation");
	assert.equal(result.score, 40);
	assert.equal(result.engine, "merkava");
	assert.equal(result.virtualEnv.source, "url");
	assert.ok(result.console.logs.some(item => item.level === "error"));
	assert.ok(result.errors.length > 0, "runtime errors are preserved");
	assert.equal(result.domSnapshot.documentElement.tagName, "HTML");
	assert.ok(result.domSnapshot.documentElement.children.length >= 2);
	return { ok: result.ok, score: result.score, source: result.virtualEnv.source, files: result.virtualEnv.files, consoleLogCount: result.console.logs.length, errors: result.errors, domRoot: result.domSnapshot.documentElement.tagName };
}

(async () => {
	const mitzvahWorld = await assertMitzvahWorldUrlRuntime();
	console.log(JSON.stringify({ ok: true, mitzvahWorld }, null, 2));
})().catch(error => { console.error(JSON.stringify({ ok: false, error: error.message, stack: error.stack }, null, 2)); process.exit(1); });
