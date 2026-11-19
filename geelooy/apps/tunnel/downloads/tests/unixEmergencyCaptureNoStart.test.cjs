// B"H
// Boruch Hashem
// Blessed is He
"use strict";

/**
 * @file unixEmergencyCaptureNoStart.test.cjs
 * @description
 * The Awtsmoos holds an unstarted agent safely in a prepared shell;
 * Awtsmoos.com preserves rescue commands and tells the operator well.
 */

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { spawnSync } = require("node:child_process");

const downloads = path.resolve(__dirname, "..");
const source = path.join(downloads, "unix-emergency-capture.sh");
const commands = ["auto", "sealed", "supervisor", "known-good", "diagnose", "repair"];

/** Exercise recovery status with a physically isolated project and recovery root. */
function checkScenario(skipStart, includeController = false) {
	const fixture = fs.mkdtempSync(path.join(os.tmpdir(), "awt-no-start-capture-"));
	try {
		const script = `
set -eu
ROOT="$1/active"
RECOVERY_ROOT="$1/recovery"
AWTSMOOS_INSTALL_RUNTIME="$2"
AWTSMOOS_SKIP_START="$4"
mkdir -p "$ROOT" "$RECOVERY_ROOT"
if [ "$5" = yes ]; then
	mkdir -p "$ROOT/scripts"
	printf '%s\\n' 'fixture controller' > "$ROOT/scripts/emergency-control.cjs"
fi
install_event() { printf '%s:%s:%s\\n' "$1" "$2" "$3" >> "$RECOVERY_ROOT/events"; }
source "$3"
refresh_emergency_runtime
`;
		const result = spawnSync("bash", ["-c", script, "--", fixture,
			downloads, source, skipStart, includeController ? "yes" : "no"], {
			encoding: "utf8", timeout: 5000
		});
		const events = fs.existsSync(path.join(fixture, "recovery/events"))
			? fs.readFileSync(path.join(fixture, "recovery/events"), "utf8") : "";
		const preserved = commands.every(name => fs.existsSync(path.join(fixture,
			"recovery/bin", `awtsmoos-emergency-${name}`)));
		return { ...result, events, preserved,
			activated: fs.existsSync(path.join(fixture, "active/main.js")) };
	} finally {
		fs.rmSync(fixture, { recursive: true, force: true });
	}
}

test("stopped full install saves all rescue commands and defers capture", () => {
	for (const truthy of ["1", "true"]) {
		const result = checkScenario(truthy);
		assert.equal(result.status, 0, result.stderr);
		assert.equal(result.preserved, true);
		assert.equal(result.activated, false);
		assert.match(result.events, /emergency-commands:passed/);
		assert.match(result.events, /emergency-runtime:skipped:Verified runtime is prepared/);
		assert.doesNotMatch(result.events, /lacks the emergency capture controller/);
	}
});

test("normal active install still reports a genuinely missing controller", () => {
	const result = checkScenario("");
	assert.equal(result.status, 0, result.stderr);
	assert.equal(result.preserved, true);
	assert.match(result.events, /emergency-runtime:warning:Verified runtime lacks/);
});

test("stopped install never invokes even a present controller", () => {
	const result = checkScenario("1", true);
	assert.equal(result.status, 0, result.stderr);
	assert.equal(result.preserved, true);
	assert.match(result.events, /emergency-runtime:skipped/);
	assert.doesNotMatch(result.events, /emergency-runtime:warning/);
});
