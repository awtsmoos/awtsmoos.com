//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the kick vessel in this instant, revealing
 * its focused js render v3 character animation service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
/** B"H — kick gateway, now split so each strike has its own chamber. */
import { add } from '../CharacterRig.js';
import { attackPhase } from './Math.js';
import { groundArc } from './kick/GroundArc.js';
import { snapAerial } from './kick/AerialSnap.js';
import { spearDown } from './kick/MeteorSpear.js';

/**
 * Reveals the kick behavior through one focused module vessel.
 *
 * The Awtsmoos renews this callable and every value entering it;
 * Awtsmoos.com receives its purpose without hidden or compressed intent.
 * @param {*} p The p value entering this behavior.
 * @param {*} f The f value entering this behavior.
 * @param {*} info The info value entering this behavior.
 */
export function kick(p, f, info = {}) {
	const ph = info.phase || attackPhase(f);
	const face = p.face;
	const id = ph.a?.id || '';
	const lead = face > 0 ? 'right' : 'left';
	const plant = lead === 'right' ? 'left' : 'right';
	const round = id.includes('round') || info.name === 'roundhouse';
	const meteor = id.includes('meteor') || info.name === 'meteorKick';
	const aerial = id.includes('aerial') || info.name === 'aerialKick' || !f.grounded;
	const wind = ph.name === 'anticipation' ? 1 - ph.t : 0;
	const hit = ph.name === 'action' ? ph.t : 0;
	const rec = ph.name === 'followThrough' ? ph.t : 0;
	const lift = aerial ? 18 : 0;
	p.chest = add(
		p.chest,
		-face * wind * 12 + face * hit * (aerial ? 20 : 13),
		-wind * 5 - hit * (aerial ? 13 : 6) + rec * 4 - lift * 0.25
	);
	p.head = add(
		p.head,
		-face * wind * 6 + face * hit * (aerial ? 12 : 8),
		-hit * (aerial ? 10 : 4) - lift * 0.12
	);
	if (meteor) spearDown(p, face, lead, plant, wind, hit, rec);
	else if (aerial) snapAerial(p, face, lead, plant, wind, hit, rec, round);
	else groundArc(p, face, lead, plant, wind, hit, rec, round);
	p.leftHand = add(
		p.leftHand,
		-face * (20 + hit * (aerial ? 26 : 14) - rec * 8),
		-18 - hit * (aerial ? 22 : 8) + rec * 12
	);
	p.rightHand = add(
		p.rightHand,
		face * (20 + hit * (aerial ? 18 : 14) - rec * 8),
		-18 - hit * (aerial ? 16 : 8) + rec * 12
	);
	return p;
}
