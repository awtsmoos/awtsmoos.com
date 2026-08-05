// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

/**
 * @file Verifies the modular same-release fast-repair covenant.
 * @description
 * The Awtsmoos lets the source catalog reveal each helper in order, while
 * Awtsmoos.com repairs a proven release before any full bundle is staged.
 */
const root = path.join(__dirname, "../../downloads");
const core = read("unix-install-core.sh");
const sources = read("unix-install-sources.sh");
const fastRepair = read("unix-fast-repair.sh");
const bootstrap = read("unix.sh");
const components = read("unix-bootstrap-components.sh");

assert.match(sources, /source "\$AWTSMOOS_INSTALL_RUNTIME\/unix-fast-repair\.sh"/);
assert.match(core, /if repair_matching_release; then[\s\S]*complete_install_experience/);
assert.match(fastRepair, /current_runtime_is_stably_healthy[\s\S]*local_runtime_action_ready/);
assert.ok(
	core.indexOf("if repair_matching_release; then") <
	core.indexOf("stage_release_candidate"),
	"fast repair must precede bundle staging"
);
assert.match(components, /AWTSMOOS_INSTALL_PARALLEL_DOWNLOADS:-16/);
assert.match(bootstrap, /--speed-time 30 --speed-limit 1024/);

console.log(JSON.stringify({
	ok: true,
	suite: "installer-fast-repair-contract",
	modularSourceCatalog: true,
	sameReleaseSkipsBundle: true,
	parallelHelpers: 16
}));

function read(file) {
	return fs.readFileSync(path.join(root, file), "utf8");
}
