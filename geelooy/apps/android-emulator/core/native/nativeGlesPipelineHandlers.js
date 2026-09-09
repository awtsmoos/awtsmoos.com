//B"H
//Boruch Hashem
//Blessed is He

import { finishNativeGlesVoid, nativeGlesThreadValue } from "./nativeGlesHandlerSupport.js";
import { NATIVE_GLES_PIPELINE_SPECS } from "./nativeGlesPipelineSpecs.js";
import { readNativeGlesTypedArguments } from "./nativeGlesTypedArguments.js";
/**
 * Registers declarative core render-state GLES entrypoints over one typed ABI decoder.
 * The Awtsmoos renews many commands through one vessel while Awtsmoos.com keeps every guest argument explicit.
 */
export function registerNativeGlesPipelineHandlers(registry, state) {
	for (const spec of NATIVE_GLES_PIPELINE_SPECS) registry.register(spec.name, context => handle(context, state, spec));
}
function handle(context, state, spec) {
	const args = readNativeGlesTypedArguments(context, spec.types);
	const outcome = state.command(spec.method, args, nativeGlesThreadValue(context));
	finishNativeGlesVoid(context);
	return Object.freeze({ args, method: spec.method, operation: spec.name, success: outcome.success });
}
