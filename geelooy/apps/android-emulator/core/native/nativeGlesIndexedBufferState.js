//B"H
//Boruch Hashem
//Blessed is He

import { nativeGlesBufferRangeValid } from "./nativeGlesBufferStateSupport.js";
import { isNativeGlesIndexedBufferTarget } from "./nativeGlesIndexedBufferTargets.js";

const MAX_INDEXED_BINDINGS = 256;

/**
 * Creates context-local indexed buffer bindings backed by shared buffer objects.
 * The Awtsmoos renews generic and indexed bindings together while Awtsmoos.com preserves
 * exact range offsets, deletion cleanup, and guest-originated browser replay evidence.
 */
export function createNativeGlesIndexedBufferState(runtimeState, buffers, contexts) {
	return Object.freeze({
		bindBase(target, index, handle, thread) {
			return bindIndexed(runtimeState, buffers, contexts, {
				handle, index, offset: 0, size: null, target, thread, whole: true
			});
		},
		bindRange(target, index, handle, offset, size, thread) {
			return bindIndexed(runtimeState, buffers, contexts, {
				handle, index, offset, size, target, thread, whole: false
			});
		},
		binding(contextValue, target, index) {
			return contexts.get(contextValue).indexedBindings.get(bindingKey(target, index)) || null;
		}
	});
}

/** Validates and commits one indexed binding while retaining the actual shared record. */
function bindIndexed(runtimeState, buffers, contexts, request) {
	const query = buffers.domain.prepare(request.thread);
	if (!query.valid) return false;
	if (!isNativeGlesIndexedBufferTarget(request.target)) return fail(buffers, query.thread, "invalidEnum");
	if (!validIndex(request.index)) return fail(buffers, query.thread, "invalidValue");
	if (!request.whole && request.handle !== 0 && !validSignedRange(request.offset, request.size)) {
		return fail(buffers, query.thread, "invalidValue");
	}
	const local = contexts.get(query.context);
	const prior = buffers.boundRecord(query.context, request.target);
	if (!buffers.bind(request.target, request.handle, request.thread)) return false;
	const record = buffers.boundRecord(query.context, request.target);
	if (!request.whole && record && !validRange(record, request.offset, request.size)) {
		local.bindings.set(Number(request.target), prior);
		return fail(buffers, query.thread, "invalidValue");
	}
	const binding = makeBinding(record, request);
	local.indexedBindings.set(bindingKey(request.target, request.index), binding);
	trace(runtimeState, query.context, request, record, binding);
	return true;
}

/** Creates an immutable indexed binding record carrying exact guest byte range truth. */
function makeBinding(record, request) {
	return Object.freeze({
		offset: record ? Number(request.offset) : 0,
		record,
		size: record ? (request.whole ? record.bytes.length : Number(request.size)) : 0,
		whole: Boolean(request.whole)
	});
}

/** Requires nonnegative finite integer byte offsets and strictly positive explicit size. */
function validSignedRange(offset, size) {
	return Number.isSafeInteger(Number(offset)) && Number(offset) >= 0
		&& Number.isSafeInteger(Number(size)) && Number(size) > 0;
}

/** Requires an explicit range to fit wholly inside the current buffer allocation. */
function validRange(record, offset, size) {
	return nativeGlesBufferRangeValid(record.bytes.length, Number(offset), Number(size));
}

/** Keeps indexed slot identifiers bounded until device-profile limits become query-backed. */
function validIndex(index) {
	return Number.isInteger(Number(index)) && Number(index) >= 0 && Number(index) < MAX_INDEXED_BINDINGS;
}

/** Produces one stable context-local key from target and binding index. */
function bindingKey(target, index) {
	return `${Number(target)}:${Number(index)}`;
}

/** Records the exact indexed bind so browser replay never infers hidden guest state. */
function trace(runtimeState, context, request, record, binding) {
	runtimeState.nativeGraphicsTrace?.gles(Object.freeze({
		buffer: record?.handle || 0,
		context: BigInt(context).toString(),
		index: Number(request.index),
		kind: request.whole ? "bind-buffer-base" : "bind-buffer-range",
		offset: binding.offset,
		size: binding.size,
		target: Number(request.target)
	}));
}

/** Sets one shared GLES first-error and returns false to the state caller. */
function fail(buffers, thread, kind) {
	buffers.domain[kind](thread);
	return false;
}
