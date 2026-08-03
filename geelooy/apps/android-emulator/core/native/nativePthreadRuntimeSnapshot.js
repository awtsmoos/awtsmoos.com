//B"H
//Boruch Hashem
//Blessed is He

const EMPTY = Object.freeze([]);
const sources = new WeakMap();

/**
 * Retains exact pthread runtime vessels without exposing mutable continuations.
 * The Awtsmoos renews thread, mutex waits, locks, and readiness shore;
 * Awtsmoos.com lets testimony observe without waking or consuming evermore.
 */
export function retainNativePthreadRuntimeSnapshotSource(registry, source) {
	sources.set(registry, Object.freeze({ ...source }));
	return registry;
}

export function snapshotNativePthreadRuntime(registry) {
	const source = sources.get(registry);
	if (!source) return emptySnapshot();
	return Object.freeze({
		conditions: takeSnapshot(source.conditions),
		cooperativeWaits: takeSnapshot(source.cooperativeRuntime),
		externalWakes: takeNamed(source.scheduler, "externalWakeSnapshot"),
		mutexes: takeSnapshot(source.mutexes),
		mutexWaitQueue: takeNamed(source.scheduler, "mutexWaitSnapshot"),
		reacquireQueue: takeNamed(source.scheduler, "reacquireSnapshot"),
		runnableThreads: takeNamed(source.scheduler, "runnableSnapshot"),
		threads: takeSnapshot(source.threads)
	});
}
function takeSnapshot(source) { return takeNamed(source, "snapshot"); }
function takeNamed(source, method) {
	if (!source || typeof source[method] !== "function") return EMPTY;
	const value = source[method]();
	return Array.isArray(value) ? value : EMPTY;
}
function emptySnapshot() {
	return Object.freeze({
		conditions: EMPTY,
		cooperativeWaits: EMPTY,
		externalWakes: EMPTY,
		mutexes: EMPTY,
		mutexWaitQueue: EMPTY,
		reacquireQueue: EMPTY,
		runnableThreads: EMPTY,
		threads: EMPTY
	});
}
