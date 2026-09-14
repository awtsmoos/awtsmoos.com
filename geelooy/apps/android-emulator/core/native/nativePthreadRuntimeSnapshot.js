//B"H
//Boruch Hashem
//Blessed be He

const EMPTY = Object.freeze([]);
const sources = new WeakMap();

/**
 * Retains exact pthread and platform-loop vessels without mutable continuations.
 *
 * Snapshot readers can inspect scheduling, waits, mutexes, and root-platform
 * callback progress without consuming descriptor readiness or waking guest code.
 *
 * @param {object} registry Native import registry whose identity owns the source.
 * @param {object} source Runtime vessels exposed only through snapshot methods.
 * @returns {object} The unchanged registry for fluent registration composition.
 */
export function retainNativePthreadRuntimeSnapshotSource(registry, source) {
	sources.set(registry, Object.freeze({ ...source }));
	return registry;
}

/** Returns one serializable pthread/platform-liveness snapshot for diagnostics. */
export function snapshotNativePthreadRuntime(registry) {
	const source = sources.get(registry);
	if (!source) {
		return emptySnapshot();
	}
	return Object.freeze({
		conditions: takeSnapshot(source.conditions),
		cooperativeWaits: takeSnapshot(source.cooperativeRuntime),
		externalWakes: takeNamed(source.scheduler, "externalWakeSnapshot"),
		mutexes: takeSnapshot(source.mutexes),
		mutexWaitQueue: takeNamed(source.scheduler, "mutexWaitSnapshot"),
		platformLooper: takeObject(source.cooperativeRuntime, "platformLooperSnapshot"),
		reacquireQueue: takeNamed(source.scheduler, "reacquireSnapshot"),
		runnableThreads: takeNamed(source.scheduler, "runnableSnapshot"),
		threads: takeSnapshot(source.threads)
	});
}

/** Reads a conventional array snapshot without exposing missing-source branches. */
function takeSnapshot(source) {
	return takeNamed(source, "snapshot");
}

/** Reads a named array-valued diagnostic method or returns one shared empty list. */
function takeNamed(source, method) {
	if (!source || typeof source[method] !== "function") {
		return EMPTY;
	}
	const value = source[method]();
	return Array.isArray(value) ? value : EMPTY;
}

/** Reads a named object-valued diagnostic method while preserving explicit null. */
function takeObject(source, method) {
	if (!source || typeof source[method] !== "function") {
		return null;
	}
	return source[method]() || null;
}

/** Returns a stable schema when no runtime source exists for the registry. */
function emptySnapshot() {
	return Object.freeze({
		conditions: EMPTY,
		cooperativeWaits: EMPTY,
		externalWakes: EMPTY,
		mutexes: EMPTY,
		mutexWaitQueue: EMPTY,
		platformLooper: null,
		reacquireQueue: EMPTY,
		runnableThreads: EMPTY,
		threads: EMPTY
	});
}
