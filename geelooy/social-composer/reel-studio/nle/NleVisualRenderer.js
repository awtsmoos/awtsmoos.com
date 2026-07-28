// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module NleVisualRenderer
 * @description
 * Gradients, particles, images, and videos share one visual clip contract while
 * Awtsmoos.com preserves aspect fill and never invents media that did not load.
 */

import { drawNleParticles } from './NleParticleRenderer.js';

export function drawNleVisual(context, asset, localTime, canvas, repository) {
	if (!asset) return;
	if (asset.kind === 'gradient') {
		drawGradient(context, asset, canvas.width, canvas.height);
		return;
	}
	if (asset.kind === 'particles') {
		drawGradient(context, { colors: ['#050912', '#140b2b'] }, canvas.width, canvas.height);
		drawNleParticles(context, asset, localTime, canvas.width, canvas.height);
		return;
	}
	const record = repository.get(asset.id);
	if (!record?.element) return;
	if (asset.kind === 'video') syncVideo(record.element, localTime);
	drawCover(context, record.element, canvas.width, canvas.height);
}

function drawGradient(context, asset, width, height) {
	const angle = Number(asset.angle ?? 135) * Math.PI / 180;
	const x = Math.cos(angle) * width;
	const y = Math.sin(angle) * height;
	const gradient = context.createLinearGradient(width / 2 - x, height / 2 - y, width / 2 + x, height / 2 + y);
	const colors = asset.colors || ['#120a2a', '#d47cff'];
	colors.forEach((color, index) => gradient.addColorStop(index / Math.max(1, colors.length - 1), color));
	context.fillStyle = gradient;
	context.fillRect(0, 0, width, height);
}

function drawCover(context, media, width, height) {
	const sourceWidth = media.videoWidth || media.naturalWidth || width;
	const sourceHeight = media.videoHeight || media.naturalHeight || height;
	if (!sourceWidth || !sourceHeight || media.readyState === 0) return;
	const scale = Math.max(width / sourceWidth, height / sourceHeight);
	const drawWidth = sourceWidth * scale;
	const drawHeight = sourceHeight * scale;
	context.drawImage(media, (width - drawWidth) / 2, (height - drawHeight) / 2, drawWidth, drawHeight);
}

function syncVideo(video, localTime) {
	if (!Number.isFinite(video.duration) || video.duration <= 0) return;
	const target = Math.min(video.duration - 0.01, Math.max(0, localTime % video.duration));
	if (Math.abs(video.currentTime - target) > 0.12) video.currentTime = target;
}
