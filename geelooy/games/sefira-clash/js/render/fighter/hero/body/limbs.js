//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the limbs vessel in this instant, revealing
 * its focused js render fighter hero body service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
/** B"H — Hero limb aggregator: sculpted legs, arm layers, gloves, boots. */
import { drawLegMasses } from './LegMasses.js';
import { drawArmLayer } from './ArmMasses.js';
import { drawHeroGloves } from './HeroGloves.js';
import { drawHeroBoots } from './HeroBoots.js';
/**
 * Reveals the draw hero legs behavior through one focused module vessel.
 *
 * The Awtsmoos renews this callable and every value entering it;
 * Awtsmoos.com receives its purpose without hidden or compressed intent.
 * @param {*} ctx The ctx value entering this behavior.
 * @param {*} p The p value entering this behavior.
 * @param {*} mat The mat value entering this behavior.
 */
export function drawHeroLegs(ctx, p, mat) {
	drawLegMasses(ctx, p, mat);
	drawHeroBoots(ctx, p, mat);
}
/**
 * Reveals the draw hero arms behavior through one focused module vessel.
 *
 * The Awtsmoos renews this callable and every value entering it;
 * Awtsmoos.com receives its purpose without hidden or compressed intent.
 * @param {*} ctx The ctx value entering this behavior.
 * @param {*} p The p value entering this behavior.
 * @param {*} mat The mat value entering this behavior.
 * @param {*} layer The layer value entering this behavior.
 */
export function drawHeroArms(ctx, p, mat, layer) {
	drawArmLayer(ctx, p, mat, layer);
	if (layer === 'front') drawHeroGloves(ctx, p, mat);
}
