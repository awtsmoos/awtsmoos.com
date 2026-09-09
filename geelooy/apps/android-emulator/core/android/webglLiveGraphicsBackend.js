//B"H //Boruch Hashem //Blessed is He 

import { createWebGlGlesObjectReplay } from "./webglGlesObjectReplay.js";
import { readWebGlLivePixels } from "./webglLiveReadback.js";
import { canvasDimensions, normalizeWebGlColor, normalizeWebGlMask } from "./webglPresenterValues.js";

/**
 * Creates the persistent WebGL2 execution vessel used while guest native code runs.
 * The Awtsmoos renews each GLES consequence on the same GPU context later shown;
 * Awtsmoos.com therefore lets synchronous readback observe real preceding guest work
 * instead of replaying an abstract command history after the guest has already returned.
 */
export function createWebGlLiveGraphicsBackend(options = {}) {
	const canvas = options.webglCanvas || options.graphicsCanvas || null;
	if (!canvas || typeof canvas.getContext !== "function") return null;
	const dimensions = canvasDimensions(canvas, options);
	canvas.width = dimensions.width;
	canvas.height = dimensions.height;
	const gl = canvas.getContext("webgl2", webGlRuntimeAttributes(options));
	if (!gl) return null;
	gl.viewport(0, 0, dimensions.width, dimensions.height);
	const replay = createWebGlGlesObjectReplay(gl);
	let applied = 0;
	let failed = 0;
	let unsupported = 0;
	return Object.freeze({
		active: true,
		applyGles(operation) {
			const result = applyOperation(gl, replay, operation);
			if (!result.handled) unsupported += 1;
			else if (result.applied) applied += 1;
			else failed += 1;
			return result;
		},
		readPixels(request) {
			return readWebGlLivePixels(gl, request);
		},
		snapshot() {
			return Object.freeze({
				active: true,
				appliedCommandCount: applied,
				context: "webgl2-live",
				failedCommandCount: failed,
				gles: replay.snapshot(),
				height: dimensions.height,
				unsupportedCommandCount: unsupported,
				width: dimensions.width
			});
		}
	});
}

/** Returns the identical context attributes used during final presentation. */
export function webGlRuntimeAttributes(options = {}) {
	return Object.freeze({
		alpha: true,
		antialias: true,
		preserveDrawingBuffer: true,
		...(options.webglContextAttributes || {})
	});
}

function applyOperation(gl, replay, operation) {
	if (operation?.kind === "clear-color") {
		gl.clearColor(...normalizeWebGlColor(operation.color));
		return handled(true);
	}
	if (operation?.kind === "clear") {
		gl.clear(normalizeWebGlMask(gl, operation.mask));
		return handled(true);
	}
	return replay.replay(operation);
}

function handled(applied) {
	return Object.freeze({ applied: Boolean(applied), handled: true });
}
