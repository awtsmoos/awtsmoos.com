// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const Roots = require("../tools/fs/commandJob/stateRoots.js");

const base = fs.mkdtempSync(
	path.join(os.tmpdir(), "awtsmoos-state-roots-")
);
const current = path.join(base, "current");
const older = path.join(base, "older");

fs.mkdirSync(current, {
	recursive: true
});
fs.mkdirSync(older, {
	recursive: true
});

const discovery = Roots.discover(
	{
		deviceStateRoot: current
	},
	{
		stateBase: base,
		maxRoots: 8
	}
);

assert.equal(discovery.current, current);
assert.equal(discovery.roots[0].path, current);
assert.equal(discovery.roots[0].current, true);
assert.equal(discovery.totalRoots, 2);
assert.equal(discovery.truncated, false);

const rooted = Roots.configForRoot(
	{
		deviceStateRoot: current
	},
	older
);

assert.equal(rooted.commandStateRoot, older);

console.log(JSON.stringify({
	ok: true,
	suite: "state-roots-compatibility",
	roots: discovery.totalRoots
}, null, 2));
