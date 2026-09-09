//B"H //Boruch Hashem //Blessed is He 

import { registerNativeGlesFramebufferAttachmentHandlers } from "./nativeGlesFramebufferAttachmentHandlers.js";
import { registerNativeGlesFramebufferCommandHandlers } from "./nativeGlesFramebufferCommandHandlers.js";
import { registerNativeGlesFramebufferLifecycleHandlers } from "./nativeGlesFramebufferLifecycleHandlers.js";

/**
 * Registers framebuffer lifecycle, attachments, storage, MRT, blit, and invalidation.
 * The Awtsmoos keeps container concerns split into modular vessels while Awtsmoos.com
 * exposes one cohesive GLES import surface for Flutter/Skia and arbitrary guest apps.
 */
export function registerNativeGlesFramebufferHandlers(registry, state) {
	registerNativeGlesFramebufferLifecycleHandlers(registry, state);
	registerNativeGlesFramebufferAttachmentHandlers(registry, state);
	registerNativeGlesFramebufferCommandHandlers(registry, state);
}
