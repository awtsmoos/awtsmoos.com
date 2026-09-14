//B"H
//Boruch Hashem
//Blessed be He

import { readNativeGlesArgument } from "./nativeGlesArguments.js";
import { finishNativeGlesVoid, nativeGlesThreadValue, writeNativeGlesInt32 } from "./nativeGlesHandlerSupport.js";
import { nativeGlesRenderbufferFormatBits } from "./nativeGlesRenderbufferFormatInfo.js";

const NONE = 0;
const TEXTURE = 0x1702;
const RENDERBUFFER = 0x8d41;

/** Registers GLES2 framebuffer attachment and renderbuffer metadata queries. */
export function registerNativeGles2FramebufferQueryHandlers(registry, state) {
	registry.register("glGetFramebufferAttachmentParameteriv", context => attachment(context, state));
	registry.register("glGetRenderbufferParameteriv", context => renderbuffer(context, state));
}

/** Writes one framebuffer attachment object/type/level/cube-face property. */
function attachment(context, state) {
	const target = u32(context, 0);
	const attachmentPoint = u32(context, 1);
	const pname = u32(context, 2);
	const destination = readNativeGlesArgument(context, 3, 64);
	const outcome = state.attachment(target, attachmentPoint, nativeGlesThreadValue(context));
	let value = outcome.success ? attachmentValue(outcome.record, pname) : null;
	if (outcome.success && value === null) state.domain.invalidEnum(nativeGlesThreadValue(context));
	if (value !== null) writeNativeGlesInt32(context.memory, destination, value);
	finishNativeGlesVoid(context);
	return Object.freeze({ attachment: attachmentPoint, operation: "glGetFramebufferAttachmentParameteriv", pname, success: value !== null, target, value });
}

/** Writes width, height, internal format, or derived component bit depth. */
function renderbuffer(context, state) {
	const target = u32(context, 0);
	const pname = u32(context, 1);
	const destination = readNativeGlesArgument(context, 2, 64);
	const outcome = state.renderbuffer(target, nativeGlesThreadValue(context));
	let value = outcome.success ? renderbufferValue(outcome.record, pname) : null;
	if (outcome.success && value === null) state.domain.invalidEnum(nativeGlesThreadValue(context));
	if (value !== null) writeNativeGlesInt32(context.memory, destination, value);
	finishNativeGlesVoid(context);
	return Object.freeze({ operation: "glGetRenderbufferParameteriv", pname, success: value !== null, target, value });
}

/** Resolves GLES2 attachment query tokens from one stored attachment record. */
function attachmentValue(record, pname) {
	if (pname === 0x8cd0) return record ? (record.kind === "texture" ? TEXTURE : RENDERBUFFER) : NONE;
	if (pname === 0x8cd1) return record?.handle || 0;
	if (pname === 0x8cd2) return record?.kind === "texture" ? record.level || 0 : 0;
	if (pname === 0x8cd3) return record?.kind === "texture" ? cubeFace(record.target) : 0;
	return null;
}

/** Resolves GLES2 renderbuffer query tokens, including component bit sizes. */
function renderbufferValue(record, pname) {
	if (pname === 0x8d42) return record.width;
	if (pname === 0x8d43) return record.height;
	if (pname === 0x8d44) return record.internalFormat;
	const index = new Map([[0x8d50, 0], [0x8d51, 1], [0x8d52, 2], [0x8d53, 3], [0x8d54, 4], [0x8d55, 5]]).get(pname);
	return index === undefined ? null : nativeGlesRenderbufferFormatBits(record.internalFormat)[index];
}

/** Returns a cube face enum only when the attachment target is a cube face. */
function cubeFace(target) {
	return target >= 0x8515 && target <= 0x851a ? target : 0;
}

/** Reads one unsigned guest GLenum/GLuint lane. */
function u32(context, index) {
	return Number(readNativeGlesArgument(context, index, 32));
}
