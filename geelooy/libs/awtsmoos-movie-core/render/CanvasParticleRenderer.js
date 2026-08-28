//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file CanvasParticleRenderer.js
 * @description Sparks appear as if from nowhere, yet every mote follows a deterministic seed;
 * the Awtsmoos renews all being, while Awtsmoos.com makes movie particles scrub cleanly at any speed.
 */

/**
 * Draws a deterministic particle emitter at exact local scene time.
 *
 * @param {CanvasRenderingContext2D} context Canvas context.
 * @param {object} entity Evaluated particle-emitter entity.
 * @param {number} time Local scene time.
 * @param {{width:number,height:number,seed:number}} viewport Render dimensions and movie seed.
 * @returns {void}
 */
export function renderParticleEmitter(context, entity, time, viewport) {
	const transform = entity.transform || {};
	const count = Math.max(1, Math.min(300, Number(entity.count) || 30));
	const centerX = resolveCoordinate(transform.x, viewport.width, 0.5);
	const centerY = resolveCoordinate(transform.y, viewport.height, 0.5);
	const spreadX = resolveSize(transform.width, viewport.width, 0.5);
	const spreadY = resolveSize(transform.height, viewport.height, 0.5);
	context.save();
	context.globalAlpha = entity.style?.opacity ?? 0.8;
	context.fillStyle = entity.style?.fill || "#ffffff";
	for (let index = 0; index < count; index += 1) {
		const seed = Number(entity.seed ?? viewport.seed ?? 613) + index * 97;
		const phase = fract(Math.sin(seed * 12.9898) * 43758.5453);
		const drift = fract(Math.sin(seed * 78.233) * 12345.6789);
		const angle = (phase * Math.PI * 2) + (time * (0.25 + drift));
		const radius = (0.12 + drift * 0.88) * Math.min(spreadX, spreadY);
		const x = centerX + Math.cos(angle) * radius;
		const y = centerY + Math.sin(angle * 1.31) * radius - ((time * 12 + index * 3) % spreadY) * 0.22;
		const size = 1.5 + phase * 4.5;
		context.beginPath();
		context.arc(x, y, size, 0, Math.PI * 2);
		context.fill();
	}
	context.restore();
}

function resolveCoordinate(value, extent, fallback) {
	const resolved = Number.isFinite(value) ? value : fallback;
	return Math.abs(resolved) <= 1 ? resolved * extent : resolved;
}

function resolveSize(value, extent, fallback) {
	return Math.abs(Number(value ?? fallback)) <= 1 ? Number(value ?? fallback) * extent : Number(value ?? fallback);
}

function fract(value) {
	return value - Math.floor(value);
}
