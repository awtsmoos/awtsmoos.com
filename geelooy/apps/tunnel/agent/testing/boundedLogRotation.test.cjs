// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const Log = require("../lib/log.js");

const root = fs.mkdtempSync(
	path.join(os.tmpdir(), "awtsmoos-log-")
);
const logPath = path.join(root, "logs.txt");

fs.writeFileSync(
	logPath,
	"x".repeat(Log.MAX_LOG_BYTES + 1)
);

const logger = Log.makeLogger(root);

logger("info", "bounded-probe");

assert.equal(
	fs.existsSync(`${logPath}.previous`),
	true
);
assert.match(
	fs.readFileSync(logPath, "utf8"),
	/bounded-probe/
);

console.log(JSON.stringify({
	ok: true,
	suite: "bounded-log-rotation",
	maxBytes: Log.MAX_LOG_BYTES
}, null, 2));
