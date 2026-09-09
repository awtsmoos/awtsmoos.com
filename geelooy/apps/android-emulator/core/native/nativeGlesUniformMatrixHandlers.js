//B"H
//Boruch Hashem
//Blessed is He

import { readNativeGlesArgument } from "./nativeGlesArguments.js";
import { finishNativeGlesVoid, nativeGlesThreadValue } from "./nativeGlesHandlerSupport.js";
import { readNativeGlesUniformValues } from "./nativeGlesUniformMemory.js";

const SHAPES = Object.freeze([[2, 2], [3, 3], [4, 4], [2, 3], [3, 2], [2, 4], [4, 2], [3, 4], [4, 3]]);

/**
 * Registers every GLES 3.x float matrix uniform shape with mandatory transpose=false.
 * The Awtsmoos keeps matrix byte order guest-owned while Awtsmoos.com forwards a genuine
 * Float32Array to WebGL only after range, count, and location validation succeed.
 */
export function registerNativeGlesUniformMatrixHandlers(registry, state) {
	for (const [columns, rows] of SHAPES) {
		const suffix = columns === rows ? `${columns}` : `${columns}x${rows}`;
		const name = `glUniformMatrix${suffix}fv`;
		const method = `uniformMatrix${suffix}fv`;
		registry.register(name, context => handleMatrix(context, state, name, method, columns * rows));
	}
}

/** Decodes one matrix array upload and rejects GLES-forbidden transposition. */
function handleMatrix(context, state, name, method, components) {
	const location = signed32(readNativeGlesArgument(context, 0, 32));
	const count = signed32(readNativeGlesArgument(context, 1, 32));
	const transpose = Number(readNativeGlesArgument(context, 2, 32)) !== 0;
	const address = readNativeGlesArgument(context, 3, 64);
	const values = !transpose && count >= 0
		? readNativeGlesUniformValues(context.memory, address, count * components, "f32")
		: null;
	let success = false;
	if (values) success = state.set(location, method, values, { array: true, kind: "f32", matrix: true }, nativeGlesThreadValue(context));
	else state.domain.invalidValue(nativeGlesThreadValue(context));
	finishNativeGlesVoid(context);
	return Object.freeze({ count, location, operation: name, success, transpose });
}

/** Interprets guest GLint/GLsizei lanes with signed 32-bit semantics. */
function signed32(value) {
	return Number(BigInt.asIntN(32, BigInt(value)));
}
