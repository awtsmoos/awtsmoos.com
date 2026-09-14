//B"H
//Boruch Hashem
//Blessed be He

import { registerNativeGles2BufferQueryHandlers } from "./nativeGles2BufferQueryHandlers.js";
import { registerNativeGles2FramebufferQueryHandlers } from "./nativeGles2FramebufferQueryHandlers.js";
import { registerNativeGles2ShaderBinaryHandlers } from "./nativeGles2ShaderBinaryHandlers.js";
import { registerNativeGles2TextureImageHandlers } from "./nativeGles2TextureImageHandlers.js";
import { registerNativeGles2TextureQueryHandlers } from "./nativeGles2TextureQueryHandlers.js";
import { registerNativeGles2PipelineHandlers } from "./nativeGles2PipelineHandlers.js";
import { registerNativeGles2ProgramIntrospectionHandlers } from "./nativeGles2ProgramIntrospectionHandlers.js";
import { registerNativeGles2UniformQueryHandlers } from "./nativeGles2UniformQueryHandlers.js";
import { registerNativeGles2VertexAttribHandlers } from "./nativeGles2VertexAttribHandlers.js";
import { registerNativeGles2VertexAttribQueryHandlers } from "./nativeGles2VertexAttribQueryHandlers.js";

/**
 * Registers the GLES2 completion families over already-authentic shared state.
 * Every family owns validation and guest-memory ABI details independently, while
 * this doorway only composes them so production registration cannot drift.
 * @param {object} registry Native guest import registry.
 * @param {object} state Existing graphics state families.
 * @param {object} runtimeState Shared native runtime limits and tracing.
 */
export function registerNativeGles2Handlers(registry, state, runtimeState) {
	registerNativeGles2PipelineHandlers(registry, state.pipeline);
	registerNativeGles2FramebufferQueryHandlers(registry, state.framebuffers);
	registerNativeGles2TextureQueryHandlers(registry, state.textures);
	registerNativeGles2TextureImageHandlers(registry, state.textures);
	registerNativeGles2ShaderBinaryHandlers(registry, state.objects);
	registerNativeGles2BufferQueryHandlers(registry, state.vertexInput);
	registerNativeGles2VertexAttribHandlers(registry, state.vertexInput, runtimeState);
	registerNativeGles2VertexAttribQueryHandlers(registry, state.vertexInput, runtimeState);
	registerNativeGles2ProgramIntrospectionHandlers(registry, state.objects);
	registerNativeGles2UniformQueryHandlers(registry, state.uniforms);
}
