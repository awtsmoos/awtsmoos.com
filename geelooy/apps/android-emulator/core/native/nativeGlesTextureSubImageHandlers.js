//B"H
//Boruch Hashem
//Blessed is He

import { readNativeGlesArgument, readNativeGlesSigned32 } from "./nativeGlesArguments.js";
import { finishNativeGlesVoid, nativeGlesThreadValue } from "./nativeGlesHandlerSupport.js";
import { snapshotNativeGlesPixels } from "./nativeGlesPixelSnapshot.js";
import { nativeGlesImage2dBindingTarget } from "./nativeGlesTextureImageTargets.js";

/**
 * Registers authentic 2D subimage uploads using X0-X7 plus the guest stack pixel pointer.
 * The Awtsmoos renews offsets and bytes while Awtsmoos.com preserves the exact bound texture witness.
 */
export function registerNativeGlesTextureSubImageHandlers(registry, state) {
	registry.register("glTexSubImage2D", context => textureSubImage2d(context, state));
}

function textureSubImage2d(context, state) {
	const values = arguments2d(context);
	const thread = nativeGlesThreadValue(context);
	const bindingTarget = nativeGlesImage2dBindingTarget(values.target);
	if (bindingTarget === null) return fail(context, state, thread, values, "enum");
	if ([values.level, values.xoffset, values.yoffset, values.width, values.height].some(value => value < 0)) {
		return fail(context, state, thread, values, "value");
	}
	const bound = state.bound(bindingTarget, thread);
	if (!bound.success) return finish(context, values, false);
	const pixels = snapshotNativeGlesPixels(context.memory, values.pixels, values.width, values.height, values.format, values.type, state.layout(thread));
	if (!pixels.success) return fail(context, state, thread, values, pixels.reason === "unsupported-pixel-layout" ? "enum" : "value");
	state.record(bound.context, "tex-sub-image-2d", {
		...values,
		bindingTarget,
		pixelByteLength: pixels.byteLength,
		pixels: pixels.data,
		texture: bound.handle
	});
	return finish(context, values, true);
}

function arguments2d(context) {
	return Object.freeze({
		format: Number(readNativeGlesArgument(context, 6, 32)),
		height: readNativeGlesSigned32(context, 5),
		level: readNativeGlesSigned32(context, 1),
		pixels: readNativeGlesArgument(context, 8, 64),
		target: Number(readNativeGlesArgument(context, 0, 32)),
		type: Number(readNativeGlesArgument(context, 7, 32)),
		width: readNativeGlesSigned32(context, 4),
		xoffset: readNativeGlesSigned32(context, 2),
		yoffset: readNativeGlesSigned32(context, 3)
	});
}

function fail(context, state, thread, values, kind) {
	if (kind === "enum") state.domain.invalidEnum(thread);
	else state.domain.invalidValue(thread);
	return finish(context, values, false);
}

function finish(context, values, success) {
	finishNativeGlesVoid(context);
	return Object.freeze({ operation: "glTexSubImage2D", success, ...values });
}
