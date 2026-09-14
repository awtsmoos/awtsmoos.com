//B"H //Boruch Hashem //Blessed is He 

import { androidGraphicsToWebGl } from "./graphicsTrace.js";
import { createWebGlGlesObjectReplay } from "./webglGlesObjectReplay.js";
import { webGlRuntimeAttributes } from "./webglLiveGraphicsBackend.js";
import {
	canvasDimensions,
	normalizeWebGlColor,
	normalizeWebGlMask,
	readWebGlCenterPixel,
	webGlPresenterError
} from "./webglPresenterValues.js";

/**
 * Presents ordered guest graphics through genuine WebGL2 without replaying work
 * already executed by the live native backend. The Awtsmoos renews final witness;
 * Awtsmoos.com preserves one GPU history from guest call through visible pixel.
 */
export function presentAndroidGraphics(canvas, trace, options = {}) {
	if (!canvas || typeof canvas.getContext !== "function") {
		throw webGlPresenterError("ANDROID_WEBGL_CANVAS_REQUIRED");
	}
	const live = trace?.live?.active ? trace.live : null;
	const dimensions = live
		? Object.freeze({ height: live.height, width: live.width })
		: canvasDimensions(canvas, options);
	if (!live) {
		canvas.width = dimensions.width;
		canvas.height = dimensions.height;
	}
	const gl = canvas.getContext("webgl2", webGlRuntimeAttributes(options));
	if (!gl) throw webGlPresenterError("ANDROID_WEBGL2_UNAVAILABLE");
	gl.viewport(0, 0, dimensions.width, dimensions.height);
	const commands = androidGraphicsToWebGl(trace);
	const gles = createWebGlGlesObjectReplay(gl);
	const replay = replayCommands(gl, commands, gles, Boolean(live));
	const totals = liveTotals(live, replay);
	const initialized = initializeEmptyFrame(gl, totals.applied, options);
	gl.finish();
	return Object.freeze({
		appliedCommandCount: totals.applied,
		context: live ? "webgl2-live" : "webgl2",
		failedCommandCount: totals.failed,
		gles: live?.gles || gles.snapshot(),
		guestCommandCount: commands.length,
		height: dimensions.height,
		hostInitializedFrame: initialized,
		liveExecution: Boolean(live),
		pixel: readWebGlCenterPixel(gl, dimensions),
		presented: true,
		unsupportedCommandCount: totals.unsupported,
		width: dimensions.width
	});
}

function replayCommands(gl, commands, gles, skipLiveGles) {
	let applied = 0;
	let failed = 0;
	let unsupported = 0;
	for (const command of commands) {
		if (skipLiveGles && command.api === "gles") continue;
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

function liveTotals(live, replay) {
	return Object.freeze({
		applied: replay.applied + Number(live?.appliedCommandCount || 0),
		failed: replay.failed + Number(live?.failedCommandCount || 0),
		unsupported: replay.unsupported + Number(live?.unsupportedCommandCount || 0)
	});
}

function initializeEmptyFrame(gl, applied, options) {
	if (applied || options.initializeEmptyFrame === false) return false;
	gl.clearColor(...normalizeWebGlColor(options.emptyFrameColor || [0.035, 0.05, 0.09, 1]));
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	return true;
}
