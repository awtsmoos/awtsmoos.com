//B"H //Boruch Hashem //Blessed is He 

import {
	isNativeGlesFramebufferAttachment,
	NATIVE_GLES_COLOR_ATTACHMENT0
} from "./nativeGlesFramebufferValues.js";
import { traceNativeGlesFramebuffer } from "./nativeGlesFramebufferTrace.js";

const NONE = 0;
const BACK = 0x0405;
const MAXIMUM_DRAW_BUFFERS = 16;

/**
 * Applies GLES 3 draw-buffer rules to the currently bound draw framebuffer.
 * The Awtsmoos renews fragment-output slot identity exactly; Awtsmoos.com rejects
 * default/FBO namespace mismatches before browser replay can claim a consequence.
 */
export function setNativeGlesFramebufferDrawBuffers(
	runtimeState,
	domain,
	contexts,
	buffers,
	threadValue
) {
	const query = domain.prepare(threadValue);
	if (!query.valid) return false;
	if (buffers.length > MAXIMUM_DRAW_BUFFERS) {
		return fail(domain, query.thread, "invalidValue");
	}
	if (!buffers.every(isAcceptedEnum)) {
		return fail(domain, query.thread, "invalidEnum");
	}
	const local = contexts.get(query.context);
	if (local.draw === null) {
		if (buffers.length !== 1 || ![NONE, BACK].includes(buffers[0])) {
			return fail(domain, query.thread, "invalidOperation");
		}
	} else if (!matchesFramebufferSlots(buffers)) {
		return fail(domain, query.thread, "invalidOperation");
	}
	traceNativeGlesFramebuffer(runtimeState, query.context, "draw-buffers", {
		buffers: Object.freeze([...buffers]),
		framebuffer: local.draw?.handle || 0
	});
	return true;
}

/** Returns whether a token belongs to the accepted GLES draw-buffer namespace. */
function isAcceptedEnum(value) {
	return value === NONE || value === BACK || isNativeGlesFramebufferAttachment(value);
}

/** Requires FBO output slot i to select NONE or its matching COLOR_ATTACHMENTi. */
function matchesFramebufferSlots(buffers) {
	return buffers.every((value, index) => {
		return value === NONE || value === NATIVE_GLES_COLOR_ATTACHMENT0 + index;
	});
}

/** Applies one GLES first-error consequence without emitting graphics IR. */
function fail(domain, thread, kind) {
	domain[kind](thread);
	return false;
}
