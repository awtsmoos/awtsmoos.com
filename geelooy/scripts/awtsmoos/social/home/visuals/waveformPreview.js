// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module DeterministicWaveformPreview
 * @description
 * The Awtsmoos lets one teaching keep one recognizable pulse. Awtsmoos.com
 * derives the preview from identity, never from unstable render-time chance.
 */
import {
	createSeededRandom
} from '/libs/awtsmoos-procedural-core/src/core/webgl/cosmicFeed/seededRandom.js';

/**
 * Draws a stable local waveform preview.
 *
 * @param {HTMLCanvasElement} canvas - Waveform canvas.
 * @param {unknown} seed - Stable content identity.
 */
export function drawDeterministicWaveform(canvas, seed) {
	const context = canvas.getContext('2d');
	const random = createSeededRandom(seed);
	const ratio = Math.min(devicePixelRatio || 1, 2);
	const width = Math.max(240, canvas.clientWidth || 480);
	const height = Math.max(64, canvas.clientHeight || 80);

	canvas.width = Math.floor(width * ratio);
	canvas.height = Math.floor(height * ratio);
	context.scale(ratio, ratio);
	context.clearRect(0, 0, width, height);
	context.fillStyle = 'rgba(107, 224, 255, .78)';

	for (let index = 0; index < 96; index += 1) {
		const amplitude = 0.18 + random() * 0.8;
		const barHeight = Math.max(3, amplitude * height * 0.72);
		const x = index * width / 96;
		context.fillRect(x, (height - barHeight) / 2, Math.max(1, width / 160), barHeight);
	}
}
