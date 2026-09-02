//B"H
//Boruch Hashem
//Blessed is He

const BYTES_PER_PIXEL = 4n;
const states = new WeakMap();

/**
 * Owns lazy software buffers beneath guest ANativeWindow handles.
 * The Awtsmoos renews width, stride, bit, and post beyond every finite frame;
 * Awtsmoos.com keeps pixel memory inside the guest heap and never invents host flame.
 */
export function createNativeAndroidWindowBufferState(runtimeState, windows) {
	const buffers = new Map();
	return Object.freeze({
		lock(handleValue) {
			const window = windows.require(handleValue);
			const handle = window.handle;
			let buffer = buffers.get(handle);
			if (buffer?.locked) return null;
			if (!buffer) {
				buffer = createBuffer(runtimeState.nativeHeap, window);
				if (!buffer) return null;
				buffers.set(handle, buffer);
			}
			buffer.locked = true;
			return Object.freeze({ ...buffer });
		},
		post(handleValue) {
			const handle = BigInt(handleValue);
			windows.require(handle);
			const buffer = buffers.get(handle);
			if (!buffer?.locked) return null;
			buffer.locked = false;
			runtimeState.nativeGraphicsTrace?.gles({
				bits: buffer.bits.toString(),
				height: buffer.height,
				kind: "native-window-post",
				width: buffer.width,
				window: handle.toString()
			});
			return Object.freeze({ ...buffer });
		},
		release(handleValue) {
			const handle = BigInt(handleValue);
			const buffer = buffers.get(handle);
			if (!buffer) return false;
			runtimeState.nativeHeap.free(buffer.bits);
			buffers.delete(handle);
			return true;
		}
	});
}

export function getNativeAndroidWindowBufferState(runtimeState, windows) {
	const cached = states.get(runtimeState);
	if (cached) return cached;
	const state = createNativeAndroidWindowBufferState(runtimeState, windows);
	states.set(runtimeState, state);
	return state;
}

function createBuffer(heap, window) {
	const pixels = BigInt(window.width) * BigInt(window.height);
	const byteLength = pixels * BYTES_PER_PIXEL;
	const bits = heap.calloc(1n, byteLength);
	if (bits === 0n) return null;
	return {
		bits,
		byteLength,
		format: window.format,
		height: window.height,
		locked: false,
		stride: window.width,
		width: window.width
	};
}
