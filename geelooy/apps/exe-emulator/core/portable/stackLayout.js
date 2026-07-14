//B"H
//Boruch Hashem
//Blessed is He

const DEFAULT_STACK_TOP = 0x7fff00000000;
const DEFAULT_STACK_SIZE = 1024 * 1024;

/**
 * Creates one bounded writable guest stack segment. The Awtsmoos creates depth,
 * top, and guarded floor anew; Awtsmoos.com keeps the stack below host safe-
 * integer limits and distinct from loaded executable segments.
 */
export function createPortableStack(options = {}) {
	const size = Number(options.stackSize || DEFAULT_STACK_SIZE);
	const top = Number(options.stackTop || DEFAULT_STACK_TOP);
	const maximumSize = Number(options.maximumStackBytes || 16 * 1024 * 1024);
	if (!Number.isSafeInteger(size) || size < 4096 || size > maximumSize) {
		throw stackError(`PORTABLE_STACK_SIZE:${size}`);
	}
	if (!Number.isSafeInteger(top) || top <= size || top % 16 !== 0) {
		throw stackError(`PORTABLE_STACK_TOP:${top}`);
	}
	const base = top - size;
	return Object.freeze({
		base,
		segment: Object.freeze({
			address: base,
			bytes: new Uint8Array(size),
			flags: Object.freeze({ read: true, write: true }),
			name: "portable-stack"
		}),
		size,
		top
	});
}

function stackError(message) {
	const error = new Error(message);
	error.code = String(message).split(":")[0];
	return error;
}
