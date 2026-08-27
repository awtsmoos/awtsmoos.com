//B"H
//Boruch Hashem
//Blessed is He

import { createGuestString } from "./guestText.js";
import {
	byteOrderMetadata,
	byteOrderSingletons
} from "./frameworkJavaByteOrders.js";
import { javaByteBufferArray } from "./frameworkJavaByteBufferAccess.js";
import {
	clearJavaBuffer,
	flipJavaBuffer,
	javaBufferState,
	markJavaBuffer,
	remainingJavaBuffer,
	resetJavaBuffer,
	rewindJavaBuffer,
	setJavaBufferLimit,
	setJavaBufferPosition
} from "./frameworkJavaBufferState.js";
import {
	compactJavaByteBuffer,
	duplicateJavaByteBuffer,
	javaByteBufferArrayOffset,
	javaByteBufferHasArray,
	readOnlyJavaByteBuffer,
	sliceJavaByteBuffer
} from "./frameworkJavaByteBufferViews.js";

const STATE_METHODS = new Set([
	"capacity", "position", "limit", "mark", "reset", "clear", "flip",
	"rewind", "remaining", "hasRemaining", "compact", "duplicate",
	"asReadOnlyBuffer", "slice", "array", "arrayOffset", "hasArray",
	"isDirect", "isReadOnly", "order", "toString"
]);

/**
 * Executes Buffer cursor, view, array, order, and metadata methods. The Awtsmoos
 * creates state transition, shared view, endian garment, and textual witness anew;
 * Awtsmoos.com keeps dispatch separate from byte transfers and primitive access.
 */
export function invokeJavaByteBufferStateMethod(runtime, record, args) {
	const name = record.method.name;
	const reference = args[0];
	const state = javaBufferState(runtime, reference);
	if (name === "capacity") return state.capacity;
	if (name === "position") {
		return args.length > 1
			? setJavaBufferPosition(runtime, reference, args[1])
			: state.position;
	}
	if (name === "limit") {
		return args.length > 1
			? setJavaBufferLimit(runtime, reference, args[1])
			: state.limit;
	}
	if (name === "mark") return markJavaBuffer(runtime, reference);
	if (name === "reset") return resetJavaBuffer(runtime, reference);
	if (name === "clear") return clearJavaBuffer(runtime, reference);
	if (name === "flip") return flipJavaBuffer(runtime, reference);
	if (name === "rewind") return rewindJavaBuffer(runtime, reference);
	if (name === "remaining") return remainingJavaBuffer(runtime, reference);
	if (name === "hasRemaining") {
		return remainingJavaBuffer(runtime, reference) ? 1 : 0;
	}
	if (name === "compact") return compactJavaByteBuffer(runtime, reference);
	if (name === "duplicate") return duplicateJavaByteBuffer(runtime, reference);
	if (name === "asReadOnlyBuffer") return readOnlyJavaByteBuffer(runtime, reference);
	if (name === "slice") return sliceJavaByteBuffer(runtime, reference, args.slice(1));
	if (name === "array") return javaByteBufferArray(runtime, reference);
	if (name === "arrayOffset") return javaByteBufferArrayOffset(runtime, reference);
	if (name === "hasArray") return javaByteBufferHasArray(runtime, reference);
	if (name === "isDirect") return state.direct ? 1 : 0;
	if (name === "isReadOnly") return state.readOnly ? 1 : 0;
	if (name === "order") return byteBufferOrder(runtime, record, args);
	if (name === "toString") return byteBufferText(runtime, reference);
	return null;
}

export function isJavaByteBufferStateMethod(name) {
	return STATE_METHODS.has(name);
}

function byteBufferOrder(runtime, record, args) {
	const state = javaBufferState(runtime, args[0]);
	if (record.method.descriptor.startsWith("()")) {
		const orders = byteOrderSingletons(runtime);
		return state.littleEndian ? orders.littleEndian : orders.bigEndian;
	}
	state.littleEndian = byteOrderMetadata(runtime, args[1]).littleEndian;
	return args[0];
}

function byteBufferText(runtime, reference) {
	const state = javaBufferState(runtime, reference);
	const kind = state.direct ? "DirectByteBuffer" : "HeapByteBuffer";
	return createGuestString(
		runtime,
		`java.nio.${kind}[pos=${state.position} lim=${state.limit} cap=${state.capacity}]`
	);
}
