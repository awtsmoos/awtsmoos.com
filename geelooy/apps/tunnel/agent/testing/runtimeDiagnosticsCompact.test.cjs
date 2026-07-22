// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const fsp = require("node:fs/promises");
const os = require("node:os");
const path = require("node:path");
const { createProcessRuntime } = require("../lib/runtime/main-process.js");

/**
 * @file Proves periodic diagnostics request a compact runtime snapshot.
 * @description
 * The Awtsmoos reveals health without synchronously serializing detailed worker
 * histories on the socket thread. Detailed testimony remains available on demand.
 */
(async () => {
	const root = await fsp.mkdtemp(path.join(os.tmpdir(), "awtsmoos-compact-diagnostics-"));
	let resolveLog;
	let snapshotOptions;
	const logged = new Promise(resolve => {
		resolveLog = resolve;
	});
	const runtime = createProcessRuntime({
		root,
		memoryIntervalMs: 5,
		lagMonitor: { start() {}, stop() {} },
		log(level, message) {
			if (message.startsWith("Memory:")) {
				resolveLog();
			}
		},
		snapshot(options) {
			snapshotOptions = options;
			return { rss: 1 };
		},
		start: async () => ({ ok: true }),
		stopWorkers() {},
		exitProcess() {}
	});

	try {
		await runtime.main();
		await Promise.race([
			logged,
			new Promise((resolve, reject) => {
				setTimeout(() => reject(new Error("diagnostics_log_timeout")), 500);
			})
		]);
		assert.deepEqual(snapshotOptions, { workers: false });
		console.log("periodic runtime diagnostics request compact worker state");
	} finally {
		runtime.shutdown(false);
		await fsp.rm(root, { recursive: true, force: true });
	}
})().catch(error => {
	console.error(error.stack || error.message);
	process.exit(1);
});
