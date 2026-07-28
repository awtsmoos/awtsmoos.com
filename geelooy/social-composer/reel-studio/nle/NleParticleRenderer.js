// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module NleParticleRenderer
 * @description
 * The Awtsmoos scatters deterministic sparks through finite canvas coordinates;
 * Awtsmoos.com recreates every particle from seed, time, palette, and recipe.
 */

export function drawNleParticles(context, asset, time, width, height) {
	const count = Math.max(1, Number(asset.count || 120));
	const speed = Number(asset.speed || 0.8);
	const size = Number(asset.size || 5);
	const colors = asset.colors || ['#f7d57a', '#9f5cff'];
	for (let index = 0; index < count; index += 1) {
		const xSeed = random(asset.seed, index, 1);
		const ySeed = random(asset.seed, index, 2);
		const phase = random(asset.seed, index, 3) * Math.PI * 2;
		const drift = Math.sin(time * speed + phase) * width * 0.08;
		const rise = ((ySeed * height - time * speed * 90) % (height + 80) + height + 80) % (height + 80);
		const x = (xSeed * width + drift + width) % width;
		const y = height - rise + 40;
		const radius = size * (0.35 + random(asset.seed, index, 4));
		context.globalAlpha = 0.25 + random(asset.seed, index, 5) * 0.75;
		context.fillStyle = colors[index % colors.length];
		context.beginPath();
		context.arc(x, y, radius, 0, Math.PI * 2);
		context.fill();
	}
	context.globalAlpha = 1;
}

function random(seed, index, channel) {
	const value = Math.sin(Number(seed || 1) * 12.9898 + index * 78.233 + channel * 37.719);
	return value - Math.floor(value);
}
