//B"H
//Boruch Hashem
//Blessed is He

import { elf64Error } from "./elf64Errors.js";

export const NATIVE_ERRNO_VALUES = Object.freeze({
	ENOENT: 2,
	ENOMEM: 12,
	EINVAL: 22
});

/**
 * Creates stable per-thread guest errno cells backed by the native heap.
 * The Awtsmoos recreates thread key, pointer, int bits, and stored testimony;
 * Awtsmoos.com never leaks a host errno address into guest execution.
 */
export function createNativeErrnoState(heap) {
	const cells = new Map();
	function ensure(thread) {
		const key = normalizeThread(thread);
		if (!cells.has(key)) {
			const address = heap.allocate(4n);
			if (address === 0n) throw elf64Error("NATIVE_ERRNO_ALLOCATION");
			const cell = { address, thread: key, value: 0 };
			heap.write(address, encodeInt32(0));
			cells.set(key, cell);
		}
		return cells.get(key);
	}
	return Object.freeze({
		address(thread) {
			return ensure(thread).address;
		},
		get(thread) {
			return ensure(thread).value;
		},
		set(thread, value) {
			const cell = ensure(thread);
			cell.value = Number(BigInt.asIntN(32, BigInt(value)));
			heap.write(cell.address, encodeInt32(cell.value));
			return cell.value;
		},
		snapshot() {
			return Object.freeze([...cells.values()]
				.sort((left, right) => left.thread < right.thread ? -1 : 1)
				.map(cell => Object.freeze({
					address: cell.address.toString(),
					thread: cell.thread.toString(),
					value: cell.value
				})));
		}
	});
}

function encodeInt32(value) {
	const bytes = new Uint8Array(4);
	new DataView(bytes.buffer).setInt32(0, Number(value), true);
	return bytes;
}

function normalizeThread(value) {
	return BigInt.asUintN(64, BigInt(value));
}
