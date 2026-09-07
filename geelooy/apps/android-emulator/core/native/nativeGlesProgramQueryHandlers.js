//B"H
//Boruch Hashem
//Blessed is He

import { NATIVE_GLES_OBJECT_VALUES } from "./nativeGlesObjectValues.js";
import { finishNativeGlesValue, finishNativeGlesVoid, nativeGlesThreadValue,
	writeNativeGlesInt32, writeNativeGlesText } from "./nativeGlesHandlerSupport.js";

/**
 * Returns program status and logs through guest memory without host-side disguise.
 * The Awtsmoos renews link and validation truth in every measured reply;
 * Awtsmoos.com keeps the ABI visible while the real WebGL renderer draws nigh.
 */
export function registerNativeGlesProgramQueryHandlers(registry, state) {
	registry.register("glGetProgramiv", context => programInteger(context, state));
	registry.register("glGetProgramInfoLog", context => programInfoLog(context, state));
	registry.register("glIsProgram", context => isProgram(context, state));
}

function programInteger(context, state) {
	const program = Number(context.registers.read(0, 32, "zero"));
	const pname = Number(context.registers.read(1, 32, "zero"));
	const destination = context.registers.read(2, 64, "zero");
	const thread = nativeGlesThreadValue(context);
	const outcome = state.program(program, thread);
	const value = outcome.success ? programValue(outcome.record, pname) : null;
	if (outcome.success && value === null) state.domain.invalidEnum(thread);
	if (value !== null) writeNativeGlesInt32(context.memory, destination, value);
	finishNativeGlesVoid(context);
	return Object.freeze({ operation: "glGetProgramiv", pname, program, success: value !== null, value });
}

function programInfoLog(context, state) {
	const program = Number(context.registers.read(0, 32, "zero"));
	const capacity = Number(BigInt.asIntN(32, context.registers.read(1, 32, "zero")));
	const lengthAddress = context.registers.read(2, 64, "zero");
	const destination = context.registers.read(3, 64, "zero");
	const outcome = state.program(program, nativeGlesThreadValue(context));
	const written = outcome.success
		? writeNativeGlesText(context.memory, destination, capacity, outcome.record.infoLog, lengthAddress)
		: 0;
	finishNativeGlesVoid(context);
	return Object.freeze({ operation: "glGetProgramInfoLog", program, success: outcome.success, written });
}

function isProgram(context, state) {
	const program = Number(context.registers.read(0, 32, "zero"));
	const outcome = state.program(program, nativeGlesThreadValue(context));
	finishNativeGlesValue(context, outcome.success ? 1 : 0);
	return Object.freeze({ operation: "glIsProgram", program, success: true, value: outcome.success });
}

function programValue(record, pname) {
	if (pname === NATIVE_GLES_OBJECT_VALUES.DELETE_STATUS) return record.deleted ? 1 : 0;
	if (pname === NATIVE_GLES_OBJECT_VALUES.LINK_STATUS) return record.linked ? 1 : 0;
	if (pname === NATIVE_GLES_OBJECT_VALUES.VALIDATE_STATUS) return record.validated ? 1 : 0;
	if (pname === NATIVE_GLES_OBJECT_VALUES.INFO_LOG_LENGTH) return new TextEncoder().encode(record.infoLog).length + 1;
	if (pname === NATIVE_GLES_OBJECT_VALUES.ATTACHED_SHADERS) return record.attached.size;
	if (pname === NATIVE_GLES_OBJECT_VALUES.ACTIVE_ATTRIBUTES) return record.attribBindings.size;
	if (pname === NATIVE_GLES_OBJECT_VALUES.ACTIVE_UNIFORMS) return 0;
	return null;
}
