//B"H
//Boruch Hashem
//Blessed be He

const EMPTY = Object.freeze([]);

/**
 * Coordinates descriptor readiness across child pthreads and the root platform loop.
 *
 * Child epoll/ALooper waits resume through the pthread scheduler. Flutter's original
 * JNI platform thread is not a `pthread_create` child, so callback-bearing ALooper
 * readiness is delegated to a separately bound platform pump after the same measured
 * descriptor notification. The pump owns reentrancy protection for nested guest I/O.
 *
 * @returns {object} Frozen binding, notification, tracking, and diagnostic API.
 */
export function createNativeCooperativeRuntime() {
	let descriptorEnvironment = null;
	let looperEnvironment = null;
	let platformLooperPump = null;
	let scheduler = null;
	const waits = new Map();
	return Object.freeze({
		bindDescriptors(environment) {
			descriptorEnvironment = environment;
		},
		bindLoopers(environment) {
			looperEnvironment = environment;
		},
		bindPlatformLooperPump(candidate) {
			platformLooperPump = candidate || null;
		},
		bindScheduler(candidate) {
			scheduler = candidate;
		},
		notifyDescriptors() {
			const resumed = notifyReadyWaiters(
				waits,
				descriptorEnvironment,
				looperEnvironment,
				scheduler
			);
			platformLooperPump?.drain?.();
			return resumed;
		},
		platformLooperSnapshot() {
			return platformLooperPump?.snapshot?.() || null;
		},
		snapshot() {
			return Object.freeze([...waits.entries()].map(([handle, wait]) => {
				return Object.freeze({
					handle,
					wait
				});
			}));
		},
		track(handle, suspension) {
			if (!suspension || !["epoll", "looper"].includes(suspension.type)) {
				return false;
			}
			waits.set(BigInt(handle).toString(), Object.freeze({ ...suspension }));
			return true;
		},
		untrack(handle) {
			return waits.delete(BigInt(handle).toString());
		}
	});
}

/** Resumes only child-thread waits whose current descriptor truth is ready. */
function notifyReadyWaiters(waits, descriptors, loopers, scheduler) {
	if (!scheduler) {
		return EMPTY;
	}
	const resumed = [];
	for (const [handle, wait] of [...waits.entries()]) {
		const ready = wait.type === "epoll"
			? readyEpoll(wait, descriptors)
			: readyLooper(wait, loopers);
		if (!ready) {
			continue;
		}
		waits.delete(handle);
		const result = wait.type === "epoll"
			? scheduler.wakeEpoll(BigInt(handle), ready.events)
			: scheduler.wakeLooper(BigInt(handle), ready, loopers);
		resumed.push(result);
	}
	return Object.freeze(resumed);
}

/** Returns non-consuming epoll readiness for one tracked child wait. */
function readyEpoll(wait, environment) {
	if (!environment) {
		return null;
	}
	const ready = environment.epollState.ready(
		wait.epollDescriptor,
		environment.descriptorEvents,
		wait.maximum
	);
	return ready.ok && ready.events.length > 0 ? ready : null;
}

/** Polls one tracked child looper using its ordinary guest-visible semantics. */
function readyLooper(wait, environment) {
	if (!environment) {
		return null;
	}
	const polled = environment.state.poll(BigInt(wait.thread));
	return ["event", "wake"].includes(polled.kind) ? polled : null;
}
