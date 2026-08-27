/* B"H
Boruch Hashem
Blessed is He

The Awtsmoos renews frame and sound without an external encoder. This worker
proves the same browser H.264/AAC MP4 covenant already revealed in Piano.
*/
importScripts('/scripts/awtsmoos/video/mediabunny-worker-base.js');

const PROOF_DURATION_SECONDS = 3;
const PROOF_FPS = 12;

function drawProofFrame(workerContext, framePayload) {
	const { ctx, canvas } = workerContext;
	const time = framePayload.time;
	const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
	gradient.addColorStop(0, '#081225');
	gradient.addColorStop(1, '#4c1d95');
	ctx.fillStyle = gradient;
	ctx.fillRect(0, 0, canvas.width, canvas.height);

	const orbitX = canvas.width * 0.5 + Math.cos(time * 4) * 82;
	const orbitY = canvas.height * 0.52 + Math.sin(time * 5) * 38;
	ctx.fillStyle = '#f8c44f';
	ctx.beginPath();
	ctx.arc(orbitX, orbitY, 22, 0, Math.PI * 2);
	ctx.fill();

	ctx.fillStyle = '#ffffff';
	ctx.font = '700 20px system-ui';
	ctx.fillText('B"H BROWSER MP4', 18, 32);
	ctx.font = '600 14px ui-monospace, monospace';
	ctx.fillText(`FRAME ${Math.floor(time * PROOF_FPS)}`, 18, 58);
}

function makeAudioShim() {
	const sampleRate = 48000;
	const length = Math.round(sampleRate * PROOF_DURATION_SECONDS);
	const channels = [new Float32Array(length), new Float32Array(length)];
	for (let index = 0; index < length; index += 1) {
		const time = index / sampleRate;
		const envelope = Math.min(1, time * 5) * Math.min(1, (PROOF_DURATION_SECONDS - time) * 5);
		channels[0][index] = Math.sin(Math.PI * 2 * 220 * time) * 0.12 * envelope;
		channels[1][index] = Math.sin(Math.PI * 2 * 330 * time) * 0.1 * envelope;
	}
	return {
		sampleRate,
		length,
		duration: PROOF_DURATION_SECONDS,
		numberOfChannels: channels.length,
		channels
	};
}

async function renderProof() {
	const config = {
		resolution: { width: 320, height: 180 },
		outputFormat: { quality: 0.55, fps: PROOF_FPS },
		maxCacheFrames: 4
	};
	const renderer = new MediaBunnyBase(config, drawProofFrame, {
		libraryPath: '/scripts/awtsmoos/video/mediabunny-library.js'
	});
	await renderer.start();
	const frameDuration = 1 / PROOF_FPS;
	const frameCount = PROOF_DURATION_SECONDS * PROOF_FPS;
	for (let frameIndex = 0; frameIndex < frameCount; frameIndex += 1) {
		await renderer.addFrame({
			time: frameIndex * frameDuration,
			duration: frameDuration
		});
	}
	const blob = await renderer.finalize(makeAudioShim());
	self.postMessage({
		type: 'VIDEO_COMPLETE',
		payload: {
			blob,
			fileName: 'awtsmoos-browser-muxer-proof.mp4',
			durationSeconds: PROOF_DURATION_SECONDS
		}
	});
}

self.onmessage = event => {
	if (event.data?.type !== 'START_PROOF') {
		return;
	}
	renderProof().catch(error => {
		self.postMessage({
			type: 'FATAL_ERROR',
			payload: { message: error?.stack || error?.message || String(error) }
		});
	});
};
