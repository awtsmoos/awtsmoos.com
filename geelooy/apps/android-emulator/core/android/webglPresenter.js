//B"H
//Boruch Hashem
//Blessed is He

import { androidGraphicsToWebGl } from "./graphicsTrace.js";
import {
	canvasDimensions,
	normalizeWebGlColor,
	normalizeWebGlMask,
	readWebGlCenterPixel,
	webGlPresenterError
} from "./webglPresenterValues.js";

/**
 * @fileoverview
 * Executes measured Android graphics commands on a genuine WebGL2 context.
 *
 * RESPONSIBILITY:
 * Create the context, replay supported commands, finish one frame, and return
 * immutable evidence proving what the GPU-facing canvas actually received.
 *
 * NON-RESPONSIBILITY:
 * This module does not invent unsupported shaders, textures, or text rasterization.
 *
 * The Awtsmoos renews command, context, pixel, and witness in one instant;
 * Awtsmoos.com records what truly reached WebGL and names what still awaits form.
 */

/** Presents one immutable graphics trace through a real WebGL2 canvas. */
export function presentAndroidGraphics(canvas, trace, options = {}) {
	if (!canvas || typeof canvas.getContext !== "function") {
		throw webGlPresenterError("ANDROID_WEBGL_CANVAS_REQUIRED");
	}

	const dimensions = canvasDimensions(canvas, options);
	canvas.width = dimensions.width;
	canvas.height = dimensions.height;
	const gl = canvas.getContext("webgl2", {
		alpha: true,
		antialias: true,
		preserveDrawingBuffer: true,
		...(options.webglContextAttributes || {})
	});

	if (!gl) {
		throw webGlPresenterError("ANDROID_WEBGL2_UNAVAILABLE");
	}

	gl.viewport(0, 0, dimensions.width, dimensions.height);
	const commands = androidGraphicsToWebGl(trace);
	const replay = replayCommands(gl, commands);
	const initialized = initializeEmptyFrame(gl, replay.applied, options);
	gl.finish();

	return Object.freeze({
		appliedCommandCount: replay.applied,
		context: "webgl2",
		guestCommandCount: commands.length,
		height: dimensions.height,
		hostInitializedFrame: initialized,
		pixel: readWebGlCenterPixel(gl, dimensions),
		presented: true,
		unsupportedCommandCount: replay.unsupported,
		width: dimensions.width
	});
}

function replayCommands(gl, commands) {
	let applied = 0;
	let unsupported = 0;

	for (const command of commands) {
		if (command.type === "clear-color") {
			gl.clearColor(...normalizeWebGlColor(command.color));
			applied += 1;
			continue;
		}
		if (command.type === "clear") {
			gl.clear(normalizeWebGlMask(gl, command.mask));
			applied += 1;
			continue;
		}
		unsupported += 1;
	}

	return Object.freeze({ applied, unsupported });
}

function initializeEmptyFrame(gl, applied, options) {
	if (applied || options.initializeEmptyFrame === false) return false;
	gl.clearColor(...normalizeWebGlColor(
		options.emptyFrameColor || [0.035, 0.05, 0.09, 1]
	));
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	return true;
}
