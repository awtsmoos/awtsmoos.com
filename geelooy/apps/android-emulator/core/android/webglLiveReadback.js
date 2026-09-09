//B"H //Boruch Hashem //Blessed is He 

const TYPE_VIEWS = new Map([
	[0x1400, [Int8Array, 1]], [0x1401, [Uint8Array, 1]],
	[0x1402, [Int16Array, 2]], [0x1403, [Uint16Array, 2]],
	[0x1404, [Int32Array, 4]], [0x1405, [Uint32Array, 4]],
	[0x1406, [Float32Array, 4]], [0x140b, [Uint16Array, 2]],
	[0x8033, [Uint16Array, 2]], [0x8034, [Uint16Array, 2]],
	[0x8363, [Uint16Array, 2]], [0x8368, [Uint32Array, 4]],
	[0x84fa, [Uint32Array, 4]]
]);

/**
 * Performs one synchronous WebGL2 readback into a correctly typed host view.
 * Existing destination bytes seed the host buffer so PACK skips and row padding
 * remain untouched exactly as GLES requires rather than becoming synthetic zeroes.
 */
export function readWebGlLivePixels(gl, request) {
	const descriptor = TYPE_VIEWS.get(Number(request.type));
	if (!descriptor) return failed("unsupported-type", 0, []);
	const byteLength = Number(request.byteLength);
	if (!Number.isSafeInteger(byteLength) || byteLength < 0 || byteLength % descriptor[1]) {
		return failed("invalid-byte-length", 0, []);
	}
	const initial = normalizeInitialBytes(request.initialBytes, byteLength);
	if (!initial) return failed("initial-byte-length", 0, []);
	const priorErrors = drainErrors(gl);
	const buffer = new ArrayBuffer(byteLength);
	new Uint8Array(buffer).set(initial);
	const pixels = new descriptor[0](buffer);
	try {
		gl.readPixels(
			Number(request.x), Number(request.y),
			Number(request.width), Number(request.height),
			Number(request.format), Number(request.type), pixels
		);
	} catch (error) {
		return failed(error?.message || "read-pixels-threw", 0, priorErrors);
	}
	const error = readError(gl);
	if (error !== 0) return failed("webgl-error", error, priorErrors);
	return Object.freeze({
		bytes: Object.freeze(Array.from(new Uint8Array(buffer))),
		error: 0,
		priorErrors,
		success: true
	});
}

function normalizeInitialBytes(value, byteLength) {
	if (byteLength === 0) return new Uint8Array(0);
	if (!value || typeof value.length !== "number" || value.length !== byteLength) return null;
	return Uint8Array.from(value);
}

/** Drains bounded pre-existing backend errors so the next error has causal ownership. */
function drainErrors(gl) {
	if (typeof gl.getError !== "function") return Object.freeze([]);
	const errors = [];
	for (let index = 0; index < 32; index += 1) {
		const error = readError(gl);
		if (error === 0) break;
		errors.push(error);
	}
	return Object.freeze(errors);
}

function readError(gl) {
	return typeof gl.getError === "function" ? Number(gl.getError()) : 0;
}

function failed(reason, error, priorErrors) {
	return Object.freeze({ bytes: null, error, priorErrors, reason, success: false });
}
