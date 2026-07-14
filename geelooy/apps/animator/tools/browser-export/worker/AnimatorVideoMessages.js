/* B"H
Boruch Hashem
Blessed is He

The Awtsmoos renews original frames, direct H.264 packets, browser AAC, and one
MediaBunny MP4. No external production encoder enters this worker.
*/
self.AnimatorVideo = self.AnimatorVideo || {};

AnimatorVideo.startExport = async function startExport(payload) {
	if (AnimatorVideo.state.isRendering) {
		throw new Error('A browser export is already running.');
	}
	const { plan, audioBufferShim } = payload;
	const config = AnimatorVideo.exportConfig(payload, plan);
	AnimatorVideo.reset(plan, config);
	AnimatorVideo.state.isRendering = true;
	AnimatorVideo.directStatus('Initializing direct browser H.264 session...');
	const session = await AnimatorVideo.createMuxSession(config);
	AnimatorVideo.state.renderer = session;
	await AnimatorVideo.renderDirectFrames(session);
	const blob = await AnimatorVideo.finalizeDirectSession(
		session,
		audioBufferShim
	);
	AnimatorVideo.state.isRendering = false;
	self.postMessage({
		type: 'VIDEO_COMPLETE',
		payload: {
			blob,
			fileName: payload.fileName
				|| 'the-forecast-that-stole-tuesday-browser.mp4',
			durationSeconds: plan.duration / 1000,
			frameCount: AnimatorVideo.state.frameCount,
			codecPath: 'Direct WebCodecs H.264 packets / Piano MediaBunny AAC + MP4'
		}
	});
};

AnimatorVideo.exportConfig = function exportConfig(payload, plan) {
	return {
		resolution: {
			width: Number(payload.width || plan.settings.width || 640),
			height: Number(payload.height || plan.settings.height || 360)
		},
		outputFormat: {
			quality: Number(payload.quality || 0.72),
			fps: Number(payload.fps || plan.settings.fps || 12),
			bitrate: Number(payload.bitrate || 0) || undefined
		},
		renderBatchFrames: Math.max(
			1,
			Number(payload.renderBatchFrames || 8)
		)
	};
};

AnimatorVideo.renderDirectFrames = async function renderDirectFrames(session) {
	const state = AnimatorVideo.state;
	const fps = state.config.outputFormat.fps;
	const frameDuration = 1 / fps;
	let reportedPercent = -1;
	for (let frameIndex = 0; frameIndex < state.frameCount; frameIndex += 1) {
		await AnimatorVideo.encodeDirectFrame(
			session,
			{
				time: frameIndex * frameDuration,
				duration: frameDuration
			},
			frameIndex
		);
		state.completedFrames = frameIndex + 1;
		reportedPercent = AnimatorVideo.reportProgress(
			state,
			reportedPercent,
			session
		);
		if (state.completedFrames % state.config.renderBatchFrames === 0) {
			await new Promise(resolve => setTimeout(resolve, 0));
		}
	}
};

AnimatorVideo.reportProgress = function reportProgress(
	state,
	previousPercent,
	session
) {
	const percent = Math.floor(
		state.completedFrames / state.frameCount * 100
	);
	if (percent < previousPercent + 2 && percent !== 100) {
		return previousPercent;
	}
	self.postMessage({
		type: 'RENDER_PROGRESS',
		payload: {
			percent,
			completedFrames: state.completedFrames,
			totalFrames: state.frameCount,
			encodedPackets: session.encodedPackets
		}
	});
	return percent;
};

self.onmessage = event => {
	if (event.data?.type !== 'START_EXPORT') {
		return;
	}
	AnimatorVideo.startExport(event.data.payload).catch(error => {
		AnimatorVideo.state.isRendering = false;
		self.postMessage({
			type: 'FATAL_ERROR',
			payload: {
				message: error?.stack || error?.message || String(error)
			}
		});
	});
};
