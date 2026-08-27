// B"H

import assert from "node:assert/strict";
import { createRoomActivation } from "../missionRooms/roomActivation.js";

function deferred() {
	let resolve;
	let reject;
	const promise = new Promise((yes, no) => {
		resolve = yes;
		reject = no;
	});
	return { promise, resolve, reject };
}

const state = {
	paneActive: false,
	activationRevision: 0,
	selectedMissionId: "mission-one"
};
const calls = { discover: 0, join: 0, schedule: 0, destroy: 0 };
const firstDiscovery = deferred();
let useDeferredDiscovery = true;
const runtime = {
	scheduleDiscover() { calls.schedule += 1; },
	destroy() { calls.destroy += 1; }
};
const activation = createRoomActivation(state, runtime, {
	discover() {
		calls.discover += 1;
		return useDeferredDiscovery ? firstDiscovery.promise : Promise.resolve();
	},
	join() {
		calls.join += 1;
		return Promise.resolve();
	}
});

const staleActivation = activation.activate();
activation.suspend();
firstDiscovery.resolve();
assert.equal(await staleActivation, false);
assert.equal(calls.join, 0, "stale activation must not join after suspension");
assert.equal(calls.schedule, 0, "stale activation must not recreate timers");
assert.equal(calls.destroy, 1);

useDeferredDiscovery = false;
assert.equal(await activation.activate(), true);
assert.equal(state.paneActive, true);
assert.equal(calls.join, 1);
assert.equal(calls.schedule, 1);
assert.equal(await activation.activate(), false, "repeated activation must be idempotent");
assert.equal(calls.discover, 2);
assert.equal(calls.schedule, 1);
activation.suspend();
assert.equal(state.paneActive, false);
assert.equal(calls.destroy, 2);

console.log("BHY room activation lifecycle test passed");
