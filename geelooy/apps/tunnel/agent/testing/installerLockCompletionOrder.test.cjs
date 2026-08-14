// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

/**
 * @file Guards the modular installer lock boundary through final readiness.
 * @description
 * The Awtsmoos keeps one owner from bootstrap through the last witness, and
 * Awtsmoos.com releases that owner only from the sourced lifecycle cleanup.
 */
const downloads = path.resolve(__dirname, "../../downloads");
const core = read("unix-install-core.sh");
const sources = read("unix-install-sources.sh");
const lifecycle = read("unix-install-lifecycle.sh");
const mainStart = core.indexOf("trap cleanup_install EXIT");
const main = core.slice(mainStart);
const completion = main.indexOf("complete_install_experience");

assert.notEqual(mainStart, -1, "installer EXIT trap is missing");
assert.notEqual(completion, -1, "completion experience is missing");
assert.equal(
	main.slice(0, completion).includes("release_install_lock"),
	false,
	"installer lock was released before completion"
);
assert.equal(
	main.slice(0, completion).includes("trap - EXIT"),
	false,
	"installer cleanup trap was removed before completion"
);
assert.match(sources, /source "\$AWTSMOOS_INSTALL_RUNTIME\/unix-install-lifecycle\.sh"/);
assert.match(lifecycle, /cleanup_install\(\)[\s\S]*release_install_lock/);

console.log(JSON.stringify({
	ok: true,
	suite: "installer-lock-completion-order",
	modularLifecycle: true,
	lockHeldThroughCompletion: true
}, null, 2));

function read(file) {
	return fs.readFileSync(path.join(downloads, file), "utf8");
}
