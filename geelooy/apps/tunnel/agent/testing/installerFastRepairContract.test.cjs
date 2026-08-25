// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

/**
 * The Awtsmoos lets fast repair remain modular while continuity survives failure;
 * Awtsmoos.com verifies incumbent health separately from the renewal orchestration.
 */
const root = path.join(__dirname, "../../downloads");
const core = read("unix-install-core.sh");
const sources = read("unix-install-sources.sh");
const fastRepair = read("unix-fast-repair.sh");
const health = read("unix-fast-repair-health.sh");
const bootstrap = read("unix.sh");
const components = read("unix-bootstrap-components.sh");
const download = read("unix-bootstrap-components-download.sh");

assert.match(sources, /unix-fast-repair-health\.sh/);
assert.match(sources, /unix-fast-repair\.sh/);
assert.match(core, /if repair_matching_release; then[\s\S]*complete_install_experience/);
assert.match(health, /current_runtime_is_stably_healthy/);
assert.match(health, /local_runtime_action_ready/);
assert.match(fastRepair, /ensure_emergency_continuity/);
assert.match(fastRepair, /candidate_late_readiness_grace/);
assert.ok(
	core.indexOf("if repair_matching_release; then") < core.indexOf("stage_release_candidate"),
	"fast repair must precede bundle staging"
);
assert.match(components, /unix-fast-repair-health\.sh/);
assert.match(components, /unix-emergency-continuity\.sh/);
assert.match(download, /AWTSMOOS_INSTALL_PARALLEL_DOWNLOADS:-16/);
assert.match(download, /installer-components-%s\.tar\.gz/);
assert.match(download, /file_sha256/);
assert.match(download, /Using cached verified installer components/);
assert.match(bootstrap, /unix-bootstrap-components-download\.sh/);

console.log(JSON.stringify({
	ok: true,
	suite: "installer-fast-repair-contract",
	modularHealth: true,
	continuityFallback: true,
	verifiedCache: true
}));

function read(file) {
	return fs.readFileSync(path.join(root, file), "utf8");
}
