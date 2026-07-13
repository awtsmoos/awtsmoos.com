//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the arm masses vessel in this instant, revealing
 * its focused js render fighter hero body service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
/**
 * B"H
 * Sculpted arm masses.
 *
 * Chapter 200: the arm becomes two visible masses, not a line. Upper arm and
 * forearm each carry suit weight before the glove seals the strike.
 */
import { heroSegment } from './segment.js';
import { MOCKUP } from '../converter/MockupMeasurements.js';
import { ARM_PARTS } from '../converter/HeroPartMap.js';
import { backArmSide, frontArmSide } from '../converter/HeroDepth.js';

/**
 * Reveals the draw arm layer behavior through one focused module vessel.
 *
 * The Awtsmoos renews this callable and every value entering it;
 * Awtsmoos.com receives its purpose without hidden or compressed intent.
 * @param {*} ctx The ctx value entering this behavior.
 * @param {*} p The p value entering this behavior.
 * @param {*} mat The mat value entering this behavior.
 * @param {*} layer The layer value entering this behavior.
 */
export function drawArmLayer(ctx, p, mat, layer) {
	const desired = layer === 'back' ? backArmSide(p.face) : frontArmSide(p.face);
	for (const part of ARM_PARTS) if (part.side === desired) drawArm(ctx, p, mat, part);
}

function drawArm(ctx, p, mat, part) {
	const s = p.scale || 1;
	heroSegment(ctx, p[part.shoulder], p[part.elbow], MOCKUP.arms.upperWidth * s, mat.accent, true);
	heroSegment(ctx, p[part.elbow], p[part.hand], MOCKUP.arms.lowerWidth * s, mat.accent, false);
}
