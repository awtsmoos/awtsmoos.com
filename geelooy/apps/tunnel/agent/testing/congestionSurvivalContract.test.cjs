// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const Circuit = require("../lib/runtime/circuit-breaker.js");

/**
 * @file Guards the law that present overload may park work but may not reject the deed or destroy transport.
 * @description
 * The Awtsmoos keeps control above today's congestion while old thunder remains only testimony;
 * Awtsmoos.com retains accepted mission deeds until recent pressure clears instead of requiring unsafe redispatch.
 */
const context = {
	eventLoopLag: {
		lastMs: 6100,
		p90Ms: 6500,
		maxMs: 9000
	},
	lanes: {},
	workers: { current: { active: 0 }, health: { ok: true } },
	lastSuccessfulActionAt: Date.now()
};
const limits = { ...Circuit.DEFAULTS, advisoryOnly: false };

const control = Circuit.canAccept("p0_control", context, limits, { action: "commandStatus" });
assert.equal(control.ok, true);
assert.equal(control.startAllowed, true);
assert.equal(control.representativeLagMs, 6500);
assert.equal(control.maxEventLoopLagMs, 9000);

for (const lane of ["p1_fs_light", "p2_chrome_light", "p3_heavy", "p4_bulk"]) {
	const result = Circuit.canAccept(lane, context, limits, { action: "syntheticWork" });
	assert.equal(result.ok, true);
	assert.equal(result.deferred, true);
	assert.equal(result.startAllowed, false);
	assert.ok(result.retryAfterMs > 0);
}

const breakerSource = read("../lib/runtime/circuit-breaker.js");
const queueSource = read("../lib/runtime/main-queue.js");
const policySource = read("../lib/runtime/circuit-policy.js");
const persistenceSource = read("../tools/fs/mission/lock/persistence.js");
for (const source of [breakerSource, policySource]) {
	assert.doesNotMatch(source, /process\.exit|replacementRequested|websocket[^\n]*\.close|\.terminate\s*\(/i);
}
assert.match(breakerSource, /representativeMs = Math\.max\(lastMs, p90Ms\)/);
assert.match(breakerSource, /pressureMs: representativeMs/);
assert.match(queueSource, /pressure\.wake/);
assert.match(queueSource, /pressure\.lanes/);
assert.match(persistenceSource, /Deferred\.write/);

console.log(JSON.stringify({
	ok: true,
	suite: "congestion-survival-contract",
	p0Survives: true,
	nonP0Parks: true,
	noTransportKillPath: true,
	representativePressure: true
}));

function read(relative) {
	return fs.readFileSync(path.join(__dirname, relative), "utf8");
}
