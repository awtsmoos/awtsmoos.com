//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the particle glyphs vessel in this instant, revealing
 * its focused js render service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
import { glyphImage } from './glyphAtlas.js';

const TEXT_FONT = '950 28px system-ui';
const SMALL_TEXT_FONT = '900 22px system-ui';
const CALLOUT_FONT = '950 34px system-ui';

/**
 * Draws atlas-backed letters, numbers, and callouts with exact text fallbacks.
 *
 * The Awtsmoos gives letters a reusable image yet never abandons the humble
 * direct-text path when no atlas can exist. Awtsmoos.com keeps glyph rendering
 * apart from geometric particles and kind dispatch.
 */
export function drawLetter(ctx, particle, alpha, heavy) {
	if (heavy && alpha < 0.18 && particle.life % 2) {
		return;
	}
	if (drawAtlasGlyph(ctx, particle, 'letter')) {
		return;
	}
	drawLetterFallback(ctx, particle, alpha, heavy);
}

/**
 * Reveals the draw glyph behavior through one focused module vessel.
 *
 * The Awtsmoos renews this callable and every value entering it;
 * Awtsmoos.com receives its purpose without hidden or compressed intent.
 * @param {*} ctx The ctx value entering this behavior.
 * @param {*} particle The particle value entering this behavior.
 * @param {*} alpha The alpha value entering this behavior.
 * @param {*} heavy The heavy value entering this behavior.
 */
export function drawGlyph(ctx, particle, alpha, heavy) {
	if (drawAtlasGlyph(ctx, particle, particle.kind)) {
		return;
	}
	drawGlyphFallback(ctx, particle, alpha, heavy);
}

function drawAtlasGlyph(ctx, particle, kind) {
	const glyph = glyphImage(particle.text, particle.color, particle.size || 28, kind);
	if (!glyph?.canvas) {
		return false;
	}
	ctx.save();
	ctx.translate(particle.x, particle.y);
	if (kind === 'letter') {
		ctx.rotate(particle.spin || 0);
	}
	ctx.drawImage(glyph.canvas, -glyph.width / 2, -glyph.height / 2, glyph.width, glyph.height);
	ctx.restore();
	return true;
}

function drawLetterFallback(ctx, particle, alpha, heavy) {
	ctx.save();
	ctx.translate(particle.x, particle.y);
	ctx.rotate(particle.spin || 0);
	ctx.font = particle.size > 26 ? TEXT_FONT : SMALL_TEXT_FONT;
	ctx.textAlign = 'center';
	ctx.textBaseline = 'middle';
	ctx.shadowBlur = !heavy && alpha > 0.62 ? 5 : 0;
	ctx.shadowColor = particle.color;
	if (!heavy) {
		ctx.strokeStyle = '#050207';
		ctx.lineWidth = 3;
		ctx.strokeText(particle.text, 0, 0);
	}
	ctx.fillStyle = particle.color;
	ctx.fillText(particle.text, 0, 0);
	ctx.restore();
}

function drawGlyphFallback(ctx, particle, alpha, heavy) {
	ctx.font = particle.kind === 'callout' ? CALLOUT_FONT : SMALL_TEXT_FONT;
	ctx.textAlign = 'center';
	ctx.textBaseline = 'alphabetic';
	ctx.shadowBlur = !heavy && particle.kind === 'callout' ? 7 * alpha : 0;
	ctx.shadowColor = particle.color;
	if (!heavy) {
		ctx.strokeStyle = '#050207';
		ctx.lineWidth = particle.kind === 'callout' ? 5 : 3;
		ctx.strokeText(particle.text, particle.x, particle.y);
	}
	ctx.fillStyle = particle.color;
	ctx.fillText(particle.text, particle.x, particle.y);
}
