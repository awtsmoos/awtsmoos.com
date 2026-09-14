//B"H //Boruch Hashem //Blessed is He 

import { getNativeGlesQueryDomain } from "./nativeGlesQueryDomain.js";
import { prepareNativeGlesReadbackLayout } from "./nativeGlesReadbackLayout.js";
import { getNativeGlesTextureState } from "./nativeGlesTextureState.js";

const STATES = new WeakMap();

/**
 * Joins current EGL context, PACK state, live WebGL2, and guest memory for readback.
 * The Awtsmoos renews pixels only from bytes synchronously returned by the real GPU;
 * Awtsmoos.com preserves all client-memory bytes that GLES itself leaves untouched.
 */
export function getNativeGlesReadbackState(runtimeState, eglContextState) {
	if (STATES.has(runtimeState)) return STATES.get(runtimeState);
	const domain = getNativeGlesQueryDomain(eglContextState);
	const textures = getNativeGlesTextureState(runtimeState, eglContextState);
	const state = Object.freeze({
		domain,
		read(request, memory, threadValue) {
			const query = domain.prepare(threadValue);
			if (!query.valid) return outcome(false, query.context, 0, "no-current-context");
			const layout = prepareNativeGlesReadbackLayout(
				request.width, request.height, request.format, request.type,
				textures.layout(query.thread)
			);
			if (!layout.success) {
				domain[layout.errorKind](query.thread);
				return outcome(false, query.context, 0, layout.reason);
			}
			const readPixels = runtimeState.nativeGraphicsTrace?.readPixels;
			if (typeof readPixels !== "function") {
				domain.invalidOperation(query.thread);
				return outcome(false, query.context, 0, "live-webgl-unavailable");
			}
			if (layout.byteLength > 0 && BigInt(request.pixels) === 0n) {
				domain.invalidOperation(query.thread);
				return outcome(false, query.context, 0, "null-client-pointer");
			}
			const initialBytes = layout.byteLength > 0
				? Array.from(memory.read(BigInt(request.pixels), layout.byteLength))
				: [];
			const result = readPixels(Object.freeze({
				...request,
				byteLength: layout.byteLength,
				initialBytes: Object.freeze(initialBytes)
			}));
			if (!result?.success) return failBackend(domain, query.thread, query.context, result);
			if (!Array.isArray(result.bytes) || result.bytes.length !== layout.byteLength) {
				domain.invalidOperation(query.thread);
				return outcome(false, query.context, 0, "readback-length-mismatch");
			}
			if (layout.byteLength > 0) memory.write(BigInt(request.pixels), Uint8Array.from(result.bytes));
			return outcome(true, query.context, layout.byteLength, null);
		}
	});
	STATES.set(runtimeState, state);
	return state;
}

function failBackend(domain, thread, context, result) {
	if (result?.error) domain.setError(thread, result.error);
	else domain.invalidOperation(thread);
	return outcome(false, context, 0, result?.reason || "readback-failed");
}

function outcome(success, context, byteLength, reason) {
	return Object.freeze({ byteLength, context, reason, success });
}
