//B"H
//Boruch Hashem
//Blessed be He

import { readNativeGlesArgument, readNativeGlesSigned32 } from "./nativeGlesArguments.js";
import { finishNativeGlesVoid, nativeGlesThreadValue } from "./nativeGlesHandlerSupport.js";
import { nativeGlesImage2dBindingTarget } from "./nativeGlesTextureImageTargets.js";

/** Registers GLES2 compressed-image rejection and framebuffer-to-texture copy calls. */
export function registerNativeGles2TextureImageHandlers(registry, textures) {
	registry.register("glCompressedTexImage2D", context => compressed(context, textures, false));
	registry.register("glCompressedTexSubImage2D", context => compressed(context, textures, true));
	registry.register("glCopyTexImage2D", context => copyImage(context, textures, false));
	registry.register("glCopyTexSubImage2D", context => copyImage(context, textures, true));
}

/**
 * Implements the core compressed entrypoint while advertising zero compressed formats.
 * With no supported compressed formats every otherwise-well-formed internal format
 * is invalid; no guest data pointer is dereferenced after that deterministic verdict.
 */
function compressed(context, textures, subImage) {
	const target = u32(context, 0);
	const level = i32(context, 1);
	const bindingTarget = nativeGlesImage2dBindingTarget(target);
	const thread = nativeGlesThreadValue(context);
	if (bindingTarget === null) textures.domain.invalidEnum(thread);
	else if (level < 0) textures.domain.invalidValue(thread);
	else textures.domain.invalidEnum(thread);
	finishNativeGlesVoid(context);
	return Object.freeze({ operation: subImage ? "glCompressedTexSubImage2D" : "glCompressedTexImage2D", success: false, target });
}

/** Validates and records one copy-from-current-framebuffer texture operation. */
function copyImage(context, textures, subImage) {
	const values = subImage ? copySubArguments(context) : copyArguments(context);
	const thread = nativeGlesThreadValue(context);
	const bindingTarget = nativeGlesImage2dBindingTarget(values.target);
	if (bindingTarget === null) return fail(context, textures, thread, values, "enum");
	if (values.level < 0 || values.width < 0 || values.height < 0 || values.border !== 0) {
		return fail(context, textures, thread, values, "value");
	}
	const bound = textures.bound(bindingTarget, thread);
	if (!bound.success) return finish(context, values, false);
	textures.record(bound.context, subImage ? "copy-tex-sub-image-2d" : "copy-tex-image-2d", {
		...values,
		bindingTarget,
		texture: bound.handle
	});
	return finish(context, values, true);
}

/** Reads the GLES2 glCopyTexImage2D ABI. */
function copyArguments(context) {
	return Object.freeze({
		border: i32(context, 7),
		height: i32(context, 6),
		internalFormat: u32(context, 2),
		level: i32(context, 1),
		target: u32(context, 0),
		width: i32(context, 5),
		x: i32(context, 3),
		y: i32(context, 4)
	});
}

/** Reads the GLES2 glCopyTexSubImage2D ABI. */
function copySubArguments(context) {
	return Object.freeze({
		border: 0,
		height: i32(context, 7),
		level: i32(context, 1),
		target: u32(context, 0),
		width: i32(context, 6),
		x: i32(context, 4),
		xoffset: i32(context, 2),
		y: i32(context, 5),
		yoffset: i32(context, 3)
	});
}

/** Sets one error and completes a failed copy call. */
function fail(context, textures, thread, values, kind) {
	textures.domain[kind === "enum" ? "invalidEnum" : "invalidValue"](thread);
	return finish(context, values, false);
}

/** Completes the guest void ABI with immutable evidence. */
function finish(context, values, success) {
	finishNativeGlesVoid(context);
	return Object.freeze({ operation: values.xoffset === undefined ? "glCopyTexImage2D" : "glCopyTexSubImage2D", success, ...values });
}

function u32(context, index) {
	return Number(readNativeGlesArgument(context, index, 32));
}

function i32(context, index) {
	return readNativeGlesSigned32(context, index);
}
