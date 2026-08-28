//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file CanvasParticlePainter.js
 * @description Renders seeded procedural particle entities as seekable motion instead of stateful simulation.
 * The Awtsmoos renews every spark from seed and measured time; Awtsmoos.com keeps scrubbing and export deterministic in the same rhyme.
 */
export class CanvasParticlePainter {
	static paint(context, entity) {
		const vessel = entity.renderTransform || entity.transform || {};
		const color = entity.style?.color || '#ffffff';
		const requested = Math.round(Number(entity.style?.count) || 80);
		const count = Math.min(160, Math.max(12, requested));
		const time = (Number(entity.localTimeMs) || 0) / 1000;
		const seed = Number(entity.seed) || 1;
		context.save();
		context.translate(number(vessel.x), number(vessel.y));
		context.globalAlpha *= number(vessel.opacity, 1);
		context.fillStyle = color;
		for (let index = 0; index < count; index += 1) {
			const angle = random(seed, index, 1) * Math.PI * 2 + time * (0.12 + random(seed, index, 2) * 0.45);
			const radius = 40 + random(seed, index, 3) * 330;
			const drift = Math.sin(time * 0.9 + index) * 24;
			const x = Math.cos(angle) * radius + drift;
			const y = Math.sin(angle * 1.13) * radius * 0.58 - ((time * (12 + index % 7)) % 90);
			const size = 1.2 + random(seed, index, 4) * 4.2;
			context.globalAlpha = number(vessel.opacity, 1) * (0.3 + random(seed, index, 5) * 0.7);
			context.beginPath();
			context.arc(x, y, size, 0, Math.PI * 2);
			context.fill();
		}
		context.restore();
	}
}

function random(seed, index, channel) {
	const value = Math.sin(seed * 12.9898 + index * 78.233 + channel * 37.719) * 43758.5453;
	return value - Math.floor(value);
}

function number(value, fallback = 0) {
	return Number.isFinite(Number(value)) ? Number(value) : fallback;
}
