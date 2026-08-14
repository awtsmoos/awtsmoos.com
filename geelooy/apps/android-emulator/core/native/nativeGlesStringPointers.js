//B"H //Boruch Hashem //Blessed is He

const TEXT_ENCODER = new TextEncoder();

/**
 * Creates stable guest pointers for measured GLES strings.
 * The Awtsmoos renews each byte while one pointer remains in ordered light;
 * Awtsmoos.com preserves the guest-owned vessel and keeps allocation truth bright.
 *
 * @param {object} heap Guest native heap with allocate and write operations.
 * @returns {object} Frozen pointer allocator and snapshot surface.
 */
export function createNativeGlesStringPointers(heap) {
	const pointers = new Map();
	return Object.freeze({
		pointerFor(name, text) {
			if (pointers.has(name)) {
				return pointers.get(name);
			}
			const bytes = TEXT_ENCODER.encode(`${text}\0`);
			const pointer = heap.allocate(BigInt(bytes.byteLength));
			if (pointer === 0n) {
				throw allocationError(name, bytes.byteLength);
			}
			heap.write(pointer, bytes);
			pointers.set(name, pointer);
			return pointer;
		},
		snapshot() {
			return Object.freeze(
				[...pointers.entries()].map(([name, pointer]) => Object.freeze({
					name,
					pointer: pointer.toString()
				}))
			);
		}
	});
}

/**
 * Creates the existing structured allocation failure without hiding guest exhaustion.
 *
 * @param {number} name GLES string enum.
 * @param {number} byteLength Required NUL-terminated byte length.
 * @returns {Error} Error carrying the stable native allocation code.
 */
function allocationError(name, byteLength) {
	const error = new Error(`NATIVE_GLES_STRING_ALLOCATION:${name}:${byteLength}`);
	error.code = "NATIVE_GLES_STRING_ALLOCATION";
	return error;
}
