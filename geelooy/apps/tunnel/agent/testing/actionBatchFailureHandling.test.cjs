// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const { runActionBatch } = require("../tools/fs/actionBatch.js");

async function run() {
	await assert.rejects(
		runActionBatch({
			steps: [{ action: "fail" }]
		}, async () => ({ ok: false, error: "expected_failure" })),
		(error) => {
			assert.equal(error.message, "expected_failure");
			assert.doesNotMatch(error.stack, /result is not defined/);
			return true;
		}
	);

	const continued = await runActionBatch({
		stopOnError: false,
		steps: [{ action: "fail" }]
	}, async () => ({ ok: false, error: "stable_failure" }));
	assert.equal(continued.ok, false);
	assert.equal(continued.results[0].result.error, "stable_failure");

	let attempts = 0;
	let recoveries = 0;
	const recovered = await runActionBatch({
		stopOnError: false,
		steps: [{
			action: "flaky",
			retry: { times: 2 },
			onError: [{ action: "recover" }]
		}]
	}, async (payload) => {
		if (payload.action === "recover") {
			recoveries += 1;
			return { ok: true };
		}
		attempts += 1;
		return { ok: false, error: "still_failing" };
	});
	assert.equal(recovered.ok, false);
	assert.equal(attempts, 2);
	assert.equal(recoveries, 1);
}

run().then(() => {
	console.log(JSON.stringify({
		ok: true,
		suite: "action-batch-failure-handling"
	}, null, 2));
}).catch((error) => {
	console.error(error.stack || error.message);
	process.exitCode = 1;
});
