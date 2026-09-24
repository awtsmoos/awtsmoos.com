// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const Settings = require("../lib/ws/transportLivenessSettings.js");
const History = require("../lib/ws/transportFailureHistory.js");

/**
 * @file Proves the missed-heartbeat death threshold adapts to observed relay
 * flap cadence within safe bounds (B9), and never regresses the static defaults.
 * @description
 * The Awtsmoos learns the storm's rhythm: frequent short flaps widen the death
 * verdict so a known cadence cannot masquerade as novel death — yet the
 * threshold never drops below its default, never exceeds 2x/180s, ignores
 * sparse history, and decays back after a quiet period.
 */

const BASE_DEAD_IDLE_MS = Settings.DEFAULT_DEAD_IDLE_MS; // 45000

function monoFailures(count, intervalMs, monoBase = 1000000) {
	const out = [];
	for (let i = 0; i < count; i++) {
		out.push({
			at: new Date(Date.now() - (count - 1 - i) * intervalMs).toISOString(),
			atMono: monoBase + i * intervalMs,
			category: "socket"
		});
	}
	return out;
}

function wallFailures(count, intervalMs, wallBase = Date.now()) {
	const out = [];
	for (let i = 0; i < count; i++) {
		out.push({
			at: new Date(wallBase - (count - 1 - i) * intervalMs).toISOString(),
			category: "socket"
		});
	}
	return out;
}

// 1. Frequent short flaps adapt the threshold upward, within the 2x cap.
{
	const history = monoFailures(8, 30000);
	const lastAt = history[history.length - 1].atMono;
	const out = Settings.adaptive(history, {}, {}, () => lastAt + 1000);
	assert.equal(out.adaptive.active, true);
	assert.equal(out.adaptive.reason, "flap_pressure");
	assert.equal(out.adaptive.samples, 8);
	assert.equal(out.adaptive.medianIntervalMs, 30000);
	assert.ok(out.deadIdleMs > BASE_DEAD_IDLE_MS, "threshold widens under flap pressure");
	assert.ok(out.deadIdleMs <= 2 * BASE_DEAD_IDLE_MS, "threshold never exceeds 2x base");
	assert.ok(out.deadIdleMs <= Settings.ADAPT_MAX_DEAD_IDLE_MS, "threshold never exceeds 180s");
}

// 2. Sparse history never adapts: defaults unchanged under novel conditions.
{
	const out = Settings.adaptive(monoFailures(1, 30000), {}, {}, () => 2000000);
	assert.equal(out.deadIdleMs, BASE_DEAD_IDLE_MS);
	assert.equal(out.adaptive.active, false);
	assert.equal(out.adaptive.reason, "insufficient_samples");
	const empty = Settings.adaptive([], {}, {}, () => 2000000);
	assert.equal(empty.deadIdleMs, BASE_DEAD_IDLE_MS);
	assert.equal(empty.adaptive.active, false);
}

// 3. Quiet period decays back to base even with a stormy past.
{
	const history = monoFailures(8, 30000);
	const lastAt = history[history.length - 1].atMono;
	const out = Settings.adaptive(history, {}, {}, () => lastAt + 10 * 60 * 1000);
	assert.equal(out.deadIdleMs, BASE_DEAD_IDLE_MS);
	assert.equal(out.adaptive.active, false);
	assert.equal(out.adaptive.reason, "quiet_period");
}

// 4. Slow cadence (low pressure) keeps the default threshold.
{
	const history = monoFailures(8, 10 * 60 * 1000);
	const lastAt = history[history.length - 1].atMono;
	const out = Settings.adaptive(history, {}, {}, () => lastAt + 1000);
	assert.equal(out.deadIdleMs, BASE_DEAD_IDLE_MS);
	assert.equal(out.adaptive.active, false);
	assert.equal(out.adaptive.reason, "low_pressure");
}

// 5. The threshold NEVER shortens below base, even under extreme flapping.
{
	const history = monoFailures(8, 1000);
	const lastAt = history[history.length - 1].atMono;
	const out = Settings.adaptive(history, {}, {}, () => lastAt + 1000);
	assert.ok(out.deadIdleMs >= BASE_DEAD_IDLE_MS, "never below base");
	assert.ok(out.deadIdleMs <= 2 * BASE_DEAD_IDLE_MS, "2x cap holds");
}

// 6. Absolute 180s cap wins over 2x when the base itself is large.
{
	const history = monoFailures(8, 1000);
	const lastAt = history[history.length - 1].atMono;
	const out = Settings.adaptive(history, { deadIdleMs: 300000 }, {}, () => lastAt + 1000);
	assert.equal(out.deadIdleMs, 180000);
	assert.equal(out.adaptive.active, true);
}

// 7. Wall-clock fallback: records predating atMono still drive adaptation.
{
	const history = wallFailures(8, 30000);
	const out = Settings.adaptive(history, {}, {}, () => Date.now());
	assert.equal(out.adaptive.domain, "wall");
	assert.equal(out.adaptive.active, true);
	assert.ok(out.deadIdleMs > BASE_DEAD_IDLE_MS);
}

// 8. cadence() prefers the monotonic series and reports its domain.
{
	const history = monoFailures(6, 20000);
	const c = History.cadence(history);
	assert.equal(c.samples, 6);
	assert.equal(c.domain, "mono");
	assert.equal(c.medianIntervalMs, 20000);
	const sparse = History.cadence(monoFailures(2, 20000));
	assert.equal(sparse.domain, "none");
	assert.equal(sparse.medianIntervalMs, 0);
}

// 9. No regression: resolve() honors explicit options; history helpers intact.
{
	const explicit = Settings.resolve({ deadIdleMs: 60000, intervalMs: 5000 });
	assert.equal(explicit.deadIdleMs, 60000);
	assert.equal(explicit.intervalMs, 5000);
	const appended = History.append([], { category: "socket" });
	assert.equal(History.summary(appended).count, 1);
	assert.equal(History.DEFAULT_LIMIT, 20);
}

console.log(JSON.stringify({
	ok: true,
	suite: "transport-liveness-adaptive",
	baseDeadIdleMs: BASE_DEAD_IDLE_MS,
	adaptedExampleMs: Settings.adaptive(monoFailures(8, 30000), {}, {},
		() => monoFailures(8, 30000)[7].atMono + 1000).deadIdleMs
}, null, 2));
