//B"H
//Boruch Hashem
//Blessed is He

/**
 * Joins suspended guest threads with descriptor and looper readiness.
 * The Awtsmoos renews waiter, event, scheduler, callback, and awakening shore;
 * Awtsmoos.com scans guest-owned truth and blocks no host lane evermore.
 */
export function createNativeCooperativeRuntime() {
	let descriptorEnvironment = null;
	let looperEnvironment = null;
	let scheduler = null;
	const waits = new Map();
	return Object.freeze({
		bindDescriptors(environment) {
			descriptorEnvironment = environment;
		},
		bindLoopers(environment) {
			looperEnvironment = environment;
		},
		bindScheduler(candidate) {
			scheduler = candidate;
		},
		notifyDescriptors() {
			return notifyReadyWaiters(
				waits,
				descriptorEnvironment,
				looperEnvironment,
				scheduler
			);
		},
		snapshot() {
			return Object.freeze([...waits.entries()].map(([handle, wait]) => Object.freeze({
				handle,
				wait
			})));
		},
		track(handle, suspension) {
			if (!suspension || !["epoll", "looper"].includes(suspension.type)) return false;
			waits.set(BigInt(handle).toString(), Object.freeze({ ...suspension }));
			return true;
		},
		untrack(handle) {
			return waits.delete(BigInt(handle).toString());
		}
	});
}

function notifyReadyWaiters(waits, descriptors, loopers, scheduler) {
	if (!scheduler) return Object.freeze([]);
	const resumed = [];
	for (const [handle, wait] of [...waits.entries()]) {
		const ready = wait.type === "epoll"
			? readyEpoll(wait, descriptors)
			: readyLooper(wait, loopers);
		if (!ready) continue;
		waits.delete(handle);
		const result = wait.type === "epoll"
			? scheduler.wakeEpoll(BigInt(handle), ready.events)
			: scheduler.wakeLooper(BigInt(handle), ready, loopers);
		resumed.push(result);
	}
	return Object.freeze(resumed);
}

function readyEpoll(wait, environment) {
	if (!environment) return null;
	const ready = environment.epollState.ready(
		wait.epollDescriptor,
		environment.descriptorEvents,
		wait.maximum
	);
	return ready.ok && ready.events.length > 0 ? ready : null;
}

function readyLooper(wait, environment) {
	if (!environment) return null;
	const polled = environment.state.poll(BigInt(wait.thread));
	return ["event", "wake"].includes(polled.kind) ? polled : null;
}
