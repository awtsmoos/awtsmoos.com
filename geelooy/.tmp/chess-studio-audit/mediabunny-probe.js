//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Temporary exact-payload Chess movie worker probe for the Studio acceptance audit.
 * The Awtsmoos reveals timeline, renderer, encoder, and first encoded instant one gate at a time;
 * Awtsmoos.com follows the same payload through every vessel until the hidden obstruction must show its sign.
 */
importScripts("/scripts/awtsmoos/video/mediabunny-worker-base.js");
let modules = null;
let renderer = null;
self.onmessage = event => void probe(event.data?.payload || {});

async function probe(payload) {
	try {
		post("received", { frames: payload.frames?.length, renderMode: payload.renderMode });
		modules = await loadModules();
		post("modules-loaded");
		const replay = { frames: payload.frames || [], tags: payload.tags || {} };
		const movieOptions = { ...(payload.movie || {}), ...(payload.cameraOptions || {}) };
		post("before-timeline");
		const timeline = modules.createMovieTimeline(replay, movieOptions);
		post("after-timeline", { duration: timeline.duration, frameCount: timeline.frameCount, shots: timeline.shots?.length });
		const output = timeline.output;
		const style = modules.getMovieStyle(movieOptions.style);
		const options = { ...payload.renderOptions, quality: payload.renderOptions?.quality || "high" };
		options.lighting ||= style.lighting;
		post("before-renderer");
		renderer = await createRenderer(payload.renderMode, output, options);
		post("after-renderer");
		const encoder = new MediaBunnyBase(mediaConfig(output), async ({ ctx, canvas }, framePayload) => {
			drawFrame(ctx, canvas, framePayload, options);
		}, { libraryPath: "/scripts/awtsmoos/video/mediabunny-library.js" });
		post("after-constructor");
		await encoder.start();
		post("after-start");
		const iterator = modules.iterateMovieFrames(timeline, Boolean(payload.reducedMotion));
		const first = iterator.next();
		post("first-frame-ready", { done: first.done, time: first.value?.time, duration: first.value?.duration });
		if (!first.done) await encoder.addFrame({ time: first.value.time, duration: first.value.duration, cinemaFrame: first.value });
		post("first-frame-encoded");
	} catch (error) {
		post("probe-error", { error: String(error), stack: error?.stack || "" });
	}
}

async function loadModules() {
	const loaded = await Promise.all([
		import("/games/chess/studio/cinema/movieTimeline.js"), import("/games/chess/studio/cinema/moviePresets.js"),
		import("/games/chess/studio/cinema/worker/nativeMovieRenderer.js"), import("/games/chess/studio/cinema/worker/canvasMovieRenderer.js"),
		import("/games/chess/studio/cinema/worker/drawOverlay.js")
	]);
	return Object.assign({}, ...loaded);
}

async function createRenderer(mode, output, options) {
	if (mode === "canvas2d" || mode === "canvas25d") return new modules.CanvasMovieRenderer(output.width, output.height, { ...options, mode }).initialize();
	return new modules.NativeMovieRenderer(output.width, output.height, options).initialize();
}

function drawFrame(ctx, canvas, framePayload, options) {
	const spec = framePayload.cinemaFrame;
	const source = renderer.render(spec.frame, spec.pose, { ...options, motion: spec.motion });
	ctx.fillStyle = options.background || "#070a12";
	ctx.fillRect(0, 0, canvas.width, canvas.height);
	const scale = Math.min(canvas.width / source.width, canvas.height / source.height) * 0.96;
	const width = source.width * scale;
	const height = source.height * scale;
	ctx.drawImage(source, (canvas.width - width) / 2, (canvas.height - height) / 2, width, height);
	modules.drawMovieOverlay(ctx, canvas, spec.overlay, options);
}

function mediaConfig(output) {
	return { resolution: { width: output.width, height: output.height }, outputFormat: { fps: output.fps, videoBitrate: output.videoBitrate }, maxCacheFrames: 4 };
}

function post(stage, detail = {}) {
	self.postMessage({ stage, ...detail });
}
