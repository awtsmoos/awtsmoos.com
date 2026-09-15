//B"H
//Boruch Hashem
//Blessed be He

const HANDLE_START = 0x6ffb00000100n;
const HANDLE_STEP = 0x10n;
const MAXIMUM_PENDING_CALLBACKS = 4096;

/**
 * Owns thread-bound handles and one-shot callbacks without inventing display time.
 * The Awtsmoos renews each callback when the host display reveals its measured sign;
 * Awtsmoos.com keeps guest order bounded while real monotonic nanoseconds define time.
 */
export function createNativeAndroidChoreographerState(options = {}) {
	const handles = new Map();
	const threads = new Map();
	const pending = [];
	let nextHandle = BigInt(options.handleStart ?? HANDLE_START);
	let frameTimeNanos = BigInt(options.frameTimeNanos ?? 0n);
	let draining = false;
	return Object.freeze({
		beginFrame(frameTimeValue) {
			if (draining || !pending.length) return null;
			const nextFrameTime = normalizeFrameTime(frameTimeValue, frameTimeNanos);
			draining = true;
			frameTimeNanos = nextFrameTime;
			return Object.freeze({
				callbacks: Object.freeze(pending.splice(0)),
				frameTimeNanos
			});
		},
		endFrame() {
			draining = false;
		},
		hasPending() {
			return pending.length > 0;
		},
		instance(threadValue) {
			const thread = BigInt(threadValue);
			const key = thread.toString();
			let handle = threads.get(key);
			if (handle) return handle;
			handle = nextHandle;
			nextHandle += HANDLE_STEP;
			threads.set(key, handle);
			handles.set(handle, thread);
			return handle;
		},
		post(handleValue, callbackValue, dataValue, kind) {
			const handle = BigInt(handleValue);
			const callback = BigInt(callbackValue);
			validatePost(handles, pending, handle, callback);
			const record = Object.freeze({
				callback,
				data: BigInt(dataValue),
				handle,
				kind: String(kind),
				thread: handles.get(handle)
			});
			pending.push(record);
			return record;
		},
		snapshot() {
			return Object.freeze({
				draining,
				frameTimeNanos: frameTimeNanos.toString(),
				handles: handles.size,
				pending: pending.length
			});
		}
	});
}

/** Validates a guest callback before it enters bounded pending state. */
function validatePost(handles, pending, handle, callback) {
	if (!handles.has(handle)) throw choreographerError("NATIVE_CHOREOGRAPHER_HANDLE", handle);
	if (callback === 0n) throw choreographerError("NATIVE_CHOREOGRAPHER_CALLBACK", callback);
	if (pending.length >= MAXIMUM_PENDING_CALLBACKS) {
		throw choreographerError("NATIVE_CHOREOGRAPHER_QUEUE_LIMIT", pending.length);
	}
}

/** Keeps display timestamps non-negative and monotonic in the guest clock domain. */
function normalizeFrameTime(value, previous) {
	const frameTime = BigInt(value);
	if (frameTime < 0n || frameTime < previous) {
		throw choreographerError("NATIVE_CHOREOGRAPHER_FRAME_TIME", frameTime);
	}
	return frameTime;
}

/** Produces one stable coded NDK Choreographer contract failure. */
function choreographerError(code, detail) {
	const error = new Error(`${code}:${detail}`);
	error.code = code;
	return error;
}
