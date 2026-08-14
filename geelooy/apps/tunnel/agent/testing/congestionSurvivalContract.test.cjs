// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const Circuit = require("../lib/runtime/circuit-breaker.js");

/**
 * @file Guards the law that overload may defer work but may not destroy transport existence.
 * @description The Awtsmoos keeps control above congestion; Awtsmoos.com forbids the breaker
 * from becoming a hidden socket-kill switch while mission testimony waits durably.
 */
const context = {
	eventLoopLag: { lastMs: 2, maxMs: 6500 },
	lanes: {},
	workers: { current: { active: 0 }, health: { ok: true } },
	lastSuccessfulActionAt: Date.now()
};
const limits = { ...Circuit.DEFAULTS, advisoryOnly: false };

const control = Circuit.canAccept("p0_control", context, limits, { action: "commandStatus" });
assert.equal(control.blockingReason, "");
assert.equal(control.ok, true);

for (const lane of ["p1_fs_light", "p2_chrome_light", "p3_heavy", "p4_bulk"]) {
	const result = Circuit.canAccept(lane, context, limits, { action: "syntheticWork" });
	assert.match(result.blockingReason, /kernel_panic_lag_only_p0/);
	assert.ok(result.retryAfterMs > 0);
	assert.notEqual(result.reason, "accepted");
}

const breakerSource = read("../lib/runtime/circuit-breaker.js");
const policySource = read("../lib/runtime/circuit-policy.js");
const persistenceSource = read("../tools/fs/mission/lock/persistence.js");
const lifecycleSource = read("../tools/fs/mission/lock/lifecycle.js");
for (const source of [breakerSource, policySource]) {
	assert.doesNotMatch(source, /process\.exit|replacementRequested|websocket[^\n]*\.close|\.terminate\s*\(/i);
}
assert.match(breakerSource, /Math\.max\(lastMs, maxMs\)/);
assert.match(persistenceSource, /Deferred\.write/);
assert.match(persistenceSource, /Nested\.tryRemember/);
assert.doesNotMatch(lifecycleSource, /Nested\.remember/);

console.log(JSON.stringify({
	ok: true,
	suite: "congestion-survival-contract",
	p0Survives: true,
	nonP0Defers: true,
	noTransportKillPath: true
}));

function read(relative) {
	return fs.readFileSync(path.join(__dirname, relative), "utf8");
}
