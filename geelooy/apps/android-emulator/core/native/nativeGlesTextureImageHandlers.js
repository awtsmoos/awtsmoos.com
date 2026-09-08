//B"H
//Boruch Hashem
//Blessed is He

import { readNativeGlesArgument, readNativeGlesSigned32 } from "./nativeGlesArguments.js";
import { finishNativeGlesVoid, nativeGlesThreadValue } from "./nativeGlesHandlerSupport.js";
import { snapshotNativeGlesPixels } from "./nativeGlesPixelSnapshot.js";
import { nativeGlesImage2dBindingTarget } from "./nativeGlesTextureImageTargets.js";

/**
 * Registers pixel-store and 2D image upload boundaries over authentic guest ABI.
 * The Awtsmoos renews dimensions, layout, stack pointer and pixels while Awtsmoos.com records guest-caused bytes only.
 */
export function registerNativeGlesTextureImageHandlers(registry, state) {
	registry.register("glPixelStorei", context => pixelStore(context, state));
	registry.register("glTexImage2D", context => texImage2d(context, state));
}

function pixelStore(context, state) {
	const pname = Number(readNativeGlesArgument(context, 0, 32));
	const param = readNativeGlesSigned32(context, 1);
	const success = state.pixelStore(pname, param, nativeGlesThreadValue(context));
	finishNativeGlesVoid(context);
	return Object.freeze({ operation: "glPixelStorei", param, pname, success });
}

function texImage2d(context, state) {
	const values = readTexImage2dArguments(context);
	const thread = nativeGlesThreadValue(context);
	const bindingTarget = nativeGlesImage2dBindingTarget(values.target);
	if (bindingTarget === null) return failEnum(context, state, thread, values);
	if (values.level < 0 || values.width < 0 || values.height < 0 || values.border !== 0) {
		return failValue(context, state, thread, values);
	}
	const bound = state.bound(bindingTarget, thread);
	if (!bound.success) return finish(context, values, false);
	const layout = state.layout(thread);
	const pixels = snapshotNativeGlesPixels(
		context.memory,
		values.pixels,
		values.width,
		values.height,
		values.format,
		values.type,
		layout
	);
	if (!pixels.success) {
		if (pixels.reason === "unsupported-pixel-layout") state.domain.invalidEnum(thread);
		else state.domain.invalidValue(thread);
		return finish(context, values, false);
	}
	state.record(bound.context, "tex-image-2d", {
		bindingTarget,
		border: values.border,
		format: values.format,
		height: values.height,
		internalFormat: values.internalFormat,
		level: values.level,
		pixelByteLength: pixels.byteLength,
		pixels: pixels.data,
		target: values.target,
		texture: bound.handle,
		type: values.type,
		width: values.width
	});
	return finish(context, values, true);
}

function readTexImage2dArguments(context) {
	return Object.freeze({
		border: readNativeGlesSigned32(context, 5),
		format: Number(readNativeGlesArgument(context, 6, 32)),
		height: readNativeGlesSigned32(context, 4),
		internalFormat: readNativeGlesSigned32(context, 2),
		level: readNativeGlesSigned32(context, 1),
		pixels: readNativeGlesArgument(context, 8, 64),
		target: Number(readNativeGlesArgument(context, 0, 32)),
		type: Number(readNativeGlesArgument(context, 7, 32)),
		width: readNativeGlesSigned32(context, 3)
	});
}

function failEnum(context, state, thread, values) {
	state.domain.invalidEnum(thread);
	return finish(context, values, false);
}

function failValue(context, state, thread, values) {
	state.domain.invalidValue(thread);
	return finish(context, values, false);
}

function finish(context, values, success) {
	finishNativeGlesVoid(context);
	return Object.freeze({ operation: "glTexImage2D", success, ...values });
}
