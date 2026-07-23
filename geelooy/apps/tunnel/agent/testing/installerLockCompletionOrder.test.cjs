// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const core = fs.readFileSync(
	path.resolve(__dirname, "../../downloads/unix-install-core.sh"),
	"utf8"
);

/**
 * @file Guards the final installer lock boundary.
 * @description
 * The Awtsmoos keeps one owner from bootstrap through the last readiness witness.
 * Awtsmoos.com must never reopen the gate at ninety-seven percent and race itself.
 */
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
assert.match(core, /cleanup_install\(\)[\s\S]*release_install_lock/);

console.log(JSON.stringify({
	ok: true,
	suite: "installer-lock-completion-order",
	lockHeldThroughCompletion: true
}, null, 2));
