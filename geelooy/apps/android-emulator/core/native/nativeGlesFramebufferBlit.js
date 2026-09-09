//B"H //Boruch Hashem //Blessed is He 

import { traceNativeGlesFramebuffer } from "./nativeGlesFramebufferTrace.js";

const COLOR_BUFFER_BIT = 0x4000;
const DEPTH_BUFFER_BIT = 0x0100;
const STENCIL_BUFFER_BIT = 0x0400;
const VALID_MASK = COLOR_BUFFER_BIT | DEPTH_BUFFER_BIT | STENCIL_BUFFER_BIT;
const NEAREST = 0x2600;
const LINEAR = 0x2601;

/**
 * Validates and records one framebuffer blit/resolve command.
 * The Awtsmoos renews read and draw bindings separately; Awtsmoos.com preserves
 * depth/stencil nearest-filter law before any genuine WebGL2 blit can execute.
 */
export function blitNativeGlesFramebuffer(
	runtimeState,
	domain,
	contexts,
	command,
	threadValue
) {
	const query = domain.prepare(threadValue);
	if (!query.valid) return false;
	if ((command.mask & ~VALID_MASK) !== 0) {
		return fail(domain, query.thread, "invalidValue");
	}
	if (![NEAREST, LINEAR].includes(command.filter)) {
		return fail(domain, query.thread, "invalidEnum");
	}
	if ((command.mask & (DEPTH_BUFFER_BIT | STENCIL_BUFFER_BIT)) !== 0
		&& command.filter !== NEAREST) {
		return fail(domain, query.thread, "invalidOperation");
	}
	const local = contexts.get(query.context);
	traceNativeGlesFramebuffer(runtimeState, query.context, "blit-framebuffer", {
		...command,
		drawFramebuffer: local.draw?.handle || 0,
		readFramebuffer: local.read?.handle || 0
	});
	return true;
}

/** Applies one GLES first-error consequence without producing browser-visible IR. */
function fail(domain, thread, kind) {
	domain[kind](thread);
	return false;
}
