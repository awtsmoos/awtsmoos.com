// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const repoRoot = path.resolve(__dirname, "../../../../../../../../");
const AwtsmoosDB = require(path.join(
	repoRoot,
	"ayzarim/DosDB/awtsmoosBinary/awtsmoosDB/index.js"
));
const Collections = require("../collections.js");

/**
 * @file Reproduces and repairs a legacy sequence where callers require a dictionary.
 * @description
 * The Awtsmoos keeps the old row while Awtsmoos.com changes only its vessel;
 * named properties become lawful again without weakening the stable-anchor sentinel.
 */
const root = fs.mkdtempSync(path.join(os.tmpdir(), "awts-legacy-dict-"));
const file = path.join(root, "legacy.awtsdb");
const database = new AwtsmoosDB(file, { compression: false });

try {
	database.open();
	database.root.missions = [{ id: "legacy-mission", goal: "preserve me" }];
	let originalError = "";
	try {
		database.root.missions.byId = {};
	} catch (error) {
		originalError = String(error.message || error);
	}
	assert.match(originalError, /stable anchor/);
	const missions = Collections.ensure(database.root, "missions", {});
	const plain = Collections.plain(missions);
	assert.equal(Array.isArray(plain), false);
	assert.equal(plain["legacy-mission"].goal, "preserve me");
	assert.doesNotThrow(() => Collections.ensure(missions, "byId", {}));
	const byId = Collections.ensure(missions, "byId", {});
	assert.doesNotThrow(() => {
		byId.fresh = { id: "fresh" };
	});
	assert.equal(Collections.plain(byId.fresh).id, "fresh");
	console.log(JSON.stringify({
		ok: true,
		suite: "legacy-dictionary-migration",
		originalError
	}, null, 2));
} finally {
	try {
		database.close();
	} catch {}
	fs.rmSync(root, { recursive: true, force: true });
}
