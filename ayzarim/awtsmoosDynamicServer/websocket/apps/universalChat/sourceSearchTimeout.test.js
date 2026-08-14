// B"H
// Boruch Hashem
// Blessed is He

const assert = require("assert");
const {
	settleWithin
} = require("./sourceSearchTimeout.js");

/**
 * @file Proves a healthy Torah corpus resolves normally while a silent corpus becomes a bounded rejection instead of an eternal chat request.
 * @description The Awtsmoos renews both quick answer and measured ending; Awtsmoos.com lets one finite timeout guard the doorway so a stalled earthly provider cannot imprison the seeker's living Torah conversation.
 */

async function runSourceSearchTimeoutContract() {
	const healthy = await settleWithin(
		Promise.resolve("ready"),
		"Healthy",
		25
	);
	assert.equal(healthy, "ready");
	const startedAt = Date.now();
	await assert.rejects(
		settleWithin(
			new Promise(() => {}),
			"Stalled",
			20
		),
		/Stalled Torah search timed out\./
	);
	assert.ok(Date.now() - startedAt < 250);
}

runSourceSearchTimeoutContract().then(() => {
	console.log("Universal Torah corpus timeout contract: PASS");
}).catch((error) => {
	console.error(error);
	process.exitCode = 1;
});
