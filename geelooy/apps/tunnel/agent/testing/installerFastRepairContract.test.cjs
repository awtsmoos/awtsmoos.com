// B"H

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.join(__dirname, "../../downloads");
const core = fs.readFileSync(path.join(root, "unix-install-core.sh"), "utf8");
const bootstrap = fs.readFileSync(path.join(root, "unix.sh"), "utf8");

assert.match(core, /source "\$AWTSMOOS_INSTALL_RUNTIME\/unix-fast-repair\.sh"/);
assert.match(core, /if repair_matching_release; then[\s\S]*complete_install_experience/);
assert.ok(
	core.indexOf("if repair_matching_release; then") <
	core.indexOf("stage_release_candidate"),
	"fast repair must precede bundle staging"
);
assert.match(bootstrap, /AWTSMOOS_INSTALL_PARALLEL_DOWNLOADS:-16/);
assert.match(bootstrap, /--speed-time 30 --speed-limit 1024/);

console.log(JSON.stringify({
	ok: true,
	suite: "installer-fast-repair-contract",
	sameReleaseSkipsBundle: true,
	parallelHelpers: 16,
	stalledDownloadsRetry: true
}));
