//B"H
//Boruch Hashem
//Blessed be He

import { registerNativeGles3BufferQueryHandlers } from "./nativeGles3BufferQueryHandlers.js";
import { registerNativeGles3ClearBufferHandlers } from "./nativeGles3ClearBufferHandlers.js";
import { registerNativeGles3FramebufferLayerHandlers } from "./nativeGles3FramebufferLayerHandlers.js";
import { registerNativeGles3IntegerQueryHandlers } from "./nativeGles3IntegerQueryHandlers.js";
import { registerNativeGles3SamplerQueryHandlers } from "./nativeGles3SamplerQueryHandlers.js";
import { registerNativeGles3UniformQueryHandlers } from "./nativeGles3UniformQueryHandlers.js";
import { registerNativeGles3VertexAttribHandlers } from "./nativeGles3VertexAttribHandlers.js";
import { registerNativeGles3VertexAttribQueryHandlers } from "./nativeGles3VertexAttribQueryHandlers.js";

/**
 * Registers GLES3 completion families over the exact production GLES2 state.
 * Each family stays isolated so API growth never creates a monolithic dispatcher,
 * while all queries and commands observe the same context/object truth.
 */
export function registerNativeGles3Handlers(registry, state, runtimeState) {
	registerNativeGles3BufferQueryHandlers(registry, state.vertexInput);
	registerNativeGles3SamplerQueryHandlers(registry, state.samplers);
	registerNativeGles3UniformQueryHandlers(registry, state.uniforms);
	registerNativeGles3IntegerQueryHandlers(registry, state.strings);
	registerNativeGles3ClearBufferHandlers(registry, state.pipeline);
	registerNativeGles3FramebufferLayerHandlers(registry, state.framebuffers);
	registerNativeGles3VertexAttribHandlers(registry, state.vertexInput, runtimeState);
	registerNativeGles3VertexAttribQueryHandlers(registry, state.vertexInput, runtimeState);
}
