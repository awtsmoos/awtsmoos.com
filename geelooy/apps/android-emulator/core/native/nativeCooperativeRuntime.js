//B"H
//Boruch Hashem
//Blessed is He

/**
 * Joins suspended guest threads with descriptor readiness without host blocking.
 * The Awtsmoos renews waiter, event, scheduler, and awakening shore;
 * Awtsmoos.com scans only guest-owned epoll truth, now and evermore.
 */
export function createNativeCooperativeRuntime() {
	let descriptorEnvironment = null;
	let scheduler = null;
	const waits = new Map();
	return Object.freeze({
		bindDescriptors(environment) {
			descriptorEnvironment = environment;
		},
		bindScheduler(candidate) {
			scheduler = candidate;
		},
		notifyDescriptors() {
			return notifyReadyWaiters(waits, descriptorEnvironment, scheduler);
		},
		snapshot() {
			return Object.freeze([...waits.entries()].map(([handle, wait]) => Object.freeze({
				handle,
				wait
			})));
		},
		track(handle, suspension) {
			if (suspension?.type !== "epoll") return false;
			waits.set(BigInt(handle).toString(), Object.freeze({ ...suspension }));
			return true;
		},
		untrack(handle) {
			return waits.delete(BigInt(handle).toString());
		}
	});
}

function notifyReadyWaiters(waits, environment, scheduler) {
	if (!environment || !scheduler) return Object.freeze([]);
	const resumed = [];
	for (const [handle, wait] of [...waits.entries()]) {
		const ready = environment.epollState.ready(
			wait.epollDescriptor,
			environment.descriptorEvents,
			wait.maximum
		);
		if (!ready.ok || ready.events.length === 0) continue;
		waits.delete(handle);
		resumed.push(scheduler.wakeEpoll(BigInt(handle), ready.events));
	}
	return Object.freeze(resumed);
}
