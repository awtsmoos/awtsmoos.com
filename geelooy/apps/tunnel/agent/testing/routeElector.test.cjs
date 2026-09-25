// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const Elector = require("../lib/runtime/routeElector.js");
const { createConnectionRuntime } = require("../lib/runtime/main-connection.js");

/**
 * @file Proves rescue-route promotion with anti-flap hysteresis (B13).
 * @description
 * The Awtsmoos walks the living road: the primary route serves while healthy;
 * sustained primary failure with a healthy rescue promotes the rescue for new
 * generations; sustained primary recovery demotes back. One lucky probe can
 * neither crown nor dethrone a route, and a single-route config behaves exactly
 * as if no elector existed.
 */

const ROUTES = [
	{ name: "primary", tunnelName: "awt-awtsmoos-2184", wsUrl: "wss://primary.invalid" },
	{ name: "rescue", tunnelName: "awt-rescue-7572-v2", wsUrl: "wss://rescue.invalid" }
];

function electorWithLog(routes = ROUTES) {
	const lines = [];
	const elector = Elector.createRouteElector({
		routes,
		log: (level, message) => lines.push({ level, message })
	});
	return { elector, lines };
}

const down = { primary: { alive: false }, rescue: { alive: true } };
const up = { primary: { alive: true }, rescue: { alive: true } };

// 1. Primary down x3 with rescue up -> promotes rescue, loudly.
{
	const { elector, lines } = electorWithLog();
	assert.equal(elector.current().name, "primary");
	elector.observe(down);
	assert.equal(elector.current().name, "primary", "1 failure: hold");
	elector.observe(down);
	assert.equal(elector.current().name, "primary", "2 failures: hold (hysteresis)");
	const snap = elector.observe(down);
	assert.equal(elector.current().name, "rescue", "3 failures: promote");
	assert.equal(snap.elected, "rescue");
	assert.equal(snap.transitions, 1);
	assert.equal(lines.length, 1, "transition logged");
	assert.ok(lines[0].message.includes("primary") && lines[0].message.includes("rescue"));
	assert.equal(elector.current().tunnelName, "awt-rescue-7572-v2");
}

// 2. Hysteresis on demotion: 2x primary-up stays on rescue, 5x returns.
{
	const { elector } = electorWithLog();
	elector.observe(down); elector.observe(down); elector.observe(down);
	assert.equal(elector.current().name, "rescue");
	elector.observe(up); elector.observe(up);
	assert.equal(elector.current().name, "rescue", "2 recoveries: hold (hysteresis)");
	elector.observe(up); elector.observe(up); elector.observe(up);
	assert.equal(elector.current().name, "primary", "5 recoveries: demote");
	assert.equal(elector.snapshot().transitions, 2);
}

// 3. Both up -> primary always preferred; flapping probes don't oscillate.
{
	const { elector } = electorWithLog();
	for (let i = 0; i < 10; i++) elector.observe(up);
	assert.equal(elector.current().name, "primary");
	assert.equal(elector.snapshot().transitions, 0);
}

// 4. No healthy alternative -> hold the current route, never jump into darkness.
{
	const { elector } = electorWithLog();
	const bothDown = { primary: { alive: false }, rescue: { alive: false } };
	for (let i = 0; i < 5; i++) elector.observe(bothDown);
	assert.equal(elector.current().name, "primary");
	assert.equal(elector.snapshot().transitions, 0);
}

// 5. Single-route config -> pass-through, identical to no elector.
{
	const { elector } = electorWithLog([{ name: "primary", wsUrl: "wss://only.invalid" }]);
	for (let i = 0; i < 5; i++) elector.observe({ primary: { alive: false } });
	assert.equal(elector.current().name, "primary");
	assert.equal(elector.current().wsUrl, "wss://only.invalid");
	assert.equal(elector.snapshot().transitions, 0);
	const def = Elector.createRouteElector();
	assert.equal(def.current().name, "primary");
}

// 6. Unknown probes hold the election; reset() restores primary.
{
	const { elector } = electorWithLog();
	elector.observe({});
	assert.equal(elector.current().name, "primary");
	elector.observe(down); elector.observe(down); elector.observe(down);
	assert.equal(elector.current().name, "rescue");
	elector.reset();
	assert.equal(elector.current().name, "primary");
}

// 7. Custom thresholds honored.
{
	const elector = Elector.createRouteElector({ routes: ROUTES, promoteAfterFailures: 1 });
	elector.observe(down);
	assert.equal(elector.current().name, "rescue");
}

// --- main-connection.js integration (B9 wiring + B13 route election) ---

function stubDependencies(config, state = {}) {
	const dialed = [];
	const logs = [];
	const { EventEmitter } = require("node:events");
	class FakeSocket extends EventEmitter {
		constructor(url, options = {}) {
			super();
			this.url = url;
			this.options = options;
			dialed.push({ url, options });
		}
		connect() { this.connected = true; }
		close() {}
	}
	const dependencies = {
		state: { generation: 0, recentFailures: [], ...state },
		loadConfig: () => config,
		log: (level, message) => logs.push({ level, message }),
		TinyWebSocket: FakeSocket,
		env: {}
	};
	return { dependencies, dialed, logs };
}

// 8. Single-route config: connect() behavior identical to today.
{
	const config = { tunnelName: "awt-awtsmoos-2184", wsUrl: "wss://relay.invalid/t" };
	const { dependencies, dialed, logs } = stubDependencies(config);
	const runtime = createConnectionRuntime(dependencies);
	const ws = runtime.connect();
	assert.equal(dialed.length, 1);
	assert.equal(dialed[0].url, "wss://relay.invalid/t");
	assert.equal(dependencies.state.tunnelName, "awt-awtsmoos-2184");
	assert.equal(dependencies.state.generation, 1);
	assert.equal(ws, dependencies.state.activeWs);
	assert.ok(dialed[0].options.liveness, "liveness options passed to the socket");
	assert.equal(dialed[0].options.liveness.deadIdleMs, 45000, "sparse history -> default threshold");
	assert.ok(!("routeElector" in dependencies.state), "no elector created for single route");
	assert.ok(logs.some(l => l.message.includes("wss://relay.invalid/t")), "dial logged");
}

// 9. Multi-route config: sustained primary failure promotes rescue for new work.
{
	const config = {
		tunnelName: "awt-awtsmoos-2184",
		wsUrl: "wss://primary.invalid",
		routes: ROUTES
	};
	const { dependencies, dialed } = stubDependencies(config);
	const runtime = createConnectionRuntime(dependencies);
	runtime.connect();
	assert.equal(dialed[0].url, "wss://primary.invalid", "starts on primary");
	dependencies.state.routeProbes = { primary: { alive: false }, rescue: { alive: true } };
	runtime.connect();
	assert.equal(dialed[1].url, "wss://primary.invalid", "1 bad round: hold");
	runtime.connect();
	assert.equal(dialed[2].url, "wss://primary.invalid", "2 bad rounds: hold");
	runtime.connect();
	assert.equal(dialed[3].url, "wss://rescue.invalid", "3 bad rounds: rescue serves new work");
	assert.equal(dependencies.state.tunnelName, "awt-rescue-7572-v2");
	// Demote back after sustained primary recovery.
	dependencies.state.routeProbes = { primary: { alive: true }, rescue: { alive: true } };
	for (let i = 0; i < 4; i++) runtime.connect();
	assert.equal(dialed[dialed.length - 1].url, "wss://rescue.invalid", "4 good rounds: hold rescue");
	runtime.connect();
	assert.equal(dialed[dialed.length - 1].url, "wss://primary.invalid", "5 good rounds: back to primary");
}

// 10. B9 wiring: flap history observed by a dying generation adapts the new
// generation's death threshold (driven through the real connect() path).
{
	const Monotonic = require("../lib/runtime/monotonic.js");
	const base = Monotonic.monotonicMs();
	const history = [];
	for (let i = 0; i < 8; i++) {
		history.push({
			at: new Date().toISOString(),
			atMono: base - 1000 - (7 - i) * 30000,
			category: "socket"
		});
	}
	const config = { tunnelName: "t", wsUrl: "wss://x.invalid" };
	const { dependencies, dialed, logs } = stubDependencies(config, { recentFailures: history });
	const runtime = createConnectionRuntime(dependencies);
	runtime.connect();
	assert.equal(dialed[0].options.liveness.deadIdleMs, 90000,
		"30s flap cadence -> 2x threshold through connect()");
	assert.ok(logs.some(l => String(l.message).includes("adaptive liveness")),
		"adaptation logged");
}

console.log(JSON.stringify({
	ok: true,
	suite: "route-elector",
	promoteAfter: Elector.DEFAULT_PROMOTE_AFTER_FAILURES,
	demoteAfter: Elector.DEFAULT_DEMOTE_AFTER_SUCCESSES
}, null, 2));
