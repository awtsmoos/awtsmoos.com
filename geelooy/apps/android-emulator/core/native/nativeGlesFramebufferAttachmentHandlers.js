//B"H
//Boruch Hashem
//Blessed is He

import { readNativeGlesArgument } from "./nativeGlesArguments.js";
import { finishNativeGlesValue, finishNativeGlesVoid, nativeGlesThreadValue } from "./nativeGlesHandlerSupport.js";

const STORAGE_ALIASES = ["ANGLE", "APPLE", "CHROMIUM", "EXT", "IMG"];
const TEXTURE_ALIASES = ["EXT", "IMG"];

/**
 * Registers renderbuffer storage, framebuffer attachments, and completeness queries.
 * The Awtsmoos keeps attachment metadata guest-owned while Awtsmoos.com preserves aliases
 * without claiming unsupported multisample texture replay as core WebGL2 capability.
 */
export function registerNativeGlesFramebufferAttachmentHandlers(registry, state) {
	registry.register("glRenderbufferStorage", context => storage(context, state, false));
	registry.register("glRenderbufferStorageMultisample", context => storage(context, state, true));
	for (const suffix of STORAGE_ALIASES) registry.register(`glRenderbufferStorageMultisample${suffix}`, context => storage(context, state, true));
	registry.register("glFramebufferRenderbuffer", context => attachRenderbuffer(context, state));
	registry.register("glFramebufferTexture2D", context => attachTexture(context, state, false));
	for (const suffix of TEXTURE_ALIASES) registry.register(`glFramebufferTexture2DMultisample${suffix}`, context => attachTexture(context, state, true));
	registry.register("glCheckFramebufferStatus", context => checkStatus(context, state));
}

/** Allocates single- or multisample renderbuffer storage using exact signed dimensions. */
function storage(context, state, multisample) {
	const target = u32(context, 0);
	const samples = multisample ? signed32(readNativeGlesArgument(context, 1, 32)) : 0;
	const shift = multisample ? 1 : 0;
	const internalFormat = u32(context, 1 + shift);
	const width = signed32(readNativeGlesArgument(context, 2 + shift, 32));
	const height = signed32(readNativeGlesArgument(context, 3 + shift, 32));
	const success = state.storage(target, internalFormat, width, height, samples, nativeGlesThreadValue(context));
	finishNativeGlesVoid(context);
	return Object.freeze({ height, internalFormat, operation: multisample ? "glRenderbufferStorageMultisample" : "glRenderbufferStorage", samples, success, target, width });
}

/** Attaches or detaches one renderbuffer reference from the selected framebuffer. */
function attachRenderbuffer(context, state) {
	const target = u32(context, 0);
	const attachment = u32(context, 1);
	const renderbufferTarget = u32(context, 2);
	const renderbuffer = u32(context, 3);
	const success = state.attachRenderbuffer(target, attachment, renderbufferTarget, renderbuffer, nativeGlesThreadValue(context));
	finishNativeGlesVoid(context);
	return Object.freeze({ attachment, operation: "glFramebufferRenderbuffer", renderbuffer, renderbufferTarget, success, target });
}

/** Attaches core or extension multisample texture metadata without host-side substitution. */
function attachTexture(context, state, multisample) {
	const target = u32(context, 0);
	const attachment = u32(context, 1);
	const textureTarget = u32(context, 2);
	const texture = u32(context, 3);
	const level = signed32(readNativeGlesArgument(context, 4, 32));
	const samples = multisample ? signed32(readNativeGlesArgument(context, 5, 32)) : 0;
	const success = state.attachTexture(target, attachment, textureTarget, texture, level, samples, nativeGlesThreadValue(context));
	finishNativeGlesVoid(context);
	return Object.freeze({ attachment, level, operation: multisample ? "glFramebufferTexture2DMultisample" : "glFramebufferTexture2D", samples, success, target, texture, textureTarget });
}

/** Returns the native emulation's deterministic completeness GLenum through X0. */
function checkStatus(context, state) {
	const target = u32(context, 0);
	const status = state.status(target, nativeGlesThreadValue(context));
	finishNativeGlesValue(context, status, 32);
	return Object.freeze({ operation: "glCheckFramebufferStatus", status, success: status !== 0, target });
}

/** Reads one unsigned GLenum/GLuint lane. */
function u32(context, index) { return Number(readNativeGlesArgument(context, index, 32)); }

/** Reads one signed GLsizei/GLint lane. */
function signed32(value) { return Number(BigInt.asIntN(32, BigInt(value))); }
