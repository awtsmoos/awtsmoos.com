// B"H
/**
 * @file runtime-actions-real.test.cjs
 * @description Exercise the requested Merkava engine directly instead of
 * assuming automatic runtime selection must choose the same engine.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const fsp = require("node:fs/promises");
const path = require("node:path");

/** Resolve the public geelooy folder containing the native tunnel agent. */
function findPublicRoot(start) {
	let directory = start;
	while (directory && directory !== path.dirname(directory)) {
		if (fs.existsSync(path.join(directory, "apps/tunnel/agent/main.js"))) {
			return directory;
		}
		directory = path.dirname(directory);
	}
	throw new Error("Could not locate geelooy public root from " + start);
}

const publicRoot = findPublicRoot(__dirname);
const repositoryRoot = path.dirname(publicRoot);
const fixtureRoot = path.join(__dirname, ".tmp-runtime-actions-real");

/** Load the real action registry and keep fixture permissions explicit. */
const { buildRuntimeActions } = require(path.join(
	publicRoot,
	"apps/tunnel/agent/tools/fs/actionGroups/runtimeActions.js"
));

function config(root = repositoryRoot) {
	return {
		root,
		allowWrite: true,
		allowSecrets: false,
		tools: { fsRead: true, fsWrite: true, fsBulk: true, fsList: true }
	};
}

/** Establish small local files for the actual path runtime test. */
async function resetFixture() {
	await fsp.rm(fixtureRoot, { recursive: true, force: true });
	await fsp.mkdir(fixtureRoot, { recursive: true });
	await fsp.writeFile(
		path.join(fixtureRoot, "index.html"),
		'<body><main id="app">B"H path runtime</main><script src="./app.js"></script></body>',
		"utf8"
	);
	await fsp.writeFile(
		path.join(fixtureRoot, "app.js"),
		'console.log("BH path runtime JS")',
		"utf8"
	);
}

async function assertInlineSimulateRuntimeAction() {
	const payload = {
		action: "simulateRuntime",
		engine: "merkava",
		runtime: "browser",
		entry: "index.html",
		html: '<body><h1 id="x">B"H action runtime</h1><script>console.log("BH inline runtime JS")</script></body>'
	};
	const result = await buildRuntimeActions({ payload, config: config() }).simulateRuntime();
	assert.equal(result.ok, true);
	assert.equal(result.engine, "merkava");
	assert.equal(result.errors.length, 0);
	assert.equal(result.score, 100);
	assert.equal(result.virtualEnv.source, "inline");
	assert.ok(JSON.stringify(result.console).includes("BH inline runtime JS"));
}

async function assertPathSimulateRuntimeAction() {
	const payload = {
		action: "simulateRuntime",
		engine: "merkava",
		runtime: "browser",
		entry: "index.html"
	};
	const result = await buildRuntimeActions({ payload, config: config(fixtureRoot) }).simulateRuntime();
	assert.equal(result.ok, true);
	assert.equal(result.engine, "merkava");
	assert.equal(result.score, 100);
	assert.equal(result.virtualEnv.source, "path");
	assert.equal(result.virtualEnv.entry, "index.html");
	assert.ok(result.virtualEnv.files["app.js"].includes("BH path runtime JS"));
}

async function assertPreflightCatchesBadRuntimeScript() {
	const payload = {
		action: "simulateRuntime",
		engine: "merkava",
		runtime: "browser",
		entry: "bad.html",
		html: "<body><script>function () {</script></body>"
	};
	const result = await buildRuntimeActions({ payload, config: config() }).simulateRuntime();
	assert.equal(result.ok, false);
	assert.equal(result.error, "runtime_preflight_failed");
	assert.ok(result.diagnostics.some(entry => entry.kind === "syntax"));
}

async function assertRuntimeWorkflowActionExistsAndRuns() {
	const payload = {
		action: "runtimeWorkflow",
		engine: "merkava",
		runtime: "browser",
		entry: "index.html",
		html: '<body><p id="y">B"H workflow runtime</p></body>'
	};
	const actions = buildRuntimeActions({ payload, config: config() });
	for (const name of ["runtimeWorkflow", "merkavaWorkflowRun", "aiWorkflowRun", "testRuntimeOnce"]) {
		assert.equal(typeof actions[name], "function");
	}
	const result = await actions.testRuntimeOnce();
	assert.equal(result.ok, true);
	assert.equal(result.engine, "merkava");
	assert.equal(result.score, 100);
}

(async () => {
	await resetFixture();
	await assertInlineSimulateRuntimeAction();
	await assertPathSimulateRuntimeAction();
	await assertPreflightCatchesBadRuntimeScript();
	await assertRuntimeWorkflowActionExistsAndRuns();
	console.log(JSON.stringify({ ok: true, runtimeActionTests: 4, engine: "merkava" }));
})().catch(error => {
	console.error(JSON.stringify({ ok: false, error: error.message, stack: error.stack }));
	process.exitCode = 1;
});
