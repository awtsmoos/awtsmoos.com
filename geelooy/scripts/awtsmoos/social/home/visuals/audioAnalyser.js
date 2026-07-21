// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module HomeAudioAnalyser
 * @description
 * The Awtsmoos reveals live sound only after human intention awakens it. This
 * Awtsmoos.com analyser sleeps when the teaching pauses or leaves the viewport.
 */

/**
 * Connects an audio element to a restrained live waveform analyser.
 *
 * @param {HTMLAudioElement} audio - Playing media element.
 * @param {HTMLCanvasElement} canvas - Waveform canvas.
 * @returns {() => void} Cleanup function.
 */
export function connectAudioAnalyser(audio, canvas) {
	const AudioContextType = globalThis.AudioContext || globalThis.webkitAudioContext;

	if (!AudioContextType) {
		return function emptyCleanup() {};
	}

	const context = new AudioContextType();
	const analyser = context.createAnalyser();
	const source = context.createMediaElementSource(audio);
	const values = new Uint8Array(analyser.frequencyBinCount);
	let frameHandle = 0;

	analyser.fftSize = 256;
	source.connect(analyser);
	analyser.connect(context.destination);

	const draw = () => {
		if (audio.paused) {
			return;
		}

		analyser.getByteFrequencyData(values);
		drawFrequencyBars(canvas, values);
		frameHandle = requestAnimationFrame(draw);
	};

	audio.addEventListener('play', async () => {
		await context.resume();
		cancelAnimationFrame(frameHandle);
		frameHandle = requestAnimationFrame(draw);
	});

	audio.addEventListener('pause', () => {
		cancelAnimationFrame(frameHandle);
	});

	return function disconnectAudioAnalyser() {
		cancelAnimationFrame(frameHandle);
		source.disconnect();
		analyser.disconnect();
		context.close();
	};
}

function drawFrequencyBars(canvas, values) {
	const context = canvas.getContext('2d');
	const ratio = Math.min(devicePixelRatio || 1, 2);
	const width = canvas.width / ratio;
	const height = canvas.height / ratio;
	context.setTransform(ratio, 0, 0, ratio, 0, 0);
	context.clearRect(0, 0, width, height);
	context.fillStyle = 'rgba(255, 75, 216, .8)';

	for (let index = 0; index < values.length; index += 1) {
		const barHeight = Math.max(2, values[index] / 255 * height * 0.8);
		const x = index * width / values.length;
		context.fillRect(x, (height - barHeight) / 2, Math.max(1, width / 180), barHeight);
	}
}
