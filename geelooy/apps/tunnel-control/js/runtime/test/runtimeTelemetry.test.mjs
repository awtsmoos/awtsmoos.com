// B"H
// Boruch Hashem
// Blessed is He

import assert from "assert";
import { getRuntimeTelemetry, ingestRuntimeEnvelope, resetRuntimeTelemetry, subscribeRuntimeTelemetry } from "../runtimeTelemetry.js";

resetRuntimeTelemetry();
let notifications = 0;
const unsubscribe = subscribeRuntimeTelemetry(function recordNotification() {
	notifications += 1;
});

ingestRuntimeEnvelope({
	actualAction: "chromeStatus",
	tunnelName: "native-one",
	pages: [
		{ lease: { scopeKey: "a" } },
		{ lease: null }
	],
	queueStats: {
		queued: 3,
		workers: {
			activeTotal: 2,
			supervisors: 1,
			recentFailed: 4
		},
		eventLoopLag: {
			lastMs: 7
		},
		circuit: {
			level: "open"
		}
	},
	longLivedConnections: true
}, 1000);

let snapshot = getRuntimeTelemetry();
assert.strictEqual(snapshot.tunnelName, "native-one");
assert.strictEqual(snapshot.counts.browserTargets, 2);
assert.strictEqual(snapshot.counts.leasedBrowsers, 1);
assert.strictEqual(snapshot.counts.activeWorkers, 2);
assert.strictEqual(snapshot.counts.queuedActions, 3);
assert.strictEqual(snapshot.counts.shellSessions, null);
assert.strictEqual(snapshot.observed.browserTargets, 1000);
assert.strictEqual(snapshot.health.eventLoopLagMs, 7);

ingestRuntimeEnvelope({
	devices: [{}, {}]
}, 2000);
snapshot = getRuntimeTelemetry();
assert.strictEqual(snapshot.counts.tunnels, 2);
assert.strictEqual(snapshot.counts.browserTargets, 2);
assert.strictEqual(snapshot.observed.browserTargets, 1000);

ingestRuntimeEnvelope({
	shellSessions: []
}, 3000);
snapshot = getRuntimeTelemetry();
assert.strictEqual(snapshot.counts.shellSessions, 0);
assert.strictEqual(snapshot.observed.shellSessions, 3000);

const priorObservation = snapshot.observedAt;
ingestRuntimeEnvelope({
	ok: true,
	message: "No telemetry here"
}, 4000);
assert.strictEqual(getRuntimeTelemetry().observedAt, priorObservation);
assert.strictEqual(notifications, 4);

unsubscribe();
console.log("BHY runtime telemetry truth tests passed");
