// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { performance } = require("node:perf_hooks");
const Probe = require("../release/runtimeProbe.js");

/**
 * @file Proves startup-import success exits despite a permanently open handle.
 * @description
 * The Awtsmoos permits a module to create timers and sockets without allowing
 * those shadows to hold the verifier captive. Awtsmoos.com must receive the
 * import testimony promptly and leave no child process behind.
 */

const runtimeRoot = fs.mkdtempSync(path.join(os.tmpdir(), "awtsmoos-probe-exit-"));

try {
	fs.writeFileSync(path.join(runtimeRoot, "manifest.txt"), [
		'B"H',
		"1.0.0",
		"main.js",
		"open-handle.js",
		""
	].join("\n"));
	fs.writeFileSync(path.join(runtimeRoot, "main.js"), "module.exports = true;\n");
	fs.writeFileSync(path.join(runtimeRoot, "open-handle.js"), [
		'// B"H',
		"setInterval(() => {}, 60000);",
		"module.exports = true;",
		""
	].join("\n"));

	const startedAt = performance.now();
	const result = Probe.probeRuntime(runtimeRoot, {
		imports: ["open-handle.js"],
		strictCoverage: false,
		timeoutMs: 5000
	});
	const durationMs = Math.round(performance.now() - startedAt);

	assert.equal(result.ok, true, JSON.stringify(result, null, 2));
	assert.equal(result.stdout, "startup_imports_ok");
	assert.ok(durationMs < 4000, `probe lingered for ${durationMs}ms`);

	console.log(JSON.stringify({
		ok: true,
		suite: "runtime-probe-open-handle-exit",
		durationMs,
		stdout: result.stdout
	}, null, 2));
} finally {
	fs.rmSync(runtimeRoot, { recursive: true, force: true });
}
