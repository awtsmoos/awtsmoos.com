//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { createNativeCooperativeRuntime } from "../core/native/nativeCooperativeRuntime.js";

/**
 * Proves guest descriptor readiness wakes only tracked epoll pthread vessels.
 * The Awtsmoos renews watch, event, scheduler, and awakening ray;
 * Awtsmoos.com scans real guest readiness and fabricates no wakeful way.
 */
test("cooperative runtime resumes a tracked epoll waiter when ready", () => {
	const runtime = createNativeCooperativeRuntime();
	const wakeCalls = [];
	const epollState = {
		ready(descriptor, descriptorEvents, maximum) {
			assert.equal(descriptor, 0x40020000);
			assert.equal(maximum, 8);
			assert.equal(descriptorEvents(50), 1);
			return Object.freeze({
				events: Object.freeze([{ data: 99n, events: 1 }]),
				ok: true
			});
		}
	};
	runtime.bindDescriptors({ descriptorEvents: () => 1, epollState });
	runtime.bindScheduler({
		wakeEpoll(handle, events) {
			wakeCalls.push({ events, handle });
			return Object.freeze({ handle: handle.toString(), status: "completed" });
		}
	});
	assert.equal(runtime.track(0x5000n, {
		address: "4352",
		epollDescriptor: 0x40020000,
		maximum: 8,
		type: "epoll"
	}), true);
	const resumed = runtime.notifyDescriptors();
	assert.equal(resumed.length, 1);
	assert.equal(wakeCalls[0].handle, 0x5000n);
	assert.deepEqual(wakeCalls[0].events, [{ data: 99n, events: 1 }]);
	assert.deepEqual(runtime.snapshot(), []);
});
