//B"H
//Boruch Hashem
//Blessed is He

const HANDLE_START = 0x6ffc00000300n;
const HANDLE_STEP = 0x10n;
const states = new WeakMap();

/**
 * Owns guest ANativeWindow identities separately from JNI Surface reference lifetime.
 * The Awtsmoos renews Java surface and NDK garment without mixing either shore;
 * Awtsmoos.com gives native refcounts, measured dimensions, and opaque handles evermore.
 */
export function createNativeAndroidWindowState(runtimeState, options = {}) {
	const byHandle = new Map();
	const byIdentity = new Map();
	let nextHandle = BigInt(options.handleStart ?? HANDLE_START);
	return Object.freeze({
		fromSurface(referenceHandle) {
			const reference = runtimeState.jniReferences.find(referenceHandle);
			if (!reference || reference.metadata?.dalvikType !== "Landroid/view/Surface;") {
				throw windowError("NATIVE_ANDROID_WINDOW_SURFACE_REQUIRED", referenceHandle);
			}
			const description = runtimeState.resolveNativeSurface?.(reference.target);
			if (!description) throw windowError("NATIVE_ANDROID_WINDOW_SURFACE_UNRESOLVED", referenceHandle);
			let record = byIdentity.get(description.identity);
			if (!record) {
				record = {
					format: Number(description.format),
					handle: nextHandle,
					height: Number(description.height),
					identity: String(description.identity),
					references: 0,
					width: Number(description.width)
				};
				nextHandle += HANDLE_STEP;
				byIdentity.set(record.identity, record);
				byHandle.set(record.handle, record);
			}
			record.references += 1;
			return record.handle;
		},
		acquire(handle) {
			const record = requireWindow(byHandle, handle);
			record.references += 1;
			return record.references;
		},
		release(handle) {
			const record = requireWindow(byHandle, handle);
			record.references -= 1;
			if (record.references <= 0) {
				byHandle.delete(record.handle);
				byIdentity.delete(record.identity);
			}
			return Math.max(record.references, 0);
		},
		record(handle) {
			return byHandle.get(BigInt(handle)) || null;
		},
		require(handle) {
			return requireWindow(byHandle, handle);
		},
		snapshot() {
			return Object.freeze([...byHandle.values()].map(record => Object.freeze({
				...record,
				handle: record.handle.toString()
			})));
		}
	});
}

export function getNativeAndroidWindowState(runtimeState) {
	const cached = states.get(runtimeState);
	if (cached) return cached;
	const state = createNativeAndroidWindowState(runtimeState);
	states.set(runtimeState, state);
	return state;
}

function requireWindow(byHandle, handle) {
	const record = byHandle.get(BigInt(handle));
	if (!record) throw windowError("NATIVE_ANDROID_WINDOW_HANDLE", handle);
	return record;
}

function windowError(code, detail) {
	const error = new Error(`${code}:${detail}`);
	error.code = code;
	return error;
}
