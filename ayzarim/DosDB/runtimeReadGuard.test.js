// B"H

const assert = require("node:assert/strict");
const test = require("node:test");
const {
	createGuardedDosDB,
	installRuntimeReadGuard
} = require("./runtimeReadGuard.js");

/**
 * A tiny finite vessel representing the legacy DosDB parser contract.
 */
class TestDosDB {
	static marker = "preserved";

	constructor(result) {
		this.result = result;
	}

	async parseBinaryData() {
		return this.result;
	}
}

test("normalizes an absent binary result to an empty object", async () => {
	const GuardedDosDB = createGuardedDosDB(TestDosDB);
	const database = new GuardedDosDB(null);

	assert.deepEqual(await database.parseBinaryData(), {});
	assert.equal(GuardedDosDB.marker, "preserved");
});

test("preserves successful and erroneous parser results", async () => {
	const success = { success: { id: "ikar" } };
	const failure = { error: { code: "BROKEN_RECORD" } };
	const GuardedDosDB = createGuardedDosDB(TestDosDB);

	assert.equal(await new GuardedDosDB(success).parseBinaryData(), success);
	assert.equal(await new GuardedDosDB(failure).parseBinaryData(), failure);
});

test("installs the guard only once on an existing instance", async () => {
	const database = new TestDosDB(undefined);
	installRuntimeReadGuard(database);
	const guardedParser = database.parseBinaryData;
	installRuntimeReadGuard(database);

	assert.equal(database.parseBinaryData, guardedParser);
	assert.deepEqual(await database.parseBinaryData(), {});
});
