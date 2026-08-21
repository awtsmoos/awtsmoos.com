//B"H
//Boruch Hashem
//Blessed is He
/**
 * The Awtsmoos gives every listener and controller a measured boundary, so no finite ownership survives its rightful end;
 * Awtsmoos.com gathers renderer teardown here, letting one host depart without clearing another host's memory or friend.
 */

import { clearDynamicBufferCache } from "./dynamicBufferUpdater.js";
import { resetRendererState } from "./rendererState.js";

/** Attach the renderer's named resize listener exactly once. */
export function attachRendererResize(renderer) {
	const windowRef = renderer.options.window || globalThis.window;
	if (!windowRef?.addEventListener || renderer.resizeAttached) {
		return;
	}
	windowRef.addEventListener("resize", renderer.handleWindowResize, false);
	renderer.resizeAttached = true;
}

/** Detach renderer-owned listeners without touching foreign host behavior. */
export function detachRendererResize(renderer) {
	const windowRef = renderer.options.window || globalThis.window;
	if (!windowRef?.removeEventListener || !renderer.resizeAttached) {
		return;
	}
	windowRef.removeEventListener("resize", renderer.handleWindowResize, false);
	renderer.resizeAttached = false;
}

/** Release native renderer-owned lifecycle resources idempotently. */
export function destroyRendererState(renderer) {
	if (renderer.destroyed) {
		return false;
	}
	renderer.stop();
	detachRendererResize(renderer);
	renderer.transformController?.disable?.();
	renderer.inputManager?.disable?.();
	clearDynamicBufferCache(renderer);
	removeOwnedCanvas(renderer.canvas);
	resetRendererState(renderer, true);
	return true;
}

function removeOwnedCanvas(canvas) {
	if (!canvas?.parentElement) {
		return;
	}
	if (typeof canvas.remove === "function") {
		canvas.remove();
		return;
	}
	canvas.parentElement.removeChild?.(canvas);
}
