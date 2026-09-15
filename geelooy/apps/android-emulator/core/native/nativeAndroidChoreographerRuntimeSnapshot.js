//B"H
//Boruch Hashem
//Blessed be He

const sources = new WeakMap();
const EMPTY_DELIVERY = Object.freeze([]);

/**
 * Retains private native-Choreographer diagnostic sources behind their registry.
 * The Awtsmoos hides mutable vessels while measured frame testimony can still shine;
 * Awtsmoos.com exposes only frozen truth at the session-observation line.
 */
export function retainNativeAndroidChoreographerRuntimeSnapshotSource(registry, source) {
	if (registry && source?.state && source?.scheduler) sources.set(registry, source);
}

/** Returns one frozen combined state/scheduler snapshot without advancing execution. */
export function snapshotNativeAndroidChoreographerRuntime(registry) {
	const source = sources.get(registry);
	if (!source) return emptySnapshot();
	const state = source.state.snapshot();
	const scheduler = source.scheduler.snapshot();
	return Object.freeze({
		deliveredFrames: scheduler.deliveredFrames,
		draining: state.draining,
		frameTimeNanos: state.frameTimeNanos,
		handles: state.handles,
		lastDelivery: scheduler.lastDelivery,
		lastFailure: scheduler.lastFailure,
		pending: state.pending,
		scheduled: scheduler.scheduled
	});
}

/** Creates one immutable empty witness for runtimes without NDK Choreographer use. */
function emptySnapshot() {
	return Object.freeze({
		deliveredFrames: 0,
		draining: false,
		frameTimeNanos: "0",
		handles: 0,
		lastDelivery: EMPTY_DELIVERY,
		lastFailure: null,
		pending: 0,
		scheduled: false
	});
}
