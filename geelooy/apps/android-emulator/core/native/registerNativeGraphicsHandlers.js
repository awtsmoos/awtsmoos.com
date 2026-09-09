//B"H
//Boruch Hashem
//Blessed is He

import { registerNativeAndroidWindowBufferHandlers } from "./nativeAndroidWindowBufferHandlers.js";
import { getNativeAndroidWindowBufferState } from "./nativeAndroidWindowBufferState.js";
import { registerNativeAndroidWindowHandlers } from "./nativeAndroidWindowHandlers.js";
import { getNativeAndroidWindowState } from "./nativeAndroidWindowState.js";
import { registerNativeEglConfigHandlers } from "./nativeEglConfigHandlers.js";
import { createNativeEglConfigState } from "./nativeEglConfigState.js";
import { registerNativeEglContextHandlers } from "./nativeEglContextHandlers.js";
import { getNativeEglContextState } from "./nativeEglContextState.js";
import { registerNativeEglDisplayHandlers } from "./nativeEglDisplayHandlers.js";
import { getNativeEglDisplayState } from "./nativeEglDisplayState.js";
import { registerNativeEglProcAddressHandlers } from "./nativeEglProcAddressHandlers.js";
import { registerNativeEglSurfaceHandlers } from "./nativeEglSurfaceHandlers.js";
import { getNativeEglSurfaceState } from "./nativeEglSurfaceState.js";
import { registerNativeEglWindowSurfaceHandlers } from "./nativeEglWindowSurfaceHandlers.js";
import { registerNativeGlesCoreHandlers } from "./registerNativeGlesCoreHandlers.js";
import { registerNativeGlesFramebufferHandlers } from "./registerNativeGlesFramebufferHandlers.js";
import { getNativeGlesFramebufferState } from "./nativeGlesFramebufferState.js";
import { registerNativeGlesInternalFormatHandlers } from "./nativeGlesInternalFormatHandlers.js";
import { getNativeGlesObjectState } from "./nativeGlesObjectState.js";
import { registerNativeGlesProgramHandlers } from "./nativeGlesProgramHandlers.js";
import { registerNativeGlesProgramQueryHandlers } from "./nativeGlesProgramQueryHandlers.js";
import { registerNativeGlesSamplerHandlers } from "./nativeGlesSamplerHandlers.js";
import { getNativeGlesSamplerState } from "./nativeGlesSamplerState.js";
import { registerNativeGlesShaderHandlers } from "./nativeGlesShaderHandlers.js";
import { registerNativeGlesShaderPrecisionHandlers } from "./nativeGlesShaderPrecisionHandlers.js";
import { registerNativeGlesShaderQueryHandlers } from "./nativeGlesShaderQueryHandlers.js";
import { registerNativeGlesStringHandlers } from "./nativeGlesStringHandlers.js";
import { getNativeGlesStringState } from "./nativeGlesStringState.js";
import { registerNativeGlesTextureCommandHandlers } from "./nativeGlesTextureCommandHandlers.js";
import { registerNativeGlesTextureImageHandlers } from "./nativeGlesTextureImageHandlers.js";
import { registerNativeGlesTextureLifecycleHandlers } from "./nativeGlesTextureLifecycleHandlers.js";
import { getNativeGlesTextureState } from "./nativeGlesTextureState.js";
import { registerNativeGlesTextureSubImageHandlers } from "./nativeGlesTextureSubImageHandlers.js";
import { registerNativeGlesUniformHandlers } from "./registerNativeGlesUniformHandlers.js";
import { getNativeGlesUniformState } from "./nativeGlesUniformState.js";

/**
 * Registers Android windows, EGL lifecycle, and modular generic GLES families.
 * The Awtsmoos renews objects, uniforms, textures, pipeline, and future draw roads in ordered light;
 * Awtsmoos.com keeps every browser consequence causal while unsupported edges remain explicit.
 *
 * @param {object} registry Native host-import registry receiving Android/EGL/GLES entrypoints.
 * @param {object} runtimeState Shared native runtime state and graphics trace authority.
 * @returns {object} Frozen collection of the concrete graphics state families now registered.
 */
export function registerNativeGraphicsHandlers(registry, runtimeState) {
	const display = getNativeEglDisplayState(runtimeState);
	const config = createNativeEglConfigState(display);
	const context = getNativeEglContextState(runtimeState, display, config);
	const surface = getNativeEglSurfaceState(runtimeState, display, config, context);
	const windows = getNativeAndroidWindowState(runtimeState);
	const buffers = getNativeAndroidWindowBufferState(runtimeState, windows);
	const strings = getNativeGlesStringState(runtimeState, context);
	const objects = getNativeGlesObjectState(runtimeState, context);
	const uniforms = getNativeGlesUniformState(runtimeState, objects);
	const textures = getNativeGlesTextureState(runtimeState, context);
	const samplers = getNativeGlesSamplerState(runtimeState, context);
	const framebuffers = getNativeGlesFramebufferState(runtimeState, context);
	registerNativeAndroidWindowHandlers(registry, runtimeState, windows, buffers);
	registerNativeAndroidWindowBufferHandlers(registry, buffers);
	registerNativeEglDisplayHandlers(registry, display);
	registerNativeEglConfigHandlers(registry, { configState: config, displayState: display });
	registerNativeEglContextHandlers(registry, context);
	registerNativeEglProcAddressHandlers(registry, runtimeState.imports);
	registerNativeEglSurfaceHandlers(registry, surface);
	registerNativeEglWindowSurfaceHandlers(registry, surface, windows);
	registerNativeGlesStringHandlers(registry, strings);
	registerNativeGlesShaderPrecisionHandlers(registry, strings);
	registerNativeGlesInternalFormatHandlers(registry, strings);
	registerNativeGlesShaderHandlers(registry, objects);
	registerNativeGlesShaderQueryHandlers(registry, objects);
	registerNativeGlesProgramHandlers(registry, objects);
	registerNativeGlesProgramQueryHandlers(registry, objects);
	registerNativeGlesUniformHandlers(registry, uniforms);
	registerNativeGlesFramebufferHandlers(registry, framebuffers);
	registerNativeGlesTextureLifecycleHandlers(registry, textures);
	registerNativeGlesTextureImageHandlers(registry, textures);
	registerNativeGlesTextureCommandHandlers(registry, textures);
	registerNativeGlesTextureSubImageHandlers(registry, textures);
	registerNativeGlesSamplerHandlers(registry, samplers);
	const core = registerNativeGlesCoreHandlers(registry, runtimeState, context);
	return Object.freeze({ buffers, config, context, core, display, framebuffers, objects, samplers, strings, surface, textures, uniforms, windows });
}
