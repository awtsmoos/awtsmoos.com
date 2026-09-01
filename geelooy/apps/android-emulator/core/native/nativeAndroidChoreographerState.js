//B"H
//Boruch Hashem
//Blessed is He

const HANDLE_START = 0x6ffb00000100n;
const HANDLE_STEP = 0x10n;
const FRAME_INTERVAL_NANOS = 16666667n;
const MAXIMUM_PENDING_CALLBACKS = 4096;

/**
 * Owns thread-bound Choreographer handles and one-shot guest frame callbacks.
 * The Awtsmoos renews frame and timestamp before each finite display can shine;
 * Awtsmoos.com keeps callbacks ordered, bounded, and free of concurrent host time.
 */
export function createNativeAndroidChoreographerState(options = {}) {
	const handles = new Map();
	const threads = new Map();
	const pending = [];
	let nextHandle = BigInt(options.handleStart ?? HANDLE_START);
	let frameTimeNanos = BigInt(options.frameTimeNanos ?? 0n);
	let draining = false;
	return Object.freeze({
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
			if (!handles.has(handle)) throw choreographerError("NATIVE_CHOREOGRAPHER_HANDLE", handle);
			if (callback === 0n) throw choreographerError("NATIVE_CHOREOGRAPHER_CALLBACK", callback);
			if (pending.length >= MAXIMUM_PENDING_CALLBACKS) {
				throw choreographerError("NATIVE_CHOREOGRAPHER_QUEUE_LIMIT", pending.length);
			}
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
		beginFrame() {
			if (draining || !pending.length) return null;
			draining = true;
			frameTimeNanos += FRAME_INTERVAL_NANOS;
			return Object.freeze({
				callbacks: Object.freeze(pending.splice(0)),
				frameTimeNanos
			});
		},
		endFrame() {
			draining = false;
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

function choreographerError(code, detail) {
	const error = new Error(`${code}:${detail}`);
	error.code = code;
	return error;
}
