//B"H
//Boruch Hashem
//Blessed be He

const FALLBACK_FRAME_MILLISECONDS = 16;

/**
 * Schedules authentic pending NDK Choreographer callbacks on a future display turn.
 * The Awtsmoos renews each frame when its appointed instant starts to gleam;
 * Awtsmoos.com keeps guest work serialized, then rechecks truth beyond the lease stream.
 */
export function createNativeAndroidChoreographerScheduler(options) {
	const requestFrame = options.requestFrame || defaultRequestFrame;
	let deliveredFrames = 0;
	let lastDelivery = Object.freeze([]);
	let lastFailure = null;
	let scheduled = false;

	function schedule() {
		if (scheduled || !options.hasPending()) return false;
		scheduled = true;
		requestFrame(deliver);
		return true;
	}

	async function deliver(frameMilliseconds) {
		scheduled = false;
		const lease = options.rootExecution;
		if (lease?.active?.()) {
			schedule();
			return;
		}
		lease?.enter?.();
		try {
			const delivery = await options.drain(frameTimeNanoseconds(frameMilliseconds));
			lastDelivery = freezeDelivery(delivery);
			lastFailure = null;
			deliveredFrames += 1;
		} catch (error) {
			lastFailure = String(error?.message || error);
			options.onFailure?.(error);
		} finally {
			lease?.leave?.();
		}
		options.afterDelivery?.();
		if (options.hasPending()) schedule();
	}

	return Object.freeze({
		schedule,
		snapshot() {
			return Object.freeze({ deliveredFrames, lastDelivery, lastFailure, scheduled });
		}
	});
}

/** Converts the browser monotonic display timestamp from milliseconds to nanoseconds. */
function frameTimeNanoseconds(frameMilliseconds) {
	const milliseconds = Number(frameMilliseconds);
	if (!Number.isFinite(milliseconds) || milliseconds < 0) {
		throw new RangeError(`NATIVE_ANDROID_CHOREOGRAPHER_FRAME_TIME:${frameMilliseconds}`);
	}
	return BigInt(Math.round(milliseconds * 1_000_000));
}

/** Freezes bounded delivery testimony without retaining mutable callback machinery. */
function freezeDelivery(delivery) {
	if (!Array.isArray(delivery)) return Object.freeze([]);
	return Object.freeze([...delivery]);
}

/** Uses real browser vsync when available, with a Node/test timer fallback. */
function defaultRequestFrame(callback) {
	if (typeof globalThis.requestAnimationFrame === "function") {
		globalThis.requestAnimationFrame(callback);
		return;
	}
	globalThis.setTimeout(() => callback(globalThis.performance.now()), FALLBACK_FRAME_MILLISECONDS);
}
