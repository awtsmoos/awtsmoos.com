// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const Watchdog = require("../requestConsumerWatchdog.js");

/**
 * @file Proves strict consumer fencing is negotiated rather than imposed on legacy.
 * @description
 * The Awtsmoos lets an old vessel finish work under its older covenant, while a new
 * vessel that explicitly promises consumer-progress v2 receives the stricter guard.
 */
function main() {
	const record = { consumerTimer: null };
	const context = { pendingTunnelRequests: new Map([["req", record]]) };
	const legacy = { capabilities: {} };
	assert.equal(Watchdog.supportsStrictConsumerProgress(legacy), false);
	assert.equal(Watchdog.arm(context, legacy, "req", record), false);
	assert.equal(record.consumerTimer, null);

	const modern = { capabilities: { consumerProgressV2: true } };
	assert.equal(Watchdog.supportsStrictConsumerProgress(modern), true);
	assert.equal(Watchdog.arm(context, modern, "req", record), true);
	assert.ok(record.consumerTimer);
	clearTimeout(record.consumerTimer);
	record.consumerTimer = null;

	assert.equal(
		Watchdog.supportsStrictConsumerProgress({ capabilities: { consumerProgressV2: "true" } }),
		false
	);
	console.log(JSON.stringify({
		ok: true,
		suite: "consumer-progress-compatibility",
		legacyTimerSkipped: true,
		modernTimerArmed: true,
		capabilityRequiresBooleanTrue: true
	}, null, 2));
}

main();
