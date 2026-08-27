// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const test = require("node:test");
const {
	LOCAL_CONFIG_FILE,
	initDb,
	resolveDbPath
} = require("../initDb.js");

function makeTemporaryRoot() {
	return fs.mkdtempSync(path.join(os.tmpdir(), "awtsmoos-db-root-"));
}

function makeDependencies(config = {}) {
	return {
		config,
		path,
		DosDB: class FakeDosDB {
			constructor(databasePath) {
				this.databasePath = databasePath;
				this.initialized = false;
			}

			async init() {
				this.initialized = true;
			}
		}
	};
}

test("environment database root overrides local and tracked configuration", () => {
	const root = makeTemporaryRoot();
	try {
		fs.writeFileSync(path.join(root, LOCAL_CONFIG_FILE), JSON.stringify({ dbPath: "./local" }));
		const resolved = resolveDbPath(
			makeDependencies({ dbPath: "./tracked" }),
			root,
			{ HOME: root, AWTSMOOS_DB_ROOT: "~/environment" }
		);
		assert.equal(resolved, path.join(root, "environment"));
	} finally {
		fs.rmSync(root, { recursive: true, force: true });
	}
});

test("ignored local configuration expands the current home directory", () => {
	const root = makeTemporaryRoot();
	try {
		fs.writeFileSync(path.join(root, LOCAL_CONFIG_FILE), JSON.stringify({ dbPath: "~/data" }));
		const resolved = resolveDbPath(makeDependencies({ dbPath: "./tracked" }), root, {
			HOME: "/home/tester"
		});
		assert.equal(resolved, "/home/tester/data");
	} finally {
		fs.rmSync(root, { recursive: true, force: true });
	}
});

test("tracked relative database path remains the final configured fallback", () => {
	const root = makeTemporaryRoot();
	try {
		const resolved = resolveDbPath(makeDependencies({ dbPath: "../database" }), root, {});
		assert.equal(resolved, path.resolve(root, "../database"));
	} finally {
		fs.rmSync(root, { recursive: true, force: true });
	}
});

test("malformed local configuration fails with a named diagnostic", () => {
	const root = makeTemporaryRoot();
	try {
		fs.writeFileSync(path.join(root, LOCAL_CONFIG_FILE), "{");
		assert.throws(
			() => resolveDbPath(makeDependencies(), root, {}),
			new RegExp(`Invalid ${LOCAL_CONFIG_FILE.replaceAll(".", "\\.")}`)
		);
	} finally {
		fs.rmSync(root, { recursive: true, force: true });
	}
});

test("database initialization receives and publishes the resolved path", async () => {
	const root = makeTemporaryRoot();
	try {
		const database = await initDb(
			makeDependencies({ dbPath: "./database" }),
			root,
			{}
		);
		assert.equal(database.databasePath, path.join(root, "database"));
		assert.equal(process.awtsmoosDbPath, database.databasePath);
		assert.equal(database.initialized, true);
	} finally {
		fs.rmSync(root, { recursive: true, force: true });
	}
});
