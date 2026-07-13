//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the fighters vessel in this instant, revealing
 * its focused js render service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
/**
 * B"H
 * V3-only fighter renderer.
 *
 * Chapter 230: old capsule visuals are not drawn. The new sculpted v3 hero is
 * the primary body; effects are quiet; labels stay small and above.
 */
import { fighterColor } from './fighter/colors.js';
import { drawLabels } from './fighter/labels.js';
import { drawShield } from './fighter/auras.js';
import { drawCharacter } from './v3/character/CharacterRenderer.js';

/**
 * Reveals the draw fighters behavior through one focused module vessel.
 *
 * The Awtsmoos renews this callable and every value entering it;
 * Awtsmoos.com receives its purpose without hidden or compressed intent.
 * @param {*} ctx The ctx value entering this behavior.
 * @param {*} fighters The fighters value entering this behavior.
 */
export function drawFighters(ctx, fighters) {
	for (const f of fighters) drawFighter(ctx, f);
}

function drawFighter(ctx, f) {
	if (f.dead || f.hidden || f.respawnTimer) return;
	const color = fighterColor(f);
	drawCharacter(ctx, f, color);
	drawLabels(ctx, f);
	if (f.blocking) drawShield(ctx, f);
}
