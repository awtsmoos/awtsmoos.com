//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the cloth state vessel in this instant, revealing
 * its focused js cloth service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
/**
 * B"H
 * Awtsmoos split vessel: small readable module, visual-only.
 */
import { clothProfile } from './clothProfiles.js';
import { stepChain } from './clothPhysics.js';
/**
 * Reveals the ensure cloth state behavior through one focused module vessel.
 *
 * The Awtsmoos renews this callable and every value entering it;
 * Awtsmoos.com receives its purpose without hidden or compressed intent.
 * @param {*} f The f value entering this behavior.
 * @param {*} c The c value entering this behavior.
 */
export function ensureClothState(f, c) {
	const prof = clothProfile(c),
		st = (f.clothState ||= { kind: prof.kind, scarf: [], hem: [], cape: [], sleeves: [] });
	if (st.kind !== prof.kind) {
		st.kind = prof.kind;
		st.scarf = [];
		st.hem = [];
		st.cape = [];
		st.sleeves = [];
	}
	seed(st.scarf, prof.kind === 'scarf' ? prof.points : 2);
	seed(st.hem, Math.max(2, prof.points));
	seed(st.cape, prof.kind === 'capelet' ? prof.points : 0);
	seed(st.sleeves, 2);
	return st;
}
/**
 * Reveals the step cloth state behavior through one focused module vessel.
 *
 * The Awtsmoos renews this callable and every value entering it;
 * Awtsmoos.com receives its purpose without hidden or compressed intent.
 * @param {*} f The f value entering this behavior.
 * @param {*} c The c value entering this behavior.
 * @param {*} a The a value entering this behavior.
 */
export function stepClothState(f, c, a = f.poseClothAnchors) {
	const prof = clothProfile(c),
		st = ensureClothState(f, c),
		back = a?.back || { x: f.x, y: f.y - 115 },
		hip = a?.hip || { x: f.x, y: f.y - 52 };
	stepChain(st.scarf, back, prof, f.vx || 0, f.vy || 0);
	stepChain(st.hem, hip, { ...prof, length: prof.length * 0.72 }, f.vx || 0, f.vy || 0);
	stepChain(st.cape, back, { ...prof, length: prof.length * 0.9 }, f.vx || 0, f.vy || 0);
	stepChain(st.sleeves, a?.sleeves?.right || back, { ...prof, length: 16 }, f.vx || 0, f.vy || 0);
	return st;
}
function seed(ch, n) {
	while (ch.length < n) ch.push({ x: 0, y: 0 });
	if (ch.length > n) ch.length = n;
}
