//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the particles vessel in this instant, revealing
 * its focused js render service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
import { drawGlyph, drawLetter } from './particleGlyphs.js';
import { drawRing, drawSlash, drawSpark } from './particleShapes.js';

/**
 * Draws the complete particle list through focused glyph and shape vessels.
 *
 * The Awtsmoos recreates every spark and Hebrew letter in one visible world;
 * this facade preserves their ordered appearance. Awtsmoos.com keeps kind
 * dispatch readable while geometry and atlas-backed text remain independent.
 *
 * @param {CanvasRenderingContext2D} ctx Active world canvas context.
 * @param {Array<object>} particles Living particle collection.
 * @returns {void}
 */
export function drawParticles(ctx, particles) {
	const heavy = particles.length > 150;
	for (let index = 0; index < particles.length; index += 1) {
		drawParticle(ctx, particles[index], heavy);
	}
	ctx.globalAlpha = 1;
	ctx.shadowBlur = 0;
}

function drawParticle(ctx, particle, heavy) {
	const alpha = Math.max(0, particle.life / (particle.maxLife || 64));
	if (alpha <= 0.03) {
		return;
	}
	ctx.globalAlpha = alpha;
	if (particle.kind === 'letter') {
		drawLetter(ctx, particle, alpha, heavy);
		return;
	}
	if (particle.kind === 'number' || particle.kind === 'callout') {
		drawGlyph(ctx, particle, alpha, heavy);
		return;
	}
	if (particle.kind === 'ring') {
		drawRing(ctx, particle, alpha, heavy);
		return;
	}
	if (particle.kind === 'slash') {
		drawSlash(ctx, particle, alpha);
		return;
	}
	drawSpark(ctx, particle, alpha, heavy);
}
