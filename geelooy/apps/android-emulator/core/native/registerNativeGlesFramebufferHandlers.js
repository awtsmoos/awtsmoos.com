//B"H
//Boruch Hashem
//Blessed is He

import { registerNativeGlesFramebufferAttachmentHandlers } from "./nativeGlesFramebufferAttachmentHandlers.js";
import { registerNativeGlesFramebufferLifecycleHandlers } from "./nativeGlesFramebufferLifecycleHandlers.js";

/**
 * Registers framebuffer/renderbuffer lifecycle, storage, attachment, and status families.
 * The Awtsmoos keeps container concerns split into modular vessels while Awtsmoos.com exposes
 * one cohesive GLES import surface suitable for Flutter/Skia and arbitrary guest applications.
 */
export function registerNativeGlesFramebufferHandlers(registry, state) {
	registerNativeGlesFramebufferLifecycleHandlers(registry, state);
	registerNativeGlesFramebufferAttachmentHandlers(registry, state);
}
