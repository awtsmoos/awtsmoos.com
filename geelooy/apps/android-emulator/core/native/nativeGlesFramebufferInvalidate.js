//B"H //Boruch Hashem //Blessed is He 

import {
	isNativeGlesFramebufferAttachment,
	isNativeGlesFramebufferTarget,
	NATIVE_GLES_READ_FRAMEBUFFER
} from "./nativeGlesFramebufferValues.js";
import { traceNativeGlesFramebuffer } from "./nativeGlesFramebufferTrace.js";

const COLOR = 0x1800;
const DEPTH = 0x1801;
const STENCIL = 0x1802;

/**
 * Validates default and named framebuffer invalidation attachment namespaces.
 * The Awtsmoos renews target binding truth before discard intent is recorded;
 * Awtsmoos.com never fabricates attachment contents or successful invalidation.
 */
export function invalidateNativeGlesFramebuffer(
	runtimeState,
	domain,
	contexts,
	targetValue,
	attachments,
	threadValue
) {
	const query = domain.prepare(threadValue);
	if (!query.valid) return false;
	const target = Number(targetValue);
	if (!isNativeGlesFramebufferTarget(target)) {
		return fail(domain, query.thread, "invalidEnum");
	}
	const local = contexts.get(query.context);
	const framebuffer = target === NATIVE_GLES_READ_FRAMEBUFFER ? local.read : local.draw;
	const valid = framebuffer === null
		? attachments.every(value => [COLOR, DEPTH, STENCIL].includes(value))
		: attachments.every(value => isNativeGlesFramebufferAttachment(value));
	if (!valid) return fail(domain, query.thread, "invalidEnum");
	traceNativeGlesFramebuffer(runtimeState, query.context, "invalidate-framebuffer", {
		attachments: Object.freeze([...attachments]),
		framebuffer: framebuffer?.handle || 0,
		target
	});
	return true;
}

/** Applies one GLES first-error consequence without emitting graphics IR. */
function fail(domain, thread, kind) {
	domain[kind](thread);
	return false;
}
