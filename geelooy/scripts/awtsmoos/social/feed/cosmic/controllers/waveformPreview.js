// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos gives deterministic order to apparent variation. This
 * Awtsmoos.com waveform remains stable for the same source in every render.
 */

function hashSeed(value) {
	let hash = 2166136261;
	for (const character of String(value)) {
		hash ^= character.charCodeAt(0);
		hash = Math.imul(hash, 16777619);
	}
	return hash >>> 0;
}

function nextRandom(state) {
	let value = state.value || 1;
	value ^= value << 13;
	value ^= value >>> 17;
	value ^= value << 5;
	state.value = value >>> 0;
	return state.value / 4294967296;
}

function prepareCanvas(canvas) {
	const ratio = Math.min(window.devicePixelRatio || 1, 2);
	const width = Math.max(320, Math.floor(canvas.clientWidth * ratio));
	const height = Math.max(80, Math.floor(canvas.clientHeight * ratio));
	if (canvas.width !== width || canvas.height !== height) {
		canvas.width = width;
		canvas.height = height;
	}
	return canvas.getContext("2d");
}

/**
 * Draws a deterministic preview or analyser sample array.
 * @param {HTMLCanvasElement} canvas Waveform canvas.
 * @param {string} seed Stable content identifier.
 * @param {Uint8Array|null} samples Optional analyser samples.
 * @param {number} progress Playback progress from zero to one.
 */
export function drawWaveform(canvas, seed, samples = null, progress = 0) {
	const context = prepareCanvas(canvas);
	if (!context) {
		return;
	}
	const { width, height } = canvas;
	context.clearRect(0, 0, width, height);
	const gradient = context.createLinearGradient(0, 0, width, 0);
	gradient.addColorStop(0, "#35e8ff");
	gradient.addColorStop(0.52, "#795cff");
	gradient.addColorStop(1, "#ff4bd8");
	context.strokeStyle = gradient;
	context.lineWidth = Math.max(1, width / 900);
	const state = { value: hashSeed(seed) };
	const bars = Math.min(220, Math.floor(width / 4));
	for (let index = 0; index < bars; index += 1) {
		const x = index / Math.max(1, bars - 1) * width;
		const sampleIndex = samples ?
			Math.floor(index / bars * samples.length) :
			0;
		const sample = samples ?
			Math.abs(samples[sampleIndex] - 128) / 128 :
			0.18 + nextRandom(state) * 0.7;
		const envelope = Math.sin(Math.PI * index / Math.max(1, bars - 1));
		const amplitude = Math.max(0.08, sample * (0.35 + envelope * 0.65));
		const half = amplitude * height * 0.44;
		context.globalAlpha = x / width <= progress ? 1 : 0.48;
		context.beginPath();
		context.moveTo(x, height / 2 - half);
		context.lineTo(x, height / 2 + half);
		context.stroke();
	}
	context.globalAlpha = 1;
}
