//B"H //Boruch Hashem //Blessed is He 

import { readNativeGlesArgument, readNativeGlesSigned32 } from "./nativeGlesArguments.js";
import { finishNativeGlesVoid, nativeGlesThreadValue } from "./nativeGlesHandlerSupport.js";

const BLIT_ALIASES = Object.freeze([
	"glBlitFramebuffer",
	"glBlitFramebufferANGLE",
	"glBlitFramebufferCHROMIUM",
	"glBlitFramebufferNV"
]);
const MAXIMUM_ENUM_LIST = 32;

/**
 * Registers MRT selection, framebuffer blit/resolve, and invalidate/discard roads.
 * The Awtsmoos.com ABI reader honors AAPCS64 stack arguments for ten-argument blits;
 * every alias reaches the same validated guest framebuffer state before WebGL replay.
 */
export function registerNativeGlesFramebufferCommandHandlers(registry, state) {
	registry.register("glDrawBuffers", context => drawBuffers(context, state));
	for (const name of BLIT_ALIASES) {
		registry.register(name, context => blit(context, state, name));
	}
	registry.register("glInvalidateFramebuffer", context => invalidate(context, state, "glInvalidateFramebuffer"));
	registry.register("glDiscardFramebufferEXT", context => invalidate(context, state, "glDiscardFramebufferEXT"));
}

/** Reads and validates the guest GLenum list used for multiple render targets. */
function drawBuffers(context, state) {
	const count = readNativeGlesSigned32(context, 0);
	const thread = nativeGlesThreadValue(context);
	const buffers = readEnumList(context, state, count, 1, thread);
	const success = buffers !== null && state.drawBuffers(buffers, thread);
	finishNativeGlesVoid(context);
	return Object.freeze({ buffers: buffers || [], count, operation: "glDrawBuffers", success });
}

/** Restores all ten AAPCS64 blit arguments, including mask/filter stack slots. */
function blit(context, state, operation) {
	const command = Object.freeze({
		dstX0: readNativeGlesSigned32(context, 4),
		dstX1: readNativeGlesSigned32(context, 6),
		dstY0: readNativeGlesSigned32(context, 5),
		dstY1: readNativeGlesSigned32(context, 7),
		filter: Number(readNativeGlesArgument(context, 9, 32)),
		mask: Number(readNativeGlesArgument(context, 8, 32)),
		srcX0: readNativeGlesSigned32(context, 0),
		srcX1: readNativeGlesSigned32(context, 2),
		srcY0: readNativeGlesSigned32(context, 1),
		srcY1: readNativeGlesSigned32(context, 3)
	});
	const success = state.blit(command, nativeGlesThreadValue(context));
	finishNativeGlesVoid(context);
	return Object.freeze({ ...command, operation, success });
}

/** Reads attachment enums and applies core invalidate or EXT discard semantics. */
function invalidate(context, state, operation) {
	const target = Number(readNativeGlesArgument(context, 0, 32));
	const count = readNativeGlesSigned32(context, 1);
	const thread = nativeGlesThreadValue(context);
	const attachments = readEnumList(context, state, count, 2, thread);
	const success = attachments !== null
		&& state.invalidate(target, attachments, thread);
	finishNativeGlesVoid(context);
	return Object.freeze({ attachments: attachments || [], count, operation, success, target });
}

/** Reads a bounded guest GLenum vector without trusting an arbitrary native count. */
function readEnumList(context, state, count, pointerArgument, thread) {
	if (count < 0 || count > MAXIMUM_ENUM_LIST) {
		state.domain.invalidValue(thread);
		return null;
	}
	if (count === 0) return Object.freeze([]);
	const address = readNativeGlesArgument(context, pointerArgument, 64);
	if (address === 0n) {
		state.domain.invalidValue(thread);
		return null;
	}
	const bytes = context.memory.read(address, count * 4);
	const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
	const values = [];
	for (let index = 0; index < count; index += 1) {
		values.push(view.getUint32(index * 4, true));
	}
	return Object.freeze(values);
}
