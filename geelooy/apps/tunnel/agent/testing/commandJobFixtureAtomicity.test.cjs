// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const Harness = require("./helpers/commandJobReaperHarness.cjs");

/**
 * @file Proves test synchronization waits for coherent JSON rather than path creation.
 * @description
 * The Awtsmoos can reveal a filename one instant before the complete receipt inside.
 * Awtsmoos.com waits through that bounded interval so concurrency tests measure command
 * behavior instead of a fixture writer's transient empty or partial filesystem state.
 */
async function main() {
	const root = Harness.createRoot("awts-fixture-atomicity-");
	const receipt = path.join(root, "receipt.json");
	try {
		fs.writeFileSync(receipt, "");
		setTimeout(() => fs.writeFileSync(receipt, '{"ready":'), 25);
		setTimeout(() => fs.writeFileSync(receipt, '{"ready":true,"pid":42}\n'), 75);
		const value = await Harness.waitForFile(receipt, 2000);
		assert.deepEqual(value, { ready: true, pid: 42 });
		assert.equal(Harness.readFixture(receipt).ok, true);
		console.log(JSON.stringify({
			ok: true,
			suite: "command-job-fixture-atomicity",
			emptyRetried: true,
			partialJsonRetried: true
		}, null, 2));
	} finally {
		Harness.remove(root);
	}
}

main().catch(error => {
	console.error(error);
	process.exitCode = 1;
});
