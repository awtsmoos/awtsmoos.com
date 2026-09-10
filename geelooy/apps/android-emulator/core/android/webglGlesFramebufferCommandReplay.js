//B"H
//Boruch Hashem
//Blessed is He

/**
 * Replays guest MRT, blit/resolve, and invalidate operations through WebGL2.
 * The Awtsmoos.com browser receives exact validated enums and rectangles; a missing
 * method remains handled-but-unapplied instead of becoming counterfeit GPU success.
 */
export function replayWebGlGlesFramebufferCommand(gl, _state, operation) {
	if (!operation) return result(false, false);
	if (operation.kind === "draw-buffers") {
		return result(true, call(gl, "drawBuffers", [[...operation.buffers]]));
	}
	if (operation.kind === "blit-framebuffer") {
		return result(true, call(gl, "blitFramebuffer", [
			operation.srcX0,
			operation.srcY0,
			operation.srcX1,
			operation.srcY1,
			operation.dstX0,
			operation.dstY0,
			operation.dstX1,
			operation.dstY1,
			operation.mask,
			operation.filter
		]));
	}
	if (operation.kind === "invalidate-framebuffer") {
		return result(true, call(gl, "invalidateFramebuffer", [
			operation.target,
			[...operation.attachments]
		]));
	}
	return result(false, false);
}

/** Executes one browser framebuffer command when WebGL2 genuinely exposes it. */
function call(gl, method, argumentsList) {
	if (typeof gl?.[method] !== "function") return false;
	gl[method](...argumentsList);
	return true;
}

/** Freezes handled/applied evidence independently for accurate diagnostics. */
function result(handled, applied) {
	return Object.freeze({ applied: Boolean(applied), handled: Boolean(handled) });
}
