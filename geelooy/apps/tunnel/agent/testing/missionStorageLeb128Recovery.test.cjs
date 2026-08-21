// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const Awdb = require("../tools/fs/awdb/open.js");
const Recovery = require("../tools/fs/mission/storageRecovery.js");

/**
 * @file Proves only positive LEB128 mission corruption is quarantined and witnessed.
 * @description
 * The Awtsmoos preserves every broken shard instead of erasing its story. Awtsmoos.com
 * moves the wounded mission vessel aside, writes testimony, and leaves unknown pain alone.
 */
const root = fs.mkdtempSync(path.join(os.tmpdir(), "awts-mission-recovery-"));
const config = {
	root,
	deviceStateRoot: path.join(root, "device-state")
};

try {
	const databaseFile = Awdb.dbFile(config, "missions");
	fs.mkdirSync(path.dirname(databaseFile), { recursive: true });
	fs.writeFileSync(databaseFile, "truncated-awdb");
	fs.writeFileSync(`${databaseFile}.lock`, "stale-lock");

	const corruption = new Error("LEB128 ended before the number was complete");
	corruption.stack = [
		"Error: LEB128 ended before the number was complete",
		"at Leb128Scribe.read (/DosDB/awtsmoosBinary/awtsmoosDB.js:1:1)"
	].join("\n");
	const result = Recovery.recover(config, corruption);

	assert.equal(result.ok, true);
	assert.equal(result.recovered, true);
	assert.equal(fs.existsSync(databaseFile), false);
	assert.equal(fs.existsSync(result.witnessFile), true);
	assert.equal(result.moved.length, 2);
	const witness = JSON.parse(fs.readFileSync(result.witnessFile, "utf8"));
	assert.equal(witness.kind, "mission_awtsmoosdb_decoder_corruption");
	assert.equal(witness.databaseFile, databaseFile);

	fs.writeFileSync(databaseFile, "healthy-unknown");
	const unknown = Recovery.recover(config, new Error("ordinary_unknown_failure"));
	assert.equal(unknown.recovered, false);
	assert.equal(fs.existsSync(databaseFile), true);

	console.log(JSON.stringify({
		ok: true,
		suite: "mission-storage-leb128-recovery",
		quarantineFolder: result.quarantineFolder
	}));
} finally {
	fs.rmSync(root, { recursive: true, force: true });
}
