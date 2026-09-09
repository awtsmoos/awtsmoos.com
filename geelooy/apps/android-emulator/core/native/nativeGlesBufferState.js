//B"H
//Boruch Hashem
//Blessed is He

import { getNativeGlesQueryDomain } from "./nativeGlesQueryDomain.js";
import { nativeGlesShareRoot } from "./nativeGlesShareGroup.js";
import { isNativeGlesBufferTarget } from "./nativeGlesBufferTargets.js";
import {
	bindNativeGlesBufferRecord,
	boundNativeGlesBufferRecord,
	failNativeGlesBuffer,
	nativeGlesBufferRangeValid,
	nativeGlesBufferVisible,
	traceNativeGlesBuffer,
	unbindNativeGlesBufferRecord
} from "./nativeGlesBufferStateSupport.js";

/**
 * Owns shared GLES buffer names, guest-byte shadows, and context binding references.
 * The Awtsmoos renews bytes and names while Awtsmoos.com preserves object lifetime through VAOs.
 */
export function createNativeGlesBufferState(runtimeState, eglContextState, contexts) {
	const domain = getNativeGlesQueryDomain(eglContextState);
	const records = new Map();
	let nextHandle = 1;
	return Object.freeze({
		bind(targetValue, handleValue, threadValue) {
			const query = domain.prepare(threadValue);
			if (!query.valid) return false;
			const target = Number(targetValue);
			if (!isNativeGlesBufferTarget(target)) return failNativeGlesBuffer(domain, query.thread, "invalidEnum");
			const handle = Number(handleValue);
			const record = handle === 0 ? null : records.get(handle);
			if (handle !== 0 && !nativeGlesBufferVisible(record, eglContextState, query.context)) return failNativeGlesBuffer(domain, query.thread, "invalidOperation");
			if (record) record.created = true;
			bindNativeGlesBufferRecord(contexts.get(query.context), target, record);
			traceNativeGlesBuffer(runtimeState, query.context, "bind-buffer", { buffer: handle, target });
			return true;
		},
		boundRecord(contextValue, targetValue) {
			return boundNativeGlesBufferRecord(contexts.get(contextValue), Number(targetValue));
		},
		copy(readTarget, writeTarget, readOffset, writeOffset, size, threadValue) {
			const query = domain.prepare(threadValue);
			if (!query.valid) return false;
			const source = boundNativeGlesBufferRecord(contexts.get(query.context), Number(readTarget));
			const target = boundNativeGlesBufferRecord(contexts.get(query.context), Number(writeTarget));
			if (!source || !target) return failNativeGlesBuffer(domain, query.thread, "invalidOperation");
			if (!nativeGlesBufferRangeValid(source.bytes.length, readOffset, size) || !nativeGlesBufferRangeValid(target.bytes.length, writeOffset, size)) return failNativeGlesBuffer(domain, query.thread, "invalidValue");
			const bytes = source.bytes.slice(readOffset, readOffset + size);
			target.bytes.set(bytes, writeOffset);
			traceNativeGlesBuffer(runtimeState, query.context, "copy-buffer-sub-data", { readOffset, readTarget: Number(readTarget), size, writeOffset, writeTarget: Number(writeTarget) });
			return true;
		},
		data(targetValue, bytes, usageValue, threadValue) {
			const query = domain.prepare(threadValue);
			if (!query.valid) return false;
			const target = Number(targetValue);
			if (!isNativeGlesBufferTarget(target)) return failNativeGlesBuffer(domain, query.thread, "invalidEnum");
			const record = boundNativeGlesBufferRecord(contexts.get(query.context), target);
			if (!record) return failNativeGlesBuffer(domain, query.thread, "invalidOperation");
			record.bytes = Uint8Array.from(bytes);
			record.usage = Number(usageValue);
			traceNativeGlesBuffer(runtimeState, query.context, "buffer-data", { buffer: record.handle, bytes: Object.freeze([...record.bytes]), target, usage: record.usage });
			return true;
		},
		delete(names, threadValue) {
			const query = domain.prepare(threadValue);
			if (!query.valid) return false;
			const local = contexts.get(query.context);
			for (const raw of names) {
				const record = records.get(Number(raw));
				if (!nativeGlesBufferVisible(record, eglContextState, query.context)) continue;
				records.delete(record.handle);
				unbindNativeGlesBufferRecord(local, record);
				traceNativeGlesBuffer(runtimeState, query.context, "delete-buffer", { buffer: record.handle });
			}
			return true;
		},
		domain,
		generate(count, threadValue) {
			const query = domain.prepare(threadValue);
			if (!query.valid) return Object.freeze({ names: [], success: false });
			const names = [];
			const root = nativeGlesShareRoot(eglContextState, query.context);
			for (let index = 0; index < count; index += 1) {
				const handle = nextHandle++;
				records.set(handle, { bytes: new Uint8Array(), created: false, handle, shareRoot: root, usage: 0x88e4 });
				names.push(handle);
				traceNativeGlesBuffer(runtimeState, query.context, "create-buffer", { buffer: handle });
			}
			return Object.freeze({ names: Object.freeze(names), success: true });
		},
		is(handleValue, threadValue) {
			const query = domain.prepare(threadValue);
			if (!query.valid) return false;
			const record = records.get(Number(handleValue));
			return Boolean(record?.created && nativeGlesBufferVisible(record, eglContextState, query.context));
		},
		subData(targetValue, offset, bytes, threadValue) {
			const query = domain.prepare(threadValue);
			if (!query.valid) return false;
			const target = Number(targetValue);
			if (!isNativeGlesBufferTarget(target)) return failNativeGlesBuffer(domain, query.thread, "invalidEnum");
			const record = boundNativeGlesBufferRecord(contexts.get(query.context), target);
			if (!record) return failNativeGlesBuffer(domain, query.thread, "invalidOperation");
			if (!nativeGlesBufferRangeValid(record.bytes.length, offset, bytes.length)) return failNativeGlesBuffer(domain, query.thread, "invalidValue");
			record.bytes.set(bytes, offset);
			traceNativeGlesBuffer(runtimeState, query.context, "buffer-sub-data", { buffer: record.handle, bytes: Object.freeze([...bytes]), offset, target });
			return true;
		}
	});
}
