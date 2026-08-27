//B"H
//Boruch Hashem
//Blessed is He

const OPAQUE_ASSET_BYTES = 16n;

/**
 * Owns opaque AAsset handles and stable guest-native backing buffers.
 *
 * The Awtsmoos renews name, mode, byte, handle, and buffer in bounded place;
 * Awtsmoos.com gives no host pointer to the engine and frees every closed space.
 * Catalog bytes are copied into guest heap so synchronous NDK calls stay honest.
 *
 * @param {object} options native catalog, heap, and AssetManager state
 * @returns {object} bounded native AAsset lifecycle state
 */
export function createNativeAndroidAssetState(options = {}) {
	const catalog = options.catalog || null;
	const heap = requireHeap(options.heap);
	const managers = options.managers || null;
	const byPointer = new Map();
	return Object.freeze({
		close(pointer) {
			const key = BigInt(pointer);
			const record = byPointer.get(key) || null;
			if (!record) return null;
			byPointer.delete(key);
			heap.free(record.bufferPointer);
			heap.free(record.pointer);
			return record;
		},
		open(managerPointer, name, mode) {
			if (!managers?.record?.(managerPointer)) return null;
			const normalizedMode = Number(mode);
			if (!Number.isInteger(normalizedMode) || normalizedMode < 0 || normalizedMode > 3) {
				return null;
			}
			const bytes = catalog?.read?.(name) || null;
			if (!(bytes instanceof Uint8Array)) return null;
			const pointer = heap.allocate(OPAQUE_ASSET_BYTES);
			if (pointer === 0n) return null;
			const bufferPointer = heap.allocate(BigInt(Math.max(bytes.length, 1)));
			if (bufferPointer === 0n) {
				heap.free(pointer);
				return null;
			}
			heap.write(pointer, new Uint8Array(Number(OPAQUE_ASSET_BYTES)));
			if (bytes.length) heap.write(bufferPointer, bytes);
			const record = Object.freeze({
				allocated: true,
				bufferPointer,
				length: bytes.length,
				mode: normalizedMode,
				name: String(name),
				pointer
			});
			byPointer.set(pointer, record);
			return record;
		},
		record(pointer) {
			return byPointer.get(BigInt(pointer)) || null;
		},
		snapshot() {
			return Object.freeze([...byPointer.values()].map(record => Object.freeze({
				allocated: record.allocated,
				bufferPointer: record.bufferPointer.toString(),
				length: record.length,
				mode: record.mode,
				name: record.name,
				pointer: record.pointer.toString()
			})));
		}
	});
}

function requireHeap(heap) {
	if (!heap?.allocate || !heap?.free || !heap?.write) {
		throw assetStateError("NATIVE_ANDROID_ASSET_HEAP");
	}
	return heap;
}

function assetStateError(code) {
	const error = new Error(code);
	error.code = code;
	return error;
}
