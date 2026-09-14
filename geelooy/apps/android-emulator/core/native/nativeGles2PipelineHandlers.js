//B"H
//Boruch Hashem
//Blessed be He

import {
	finishNativeGlesValue,
	finishNativeGlesVoid,
	nativeGlesThreadValue
} from "./nativeGlesHandlerSupport.js";
import { readNativeGlesArgument } from "./nativeGlesArguments.js";

/**
 * Registers GLES 2.0 state calls that require retained state or explicit no-op
 * semantics. Each call still enters the shared first-error/context domain.
 */
export function registerNativeGles2PipelineHandlers(registry, state) {
	registry.register("glIsEnabled", context => isEnabled(context, state));
	registry.register("glHint", context => hint(context, state));
	registry.register("glPolygonOffset", context => polygonOffset(context, state));
	registry.register("glSampleCoverage", context => sampleCoverage(context, state));
	registry.register("glReleaseShaderCompiler", context => releaseCompiler(context, state));
}

/** Returns GL_TRUE only when the queried legal capability is currently enabled. */
function isEnabled(context, state) {
	const capability = Number(readNativeGlesArgument(context, 0, 32));
	const outcome = state.enabled(capability, nativeGlesThreadValue(context));
	finishNativeGlesValue(context, outcome.enabled ? 1 : 0);
	return Object.freeze({ capability, operation: "glIsEnabled", success: outcome.success });
}

/** Validates the sole GLES2 hint target and one of the three legal modes. */
function hint(context, state) {
	const target = Number(readNativeGlesArgument(context, 0, 32));
	const mode = Number(readNativeGlesArgument(context, 1, 32));
	return command(context, state, "hint", [target, mode]);
}

/** Records polygon depth offset factors through the typed floating ABI. */
function polygonOffset(context, state) {
	const factor = context.registers.readFloat(0, 32);
	const units = context.registers.readFloat(1, 32);
	return command(context, state, "polygonOffset", [factor, units]);
}

/** Clamps coverage to the GLES [0,1] range and retains the inversion bit. */
function sampleCoverage(context, state) {
	const value = context.registers.readFloat(0, 32);
	const invert = Number(readNativeGlesArgument(context, 0, 32)) !== 0;
	return command(context, state, "sampleCoverage", [Math.max(0, Math.min(1, value)), invert]);
}

/** GLES permits releasing compiler resources; this runtime has none to release. */
function releaseCompiler(context, state) {
	return command(context, state, "releaseShaderCompiler", []);
}

/** Dispatches one retained command and completes the guest void ABI. */
function command(context, state, method, args) {
	const outcome = state.command(method, args, nativeGlesThreadValue(context));
	finishNativeGlesVoid(context);
	return Object.freeze({ args: Object.freeze(args), method, operation: `gl${capital(method)}`, success: outcome.success });
}

/** Converts one camel-case method name to its GLES entrypoint suffix. */
function capital(value) {
	return value.charAt(0).toUpperCase() + value.slice(1);
}
