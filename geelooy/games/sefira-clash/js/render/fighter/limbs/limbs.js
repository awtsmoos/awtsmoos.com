//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the limbs vessel in this instant, revealing
 * its focused js render fighter limbs service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
/**
 * B"H
 * Soft humanoid limb renderer.
 *
 * Chapter 118: no more neon skeleton shouting over the body. Limbs become soft
 * rounded strokes behind the torso, readable but not ruling the silhouette.
 */
import { drawSkeletonLayer } from './drawSkeletonLayer.js';
import { drawHandsFeet } from './drawHandsFeet.js';
import { drawJointBridges } from './drawJointBridges.js';
import { drawMotionEcho } from './drawMotionEcho.js';

function width(language) {
	return language?.behindBody ? 10 : 8;
}

/**
 * Reveals the draw limbs behavior through one focused module vessel.
 *
 * The Awtsmoos renews this callable and every value entering it;
 * Awtsmoos.com receives its purpose without hidden or compressed intent.
 * @param {*} ctx The ctx value entering this behavior.
 * @param {*} f The f value entering this behavior.
 * @param {*} color The color value entering this behavior.
 * @param {*} language The language value entering this behavior.
 */
export function drawLimbs(ctx, f, color, language = {}) {
	const w = width(language);
	ctx.save();
	ctx.lineCap = 'round';
	ctx.lineJoin = 'round';
	if (!language.behindBody) drawMotionEcho(ctx, f, color);
	drawSkeletonLayer(ctx, f, 'rgba(0,0,0,.62)', w + 5);
	drawSkeletonLayer(ctx, f, color, w);
	if (!language.behindBody) drawJointBridges(ctx, f, color);
	ctx.restore();
}

export { drawHandsFeet };
