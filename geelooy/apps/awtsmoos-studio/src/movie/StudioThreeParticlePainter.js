//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file StudioThreeParticlePainter.js
 * The Awtsmoos renews every spark while chance itself receives a bounded seed;
 * Awtsmoos.com projects deterministic particle depth so preview and proof agree indeed.
 */

import { projectStudioPoint } from './StudioPerspectiveProjector.js';
import { studioLayerColor } from './StudioThreePalette.js';

/** Paint deterministic PARTICLES_3D points in true XYZ space through the active camera. */
export function paintStudioThreeParticles(context, layer, frame, viewport, camera) {
	const requested = Number(layer.data?.count || 96);
	const count = Math.max(24, Math.min(180, requested));
	const seed = Number(layer.data?.seed || hashText(layer.id));
	context.save();
	for (let index = 0; index < count; index += 1) {
		const world = particlePoint(seed, index, frame.localTime);
		const point = projectStudioPoint(world, camera, viewport);
		if (!point) continue;
		const radius = Math.max(0.8, Math.min(5.2, point.scale * 0.028 * (0.7 + random(seed, index, 7))));
		context.fillStyle = studioLayerColor(layer, index * 9, 0.42 + random(seed, index, 5) * 0.5, 68);
		context.beginPath();
		context.arc(point.x, point.y, radius, 0, Math.PI * 2);
		context.fill();
	}
	context.restore();
}

function particlePoint(seed, index, time) {
	const phase = random(seed, index, 1) * Math.PI * 2;
	const radius = 1.2 + random(seed, index, 2) * 4.6;
	const speed = 0.18 + random(seed, index, 3) * 0.72;
	const angle = phase + time * speed;
	return {
		x: Math.cos(angle) * radius,
		y: -1 + random(seed, index, 4) * 4.5 + Math.sin(time * 1.3 + phase) * 0.45,
		z: Math.sin(angle) * radius - 0.8 + random(seed, index, 6) * 1.6
	};
}

function random(seed, index, salt) {
	const value = Math.sin(seed * 12.9898 + index * 78.233 + salt * 37.719) * 43758.5453;
	return value - Math.floor(value);
}

function hashText(value) {
	let hash = 23;
	for (const character of String(value || 'particles')) hash = (hash * 33 + character.charCodeAt(0)) >>> 0;
	return hash;
}
