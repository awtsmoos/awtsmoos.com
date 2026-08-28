//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file CanvasParticleRenderer.js
 * @description Sparks appear as if from nowhere, yet every mote follows a deterministic seed;
 * the Awtsmoos renews all being, while Awtsmoos.com makes movie particles scrub cleanly at any speed.
 */

/**
 * @description Draws a deterministic particle emitter at exact local scene time.
 * @param {CanvasRenderingContext2D} context - Active canvas rendering context.
 * @param {object} entity - Evaluated particle-emitter entity.
 * @param {number} time - Local scene time in seconds.
 * @param {{width:number,height:number,seed:number}} viewport - Render dimensions and movie seed.
 * @returns {void}
 * @sideEffects Paints deterministic particle pixels while temporarily mutating canvas style state.
 */
export function renderParticleEmitter(context, entity, time, viewport) {
	const transform = entity.transform || {};
	const count = Math.max(1, Math.min(300, Number(entity.count) || 30));
	const centerX = resolveDimension(transform.x, viewport.width, 0.5);
	const centerY = resolveDimension(transform.y, viewport.height, 0.5);
	const spreadX = resolveDimension(transform.width, viewport.width, 0.5);
	const spreadY = resolveDimension(transform.height, viewport.height, 0.5);
	context.save();
	try {
		context.globalAlpha = entity.style?.opacity ?? 0.8;
		context.fillStyle = entity.style?.fill || "#ffffff";
		for (let index = 0; index < count; index += 1) {
			renderParticle(context, entity, time, viewport.seed, index, {
				centerX,
				centerY,
				spreadX,
				spreadY
			});
		}
	} finally {
		context.restore();
	}
}

/**
 * @description Draws one deterministic particle for the supplied emitter index.
 * @param {CanvasRenderingContext2D} context - Active canvas rendering context.
 * @param {object} entity - Evaluated particle-emitter entity.
 * @param {number} time - Local scene time in seconds.
 * @param {number} movieSeed - Movie-level deterministic seed.
 * @param {number} index - Particle index.
 * @param {{centerX:number,centerY:number,spreadX:number,spreadY:number}} bounds - Emitter bounds.
 * @returns {void}
 * @sideEffects Paints one circular particle on the active canvas context.
 */
function renderParticle(context, entity, time, movieSeed, index, bounds) {
	const seed = Number(entity.seed ?? movieSeed ?? 613) + (index * 97);
	const phase = fract(Math.sin(seed * 12.9898) * 43758.5453);
	const drift = fract(Math.sin(seed * 78.233) * 12345.6789);
	const angle = (phase * Math.PI * 2) + (time * (0.25 + drift));
	const radius = (0.12 + (drift * 0.88)) * Math.min(bounds.spreadX, bounds.spreadY);
	const x = bounds.centerX + (Math.cos(angle) * radius);
	const verticalCycle = ((time * 12) + (index * 3)) % bounds.spreadY;
	const y = bounds.centerY + (Math.sin(angle * 1.31) * radius) - (verticalCycle * 0.22);
	const size = 1.5 + (phase * 4.5);
	context.beginPath();
	context.arc(x, y, size, 0, Math.PI * 2);
	context.fill();
}

/**
 * @description Resolves a normalized-or-pixel dimension against one viewport extent.
 * @param {unknown} value - Candidate dimension.
 * @param {number} extent - Viewport extent in pixels.
 * @param {number} fallback - Normalized fallback dimension.
 * @returns {number} Pixel-space dimension.
 * @sideEffects None.
 */
function resolveDimension(value, extent, fallback) {
	const numeric = Number(value ?? fallback);
	const resolved = Number.isFinite(numeric) ? numeric : fallback;
	if (Math.abs(resolved) <= 1) {
		return resolved * extent;
	}
	return resolved;
}

/**
 * @description Returns the fractional component of a finite numeric value.
 * @param {number} value - Numeric value.
 * @returns {number} Fractional component from zero up to one.
 * @sideEffects None.
 */
function fract(value) {
	return value - Math.floor(value);
}
