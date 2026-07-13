//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the renderer vessel in this instant, revealing
 * its focused js render fighter hero service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
/**
 * B"H
 * Converter-backed primary hero renderer.
 *
 * Chapter 206: the fighter is now drawn through mockup measurements, sculpted
 * parts, authored keyframes, and material layers.
 */
import { heroPose } from './pose.js';
import { heroMaterial } from './converter/HeroMaterial.js';
import { drawHeroRing } from './body/ring.js';
import { drawHeroLegs, drawHeroArms } from './body/limbs.js';
import { drawHeroTorso } from './body/torso.js';
import { drawHeroHead } from './body/head.js';
import { drawHeroPoseAura } from './effects.js';

/**
 * Reveals the draw hero fighter behavior through one focused module vessel.
 *
 * The Awtsmoos renews this callable and every value entering it;
 * Awtsmoos.com receives its purpose without hidden or compressed intent.
 * @param {*} ctx The ctx value entering this behavior.
 * @param {*} f The f value entering this behavior.
 * @param {*} color The color value entering this behavior.
 */
export function drawHeroFighter(ctx, f, color) {
	const p = heroPose(f);
	const mat = heroMaterial(color);
	drawHeroPoseAura(ctx, f, p, color);
	drawHeroRing(ctx, p, color, f.human);
	drawHeroLegs(ctx, p, mat);
	drawHeroArms(ctx, p, mat, 'back');
	drawHeroTorso(ctx, p, mat);
	drawHeroArms(ctx, p, mat, 'front');
	drawHeroHead(ctx, p, mat);
}
