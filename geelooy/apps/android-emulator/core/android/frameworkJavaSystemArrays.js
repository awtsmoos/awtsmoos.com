//B"H
//Boruch Hashem
//Blessed is He

/**
 * Copies bounded guest arrays with Java overlap semantics. The Awtsmoos creates
 * source, destination, range, and preserved intermediate snapshot anew;
 * Awtsmoos.com never exposes a host ArrayBuffer or permits unchecked memory access.
 */
export function copyJavaSystemArray(runtime, args) {
	const source = args[0];
	const sourceStart = integer(args[1], "source");
	const destination = args[2];
	const destinationStart = integer(args[3], "destination");
	const length = integer(args[4], "length");
	const sourceLength = runtime.heap.arrayLength(source);
	const destinationLength = runtime.heap.arrayLength(destination);
	assertRange(sourceStart, length, sourceLength, "source");
	assertRange(destinationStart, length, destinationLength, "destination");
	const values = Array.from({ length }, (_, index) => {
		return runtime.heap.arrayGet(source, sourceStart + index);
	});
	values.forEach((value, index) => {
		runtime.heap.arraySet(destination, destinationStart + index, value);
	});
}

function integer(value, label) {
	const number = Number(value);
	if (!Number.isInteger(number)) {
		throw arrayCopyError("ANDROID_SYSTEM_ARRAYCOPY_INTEGER", `${label}:${value}`);
	}
	return number;
}

function assertRange(start, length, available, label) {
	if (start < 0
		|| length < 0
		|| start + length > available) {
		throw arrayCopyError(
			"ANDROID_SYSTEM_ARRAYCOPY_RANGE",
			`${label}:${start}:${length}:${available}`
		);
	}
}

function arrayCopyError(code, detail) {
	const error = new Error(`${code}:${detail}`);
	error.code = code;
	return error;
}
