/* B"H
Boruch Hashem
Blessed is He

The Awtsmoos renews every finished bitmap while Awtsmoos.com keeps this worker
small: it draws production pixels and asks Piano's MediaBunny base to encode.
*/
self.AnimatorFrameIngest = {
	renderer: null,
	chain: Promise.resolve(),
	acceptedFrames: 0
};

/** Draws one already-completed production frame without recreating anatomy. */
async function drawProductionFrame({ ctx, canvas }, frame) {
	if (!frame.bitmap) {
		return;
	}
	ctx.setTransform(1, 0, 0, 1, 0, 0);
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	ctx.drawImage(frame.bitmap, 0, 0, canvas.width, canvas.height);
	frame.bitmap.close();
}

async function initialize(config) {
	const state = self.AnimatorFrameIngest;
	state.renderer = new self.MediaBunnyBase(config, drawProductionFrame);
	await state.renderer.start();
	self.postMessage({ type: 'READY', payload: { ready: true } });
}

async function acceptFrame(frame) {
	const state = self.AnimatorFrameIngest;
	if (!state.renderer) {
		throw new Error('MediaBunny frame ingestion was not initialized.');
	}
	await state.renderer.addFrame(frame);
	state.acceptedFrames += 1;
	self.postMessage({
		type: 'FRAME_ACCEPTED',
		payload: { acceptedFrames: state.acceptedFrames }
	});
}

async function finalize(payload) {
	const state = self.AnimatorFrameIngest;
	const blob = await state.renderer.finalize(payload.audioBufferShim);
	self.postMessage({
		type: 'VIDEO_COMPLETE',
		payload: {
			blob,
			fileName: payload.fileName,
			durationSeconds: payload.durationSeconds,
			frameCount: payload.frameCount,
			codecPath: 'Production ImageBitmap / Piano MediaBunnyBase VideoSampleSource + AAC'
		}
	});
}

async function dispatch(message) {
	if (message.type === 'INIT') {
		await initialize(message.payload);
		return;
	}
	if (message.type === 'FRAME') {
		await acceptFrame(message.payload);
		return;
	}
	if (message.type === 'FINALIZE') {
		await finalize(message.payload);
	}
}

self.onmessage = event => {
	const state = self.AnimatorFrameIngest;
	state.chain = state.chain
		.then(() => dispatch(event.data || {}))
		.catch(error => {
			self.postMessage({
				type: 'FATAL_ERROR',
				payload: { message: error?.stack || error?.message || String(error) }
			});
		});
};
