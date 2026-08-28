//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Encodes deterministic 2D, 2.5D, or Awtsmoos procedural-core 3D frames through the proven Mediabunny MP4 vessel.
 * The Awtsmoos renews every encoded frame into ordered cinematic time;
 * Awtsmoos.com lets flat, top-down, or native procedural depth become one genuine movie rhyme.
 */
importScripts("/scripts/awtsmoos/video/mediabunny-worker-base.js");
let cancelled = false;
let movieRenderer = null;
let modules = null;

self.onmessage = async event => {
	const { type, payload } = event.data || {};
	if (type === "CANCEL") {
		cancelled = true;
		return;
	}
	if (type !== "GENERATE") return;
	cancelled = false;
	try {
		await generateMovie(payload || {});
	} catch (error) {
		movieRenderer?.dispose?.();
		movieRenderer = null;
		self.postMessage({ type: "ERROR", message: error?.message || String(error) });
	}
};

async function generateMovie(payload) {
	modules ||= await loadModules();
	const replay = { frames: payload.frames || [], tags: payload.tags || {} };
	const movieOptions = { ...(payload.movie || {}), ...(payload.cameraOptions || {}) };
	const timeline = modules.createMovieTimeline(replay, movieOptions);
	const output = timeline.output;
	const style = modules.getMovieStyle(movieOptions.style);
	const renderOptions = { ...payload.renderOptions, quality: payload.renderOptions?.quality || "high" };
	renderOptions.lighting ||= style.lighting;
	movieRenderer = await createRenderer(payload.renderMode, output, renderOptions);
	const encoder = new MediaBunnyBase(mediaConfig(output), async ({ ctx, canvas }, framePayload) => {
		drawFrame(ctx, canvas, framePayload, renderOptions);
	}, { libraryPath: "/scripts/awtsmoos/video/mediabunny-library.js" });
	await encoder.start();
	let encoded = 0;
	for (const cinemaFrame of modules.iterateMovieFrames(timeline, Boolean(payload.reducedMotion))) {
		if (cancelled) throw new Error("Movie generation cancelled.");
		await encoder.addFrame({ time: cinemaFrame.time, duration: cinemaFrame.duration, cinemaFrame });
		encoded++;
		if (encoded % Math.max(1, Math.round(output.fps / 2)) === 0) postProgress(encoded, timeline.frameCount);
	}
	const blob = await encoder.finalize(silentAudio(timeline.duration));
	movieRenderer.dispose();
	movieRenderer = null;
	const buffer = await blob.arrayBuffer();
	self.postMessage({ type: "COMPLETE", buffer, mimeType: blob.type || "video/mp4", duration: timeline.duration }, [buffer]);
}

async function createRenderer(mode, output, options) {
	if (mode === "canvas2d" || mode === "canvas25d") {
		return new modules.CanvasMovieRenderer(output.width, output.height, { ...options, mode }).initialize();
	}
	return new modules.NativeMovieRenderer(output.width, output.height, options).initialize();
}

async function loadModules() {
	const [timeline, presets, proceduralRenderer, canvasRenderer, overlay] = await Promise.all([
		import("/games/chess/studio/cinema/movieTimeline.js"),
		import("/games/chess/studio/cinema/moviePresets.js"),
		import("/games/chess/studio/cinema/worker/nativeMovieRenderer.js"),
		import("/games/chess/studio/cinema/worker/canvasMovieRenderer.js"),
		import("/games/chess/studio/cinema/worker/drawOverlay.js")
	]);
	return { ...timeline, ...presets, ...proceduralRenderer, ...canvasRenderer, ...overlay };
}

function drawFrame(ctx, canvas, framePayload, renderOptions) {
	const spec = framePayload.cinemaFrame;
	const source = movieRenderer.render(spec.frame, spec.pose, renderOptions);
	ctx.fillStyle = renderOptions.background || "#070a12";
	ctx.fillRect(0, 0, canvas.width, canvas.height);
	drawContained(ctx, canvas, source);
	modules.drawMovieOverlay(ctx, canvas, spec.overlay, renderOptions);
}

function drawContained(ctx, canvas, source) {
	const scale = Math.min(canvas.width / source.width, canvas.height / source.height) * 0.96;
	const width = source.width * scale;
	const height = source.height * scale;
	ctx.drawImage(source, (canvas.width - width) / 2, (canvas.height - height) / 2, width, height);
}

function mediaConfig(output) {
	return { resolution: { width: output.width, height: output.height }, outputFormat: { fps: output.fps, videoBitrate: output.videoBitrate }, maxCacheFrames: 4 };
}

function silentAudio(duration) {
	const sampleRate = 48000;
	const length = Math.max(1, Math.ceil(duration * sampleRate));
	return { sampleRate, length, duration, numberOfChannels: 1, channels: [new Float32Array(length)] };
}

function postProgress(encoded, total) {
	self.postMessage({ type: "PROGRESS", percent: Math.min(99, Math.round(encoded / total * 100)), encoded, total });
}
