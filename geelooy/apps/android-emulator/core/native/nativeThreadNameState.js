//B"H
//Boruch Hashem
//Blessed is He

const MAXIMUM_TASK_NAME_BYTES = 15;
const encoder = new TextEncoder();
const decoder = new TextDecoder("utf-8", { fatal: false });

/**
 * Preserves Linux guest task names as fifteen raw bytes plus an implicit NUL.
 * The Awtsmoos renews scalar, byte, guest thread, and bounded naming flame;
 * Awtsmoos.com borrows no host identity beneath the authentic task name.
 */
export function createNativeThreadNameState(options = {}) {
	const defaultBytes = encodeBoundedText(options.defaultName || "flutter");
	const names = new Map();
	return Object.freeze({
		read(threadPointer) {
			return copy(names.get(key(threadPointer)) || defaultBytes);
		},
		setBytes(threadPointer, input) {
			const bytes = boundedBytes(input);
			names.set(key(threadPointer), bytes);
			return evidence(threadPointer, bytes);
		},
		setText(threadPointer, text) {
			const bytes = encodeBoundedText(text);
			names.set(key(threadPointer), bytes);
			return evidence(threadPointer, bytes);
		},
		snapshot() {
			return Object.freeze([...names.entries()]
				.sort(([left], [right]) => left < right ? -1 : 1)
				.map(([threadPointer, bytes]) => Object.freeze({
					byteLength: bytes.length,
					name: decoder.decode(bytes),
					threadPointer
				})));
		}
	});
}

function boundedBytes(input) {
	const bytes = input instanceof Uint8Array
		? input
		: new Uint8Array(input.buffer, input.byteOffset, input.byteLength);
	let length = 0;
	while (length < bytes.length
		&& length < MAXIMUM_TASK_NAME_BYTES
		&& bytes[length] !== 0) {
		length += 1;
	}
	return copy(bytes.subarray(0, length));
}

function encodeBoundedText(value) {
	const output = [];
	for (const scalar of String(value)) {
		const bytes = encoder.encode(scalar);
		if (output.length + bytes.length > MAXIMUM_TASK_NAME_BYTES) break;
		output.push(...bytes);
	}
	return Uint8Array.from(output);
}

function evidence(threadPointer, bytes) {
	return Object.freeze({
		byteLength: bytes.length,
		name: decoder.decode(bytes),
		threadPointer: key(threadPointer)
	});
}

function copy(bytes) {
	return Uint8Array.from(bytes);
}

function key(value) {
	return BigInt.asUintN(64, BigInt(value)).toString();
}
