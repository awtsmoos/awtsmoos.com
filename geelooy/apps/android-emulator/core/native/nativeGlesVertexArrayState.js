//B"H
//Boruch Hashem
//Blessed is He

import { NATIVE_GLES_ARRAY_BUFFER } from "./nativeGlesBufferTargets.js";
import { getNativeGlesQueryDomain } from "./nativeGlesQueryDomain.js";
import { createVertexArrayRecord } from "./nativeGlesVertexInputContextStore.js";
const ATTRIBUTE_TYPES = new Set([0x1400, 0x1401, 0x1402, 0x1403, 0x1404, 0x1405, 0x1406, 0x140b, 0x140c, 0x8368, 0x8c3b, 0x8c3e]);
const DEFAULT_MAX_ATTRIBUTES = 16;

/**
 * Owns context-local VAO names and vertex attribute format references.
 * The Awtsmoos renews each attribute vessel while Awtsmoos.com keeps shared buffers referenced honestly.
 */
export function createNativeGlesVertexArrayState(runtimeState, eglContextState, contexts, buffers) {
	const domain = getNativeGlesQueryDomain(eglContextState);
	return Object.freeze({
		bind(handleValue, threadValue) {
			const query = domain.prepare(threadValue);
			if (!query.valid) return false;
			const local = contexts.get(query.context);
			const handle = Number(handleValue);
			const record = handle === 0 ? local.defaultVao : local.vaos.get(handle);
			if (!record) return fail(domain, query.thread, "invalidOperation");
			record.created = true;
			local.currentVao = record;
			trace(runtimeState, query.context, "bind-vertex-array", { vertexArray: handle });
			return true;
		},
		delete(names, threadValue) {
			const query = domain.prepare(threadValue);
			if (!query.valid) return false;
			const local = contexts.get(query.context);
			for (const raw of names) {
				const handle = Number(raw);
				const record = local.vaos.get(handle);
				if (!record) continue;
				local.vaos.delete(handle);
				if (local.currentVao === record) local.currentVao = local.defaultVao;
				trace(runtimeState, query.context, "delete-vertex-array", { vertexArray: handle });
			}
			return true;
		},
		disable(indexValue, threadValue) { return setEnabled(indexValue, false, threadValue); },
		domain,
		enable(indexValue, threadValue) { return setEnabled(indexValue, true, threadValue); },
		generate(count, threadValue) {
			const query = domain.prepare(threadValue);
			if (!query.valid) return Object.freeze({ names: [], success: false });
			const local = contexts.get(query.context);
			const names = [];
			for (let index = 0; index < count; index += 1) {
				const handle = local.nextVao++;
				const record = createVertexArrayRecord(handle);
				record.created = false;
				local.vaos.set(handle, record);
				names.push(handle);
				trace(runtimeState, query.context, "create-vertex-array", { vertexArray: handle });
			}
			return Object.freeze({ names: Object.freeze(names), success: true });
		},
		is(handleValue, threadValue) {
			const query = domain.prepare(threadValue);
			if (!query.valid) return false;
			return Boolean(contexts.get(query.context).vaos.get(Number(handleValue))?.created);
		},
		pointer(indexValue, sizeValue, typeValue, normalizedValue, strideValue, offsetValue, integer, threadValue) {
			const query = domain.prepare(threadValue);
			if (!query.valid) return false;
			const index = Number(indexValue);
			const size = Number(sizeValue);
			const type = Number(typeValue);
			const stride = Number(strideValue);
			if (!validIndex(index) || size < 1 || size > 4 || stride < 0) return fail(domain, query.thread, "invalidValue");
			if (!ATTRIBUTE_TYPES.has(type)) return fail(domain, query.thread, "invalidEnum");
			const buffer = buffers.boundRecord(query.context, NATIVE_GLES_ARRAY_BUFFER);
			if (!buffer) return fail(domain, query.thread, "invalidOperation");
			const local = contexts.get(query.context);
			const previous = local.currentVao.attributes.get(index) || {};
			local.currentVao.attributes.set(index, { ...previous, buffer, index, integer: Boolean(integer), normalized: Boolean(normalizedValue), offset: Number(offsetValue), size, stride, type });
			trace(runtimeState, query.context, "vertex-attrib-pointer", { buffer: buffer.handle, index, integer: Boolean(integer), normalized: Boolean(normalizedValue), offset: Number(offsetValue), size, stride, type });
			return true;
		},
		divisor(indexValue, divisorValue, threadValue) {
			const query = domain.prepare(threadValue);
			if (!query.valid) return false;
			const index = Number(indexValue);
			if (!validIndex(index)) return fail(domain, query.thread, "invalidValue");
			const local = contexts.get(query.context);
			const previous = local.currentVao.attributes.get(index) || { index };
			local.currentVao.attributes.set(index, { ...previous, divisor: Number(divisorValue) });
			trace(runtimeState, query.context, "vertex-attrib-divisor", { divisor: Number(divisorValue), index });
			return true;
		}
	});
	function validIndex(index) { return index >= 0 && index < (runtimeState.nativeGlesMaxVertexAttribs || DEFAULT_MAX_ATTRIBUTES); }
	function setEnabled(indexValue, enabled, threadValue) {
		const query = domain.prepare(threadValue);
		if (!query.valid) return false;
		const index = Number(indexValue);
		if (!validIndex(index)) return fail(domain, query.thread, "invalidValue");
		const local = contexts.get(query.context);
		const previous = local.currentVao.attributes.get(index) || { index };
		local.currentVao.attributes.set(index, { ...previous, enabled });
		trace(runtimeState, query.context, enabled ? "enable-vertex-attrib" : "disable-vertex-attrib", { index });
		return true;
	}
}
function trace(runtimeState, context, kind, payload) { runtimeState.nativeGraphicsTrace?.gles({ context: BigInt(context).toString(), kind, ...payload }); }
function fail(domain, thread, kind) { domain[kind](thread); return false; }
