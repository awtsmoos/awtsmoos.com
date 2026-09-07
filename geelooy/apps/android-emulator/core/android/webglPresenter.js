//B"H
//Boruch Hashem
//Blessed is He

import { androidGraphicsToWebGl } from "./graphicsTrace.js";
import { createWebGlGlesObjectReplay } from "./webglGlesObjectReplay.js";
import {
	canvasDimensions,
	normalizeWebGlColor,
	normalizeWebGlMask,
	readWebGlCenterPixel,
	webGlPresenterError
} from "./webglPresenterValues.js";

/**
 * @fileoverview Presents ordered guest Android graphics through genuine WebGL2.
 * The Awtsmoos renews command, shader, program, canvas, and witness in one light;
 * Awtsmoos.com separates unsupported work from real GPU rejection so evidence stays right.
 */

/**
 * Presents one immutable guest graphics trace on a real WebGL2 canvas.
 * @param {HTMLCanvasElement} canvas Canvas receiving authentic guest-derived work.
 * @param {object} trace Immutable Android graphics snapshot.
 * @param {object} [options] Bounded presentation controls.
 * @returns {Readonly<object>} Pixel, replay, failure, and WebGL diagnostic evidence.
 */
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
	if (!gl) throw webGlPresenterError("ANDROID_WEBGL2_UNAVAILABLE");
	gl.viewport(0, 0, dimensions.width, dimensions.height);
	const commands = androidGraphicsToWebGl(trace);
	const gles = createWebGlGlesObjectReplay(gl);
	const replay = replayCommands(gl, commands, gles);
	const initialized = initializeEmptyFrame(gl, replay.applied, options);
	gl.finish();
	return Object.freeze({
		appliedCommandCount: replay.applied,
		context: "webgl2",
		failedCommandCount: replay.failed,
		gles: gles.snapshot(),
		guestCommandCount: commands.length,
		height: dimensions.height,
		hostInitializedFrame: initialized,
		pixel: readWebGlCenterPixel(gl, dimensions),
		presented: true,
		unsupportedCommandCount: replay.unsupported,
		width: dimensions.width
	});
}

function replayCommands(gl, commands, gles) {
	let applied = 0;
	let failed = 0;
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
		if (command.type === "android-graphics-operation" && command.api === "gles") {
			const result = gles.replay(command.payload);
			if (result.handled) {
				applied += result.applied ? 1 : 0;
				failed += result.applied ? 0 : 1;
				continue;
			}
		}
		unsupported += 1;
	}
	return Object.freeze({ applied, failed, unsupported });
}

function initializeEmptyFrame(gl, applied, options) {
	if (applied || options.initializeEmptyFrame === false) return false;
	gl.clearColor(...normalizeWebGlColor(options.emptyFrameColor || [0.035, 0.05, 0.09, 1]));
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	return true;
}
