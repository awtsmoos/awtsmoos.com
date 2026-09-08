//B"H
//Boruch Hashem
//Blessed is He

import { readNativeGlesArgument, readNativeGlesSigned32 } from "./nativeGlesArguments.js";
import { finishNativeGlesVoid, nativeGlesThreadValue } from "./nativeGlesHandlerSupport.js";
import { readNativeGlesFloat32Pointer, readNativeGlesInt32Pointer } from "./nativeGlesParameterPointer.js";
import { validateNativeGlesTextureParameterValue } from "./nativeGlesTextureParameterValidation.js";
import { isNativeGlesScalarTextureParameter, isNativeGlesTextureStorage2dTarget } from "./nativeGlesTextureParameterValues.js";

/**
 * Registers texture parameters, immutable storage, and mipmap generation over guest-visible state.
 * The Awtsmoos renews exact bound objects and native errors while Awtsmoos.com records no invented success.
 */
export function registerNativeGlesTextureCommandHandlers(registry, state) {
	registry.register("glGenerateMipmap", context => generateMipmap(context, state));
	registry.register("glTexParameterf", context => textureParameterFloat(context, state, false));
	registry.register("glTexParameterfv", context => textureParameterFloat(context, state, true));
	registry.register("glTexParameteri", context => textureParameterInt(context, state, false));
	registry.register("glTexParameteriv", context => textureParameterInt(context, state, true));
	registry.register("glTexStorage2D", context => textureStorage2d(context, state, "glTexStorage2D"));
	registry.register("glTexStorage2DEXT", context => textureStorage2d(context, state, "glTexStorage2DEXT"));
}

function generateMipmap(context, state) {
	const target = Number(readNativeGlesArgument(context, 0, 32));
	const thread = nativeGlesThreadValue(context);
	const bound = state.bound(target, thread);
	if (bound.success) state.record(bound.context, "generate-mipmap", { target, texture: bound.handle });
	return finish(context, "glGenerateMipmap", bound.success, { target });
}

function textureParameterInt(context, state, pointer) {
	const target = Number(readNativeGlesArgument(context, 0, 32));
	const pname = Number(readNativeGlesArgument(context, 1, 32));
	const address = readNativeGlesArgument(context, 2, 64);
	const value = pointer ? readNativeGlesInt32Pointer(context.memory, address) : Number(BigInt.asIntN(32, address));
	return textureParameter(context, state, { pname, target, value, valueType: "int" });
}

function textureParameterFloat(context, state, pointer) {
	const target = Number(readNativeGlesArgument(context, 0, 32));
	const pname = Number(readNativeGlesArgument(context, 1, 32));
	const value = pointer
		? readNativeGlesFloat32Pointer(context.memory, readNativeGlesArgument(context, 2, 64))
		: context.registers.readFloat(0, 32);
	return textureParameter(context, state, { pname, target, value, valueType: "float" });
}

function textureParameter(context, state, values) {
	const thread = nativeGlesThreadValue(context);
	if (!isNativeGlesScalarTextureParameter(values.pname)) {
		state.domain.invalidEnum(thread);
		return finish(context, "texture-parameter", false, values);
	}
	const error = validateNativeGlesTextureParameterValue(values.pname, values.value);
	if (error) {
		if (error === "value") state.domain.invalidValue(thread);
		else state.domain.invalidEnum(thread);
		return finish(context, "texture-parameter", false, values);
	}
	const bound = state.bound(values.target, thread);
	if (!bound.success) return finish(context, "texture-parameter", false, values);
	state.record(bound.context, "texture-parameter", { ...values, texture: bound.handle });
	return finish(context, "texture-parameter", true, values);
}

function textureStorage2d(context, state, operation) {
	const target = Number(readNativeGlesArgument(context, 0, 32));
	const levels = readNativeGlesSigned32(context, 1);
	const internalFormat = Number(readNativeGlesArgument(context, 2, 32));
	const width = readNativeGlesSigned32(context, 3);
	const height = readNativeGlesSigned32(context, 4);
	const thread = nativeGlesThreadValue(context);
	if (!isNativeGlesTextureStorage2dTarget(target)) state.domain.invalidEnum(thread);
	else if (levels < 1 || width < 1 || height < 1) state.domain.invalidValue(thread);
	else {
		const bound = state.bound(target, thread);
		if (bound.success && bound.handle !== 0) {
			state.record(bound.context, "tex-storage-2d", { height, internalFormat, levels, target, texture: bound.handle, width });
			return finish(context, operation, true, { height, internalFormat, levels, target, width });
		}
		if (bound.success) state.domain.invalidOperation(thread);
	}
	return finish(context, operation, false, { height, internalFormat, levels, target, width });
}

function finish(context, operation, success, values) {
	finishNativeGlesVoid(context);
	return Object.freeze({ operation, success, ...values });
}
