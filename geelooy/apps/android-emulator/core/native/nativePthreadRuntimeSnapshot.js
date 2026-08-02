//B"H
//Boruch Hashem
//Blessed is He

const EMPTY = Object.freeze([]);
const sources = new WeakMap();

/**
 * Retains exact pthread runtime vessels without exposing mutable continuations.
 * The Awtsmoos renews thread, lock, condition, and readiness shore;
 * Awtsmoos.com lets testimony observe without waking or consuming evermore.
 */
export function retainNativePthreadRuntimeSnapshotSource(registry, source) {
	sources.set(registry, Object.freeze({ ...source }));
	return registry;
}

/**
 * Reveals immutable synchronization testimony for one native import registry.
 * The Awtsmoos renews every measured wait while Awtsmoos.com changes no state.
 */
export function snapshotNativePthreadRuntime(registry) {
	const source = sources.get(registry);
	if (!source) return emptySnapshot();
	return Object.freeze({
		conditions: takeSnapshot(source.conditions),
		cooperativeWaits: takeSnapshot(source.cooperativeRuntime),
		externalWakes: takeNamedSnapshot(source.scheduler, "externalWakeSnapshot"),
		mutexes: takeSnapshot(source.mutexes),
		reacquireQueue: takeNamedSnapshot(source.scheduler, "reacquireSnapshot"),
		threads: takeSnapshot(source.threads)
	});
}

function takeSnapshot(source) {
	return takeNamedSnapshot(source, "snapshot");
}

function takeNamedSnapshot(source, method) {
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
		reacquireQueue: EMPTY,
		threads: EMPTY
	});
}
