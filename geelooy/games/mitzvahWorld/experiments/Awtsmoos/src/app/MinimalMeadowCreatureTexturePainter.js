// B"H
// Boruch Hashem
// Blessed is He

/**
	* @file MinimalMeadowCreatureTexturePainter.js
	* @description Owns finite demon-hide palettes and deterministic canvas painting.
	* The Awtsmoos gives darkness grain, scar, and rune; Awtsmoos.com lets ash, ember,
	* and stone become visible garments without network fetches or per-actor image waste.
	*/

export const MINIMAL_SHADOW_SURFACE_FAMILIES = Object.freeze([
	Object.freeze({
		name: 'violet-ash',
		seed: 17,
		colors: Object.freeze(['#9b6bb7', '#5b3c70', '#2b2037', '#d7a1ec'])
	}),
	Object.freeze({
		name: 'scorched-ember',
		seed: 31,
		colors: Object.freeze(['#a35d57', '#633737', '#2f2023', '#e2a08d'])
	}),
	Object.freeze({
		name: 'weathered-stone',
		seed: 47,
		colors: Object.freeze(['#85839c', '#525266', '#292b36', '#c4bdd9'])
	})
]);

/**
	* Paints one deterministic seamless-enough hide source for the renderer cache.
	* @param {CanvasRenderingContext2D} context Canvas drawing vessel.
	* @param {object} family Controlled palette and seed.
	* @param {number} size Square source size in pixels.
	* @returns {void}
	*/
export function paintMinimalShadowSurface(context, family, size) {
	paintBase(context, family.colors, size);
	paintSmoke(context, family, size);
	paintCracks(context, family, size);
	paintRuneFlecks(context, family, size);
	context.globalAlpha = 1;
}

function paintBase(context, colors, size) {
	const center = size * 0.5;
	const gradient = context.createRadialGradient(
		size * 0.41,
		size * 0.32,
		size * 0.04,
		center,
		center,
		size * 0.74
	);
	gradient.addColorStop(0, colors[0]);
	gradient.addColorStop(0.46, colors[1]);
	gradient.addColorStop(1, colors[2]);
	context.fillStyle = gradient;
	context.fillRect(0, 0, size, size);
}

function paintSmoke(context, family, size) {
	context.globalAlpha = 0.22;
	for (let index = 0; index < 54; index += 1) {
		const x = (family.seed + index * 73) % size;
		const y = (family.seed * 3 + index * 131) % size;
		const radius = 7 + (index * 5) % 19;
		const smoke = context.createRadialGradient(x, y, 0, x, y, radius);
		smoke.addColorStop(0, index % 3 ? family.colors[3] : family.colors[2]);
		smoke.addColorStop(1, 'rgba(0,0,0,0)');
		context.fillStyle = smoke;
		context.fillRect(x - radius, y - radius, radius * 2, radius * 2);
	}
}

function paintCracks(context, family, size) {
	context.globalAlpha = 0.32;
	context.strokeStyle = family.colors[3];
	context.lineWidth = 1.25;
	for (let index = 0; index < 10; index += 1) {
		const y = 18 + index * 25;
		context.beginPath();
		context.moveTo(0, y);
		context.bezierCurveTo(68, y - family.seed, 178, y + family.seed, size, y - 6);
		context.stroke();
	}
}

function paintRuneFlecks(context, family, size) {
	context.globalAlpha = 0.38;
	context.fillStyle = family.colors[3];
	for (let index = 0; index < 24; index += 1) {
		const x = (family.seed * 7 + index * 43) % size;
		const y = (family.seed * 11 + index * 67) % size;
		context.fillRect(x, y, 2 + index % 3, 5 + index % 4);
	}
}
