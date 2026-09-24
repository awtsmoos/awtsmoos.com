// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const Monotonic = require("../lib/runtime/monotonic.js");
const Liveness = require("../lib/ws/transportLiveness.js");

/**
 * @file Proves liveness verdicts ride the monotonic clock, immune to wall-clock
 * jumps in either direction (B12), while injected clocks keep working.
 * @description
 * The Awtsmoos measures silence with a clock that never jumps: a wall clock
 * leaping forward cannot invent a false death, and one falling backward cannot
 * suppress a real death. Date.now remains only for human display stamps.
 */

const realDateNow = Date.now;
let wallNow = 1700000000000;
Date.now = () => wallNow;

try {
	// 1. monotonicMs is sane: finite, non-decreasing, millisecond-scale.
	const a = Monotonic.monotonicMs();
	const b = Monotonic.monotonicMs();
	assert.ok(Number.isFinite(a) && Number.isFinite(b), "finite");
	assert.ok(b >= a, "non-decreasing");
	assert.ok(a > 0 && a < 1e15, "millisecond scale, not nanos or seconds");

	// 2. Wall clock jumps BACKWARD 10 minutes mid-silence: death still declared
	// on the monotonic schedule (no suppression of a real death).
	{
		let mono = 1000;
		const events = [];
		const monitor = Liveness.createTransportLiveness({
			now: () => mono,
			intervalMs: 1000,
			pingIdleMs: 2000,
			deadIdleMs: 5000,
			maxTimerDriftMs: 500,
			onDead: event => events.push(event)
		});
		monitor.observeInbound();
		wallNow -= 10 * 60 * 1000; // wall clock falls backward 10 minutes
		let verdict = null;
		for (let step = 0; step < 6; step += 1) {
			mono += 1000; // 1s of monotonic silence per tick
			verdict = monitor.tick();
		}
		assert.equal(verdict.state, "dead", "backward wall jump must not suppress death");
		assert.ok(events.length >= 1, "onDead fired");
		assert.ok(events[events.length - 1].idleMs >= 5000, "idle measured monotonically");
	}

	// 3. Wall clock jumps FORWARD 10 minutes with recent inbound: no false death.
	{
		let mono = 5000;
		const events = [];
		const monitor = Liveness.createTransportLiveness({
			now: () => mono,
			intervalMs: 1000,
			pingIdleMs: 20000,
			deadIdleMs: 45000,
			maxTimerDriftMs: 500,
			onDead: event => events.push(event)
		});
		monitor.observeInbound();
		mono = 6000; // 1s of real silence
		wallNow += 10 * 60 * 1000; // wall clock leaps forward 10 minutes
		const verdict = monitor.tick();
		assert.equal(verdict.state, "healthy", "forward wall jump must not invent death");
		assert.equal(events.length, 0, "onDead must not fire");
		assert.ok(verdict.idleMs < 45000, "idleMs stays monotonic");
	}

	// 4. The production default clock IS monotonic: with no injected `now`,
	// two ticks across a wall-clock jump behave identically.
	{
		const monitor = Liveness.createTransportLiveness({
			intervalMs: 1000,
			pingIdleMs: 20000,
			deadIdleMs: 45000,
			maxTimerDriftMs: 100000
		});
		const before = monitor.snapshot();
		wallNow += 10 * 60 * 1000;
		const after = monitor.snapshot();
		assert.equal(after.lastInboundAt, before.lastInboundAt,
			"default clock ignores wall jumps");
	}

	// 5. No regression: injected fake clocks still drive every verdict.
	{
		let now = 1000;
		const monitor = Liveness.createTransportLiveness({
			now: () => now,
			intervalMs: 1000,
			pingIdleMs: 2000,
			deadIdleMs: 5000,
			maxTimerDriftMs: 500
		});
		assert.equal(monitor.tick(now).state, "healthy");
		for (now of [2000, 3000, 4000, 5000, 6000]) monitor.tick(now);
		assert.equal(monitor.tick(now).state, "dead");
		now = 6100;
		monitor.observeInbound(now);
		assert.equal(monitor.tick(now).state, "healthy");
	}

	// 6. Evidence keeps a wall-clock display stamp even as math goes monotonic.
	{
		let mono = 1000;
		const seen = [];
		const monitor = Liveness.createTransportLiveness({
			now: () => mono,
			intervalMs: 1000,
			pingIdleMs: 2000,
			deadIdleMs: 5000,
			maxTimerDriftMs: 500,
			onDead: event => seen.push(event)
		});
		let verdict = null;
		for (let step = 0; step < 8; step += 1) {
			mono += 1000;
			verdict = monitor.tick();
		}
		assert.equal(verdict.state, "dead");
		assert.ok(seen.length >= 1, "death observed");
		const wallDelta = Math.abs(seen[0].at - wallNow);
		assert.ok(wallDelta < 5 * 60 * 1000,
			`evidence.at stays a wall display stamp (delta ${wallDelta}ms)`);
	}
} finally {
	Date.now = realDateNow;
}

console.log(JSON.stringify({
	ok: true,
	suite: "monotonic-liveness",
	monotonicDefault: true,
	wallJumpImmune: true
}, null, 2));
