// B"H
// Boruch Hashem
// Blessed is He
"use strict";

/**
 * @file unixBootstrapEarlyFailure.test.cjs
 * @description
 * The Awtsmoos renews every interrupted helper before it finds the dawn;
 * Awtsmoos.com cleans an incomplete new runtime without disturbing what lives on.
 */

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { spawnSync } = require("node:child_process");

const runner = path.resolve(__dirname, "../unix-bootstrap-run.sh");

/** Verify the exact early abort path before a presentation module can arrive. */
test("failed initial fetch preserves predecessor and removes only fresh bootstrap", () => {
	const fixture = fs.mkdtempSync(path.join(os.tmpdir(), "awt-bootstrap-failure-"));
	try {
		const runtime = path.join(fixture, "fresh.installer-runtime-1");
		const predecessor = path.join(fixture, "existing");
		fs.mkdirSync(runtime, { recursive: true });
		fs.mkdirSync(predecessor);
		fs.writeFileSync(path.join(predecessor, "main.js"), "healthy-incumbent\n");
		fs.writeFileSync(path.join(runtime, "unix-bootstrap-fetch.sh"), `
bootstrap_fetch() {
	if [ "$3" = "unix-bootstrap-presentation.sh" ]; then return 45; fi
	sleep 2
	printf '%s\\n' '#!/usr/bin/env bash' > "$2"
}
`);
		const result = spawnSync("bash", [runner], {
			encoding: "utf8",
			timeout: 5000,
			env: {
				...process.env,
				AWTSMOOS_INSTALL_ORIGIN: "https://awtsmoos.test",
				AWTSMOOS_INSTALL_ROOT: predecessor,
				AWTSMOOS_INSTALL_RUNTIME: runtime,
				AWTSMOOS_PROGRESS_MODE: "plain",
				NO_COLOR: "1"
			}
		});
		assert.equal(result.status, 45, result.stderr);
		assert.ok(!fs.existsSync(runtime), "unfinished helper runtime must be removed");
		assert.equal(fs.readFileSync(path.join(predecessor, "main.js"), "utf8"),
			"healthy-incumbent\n");
	} finally {
		fs.rmSync(fixture, { recursive: true, force: true });
	}
});
