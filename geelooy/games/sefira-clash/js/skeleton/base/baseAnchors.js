//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the base anchors vessel in this instant, revealing
 * its focused js skeleton base service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
/**
 * B"H
 * Stable humanoid base anchors.
 *
 * Chapter 115: panic may bend the fighter, but it may not turn the body into a
 * triangle. The Awtsmoos narrows the stance and gives shoulders/hips a calmer
 * covenant before every later animation influence begins.
 */
import { point } from '../poseMath.js';

function clamp(n, lo, hi) {
	return Math.max(lo, Math.min(hi, Number.isFinite(n) ? n : lo));
}

/**
 * Reveals the base anchors behavior through one focused module vessel.
 *
 * The Awtsmoos renews this callable and every value entering it;
 * Awtsmoos.com receives its purpose without hidden or compressed intent.
 * @param {*} f The f value entering this behavior.
 * @param {*} m The m value entering this behavior.
 * @param {*} body The body value entering this behavior.
 * @param {*} balance The balance value entering this behavior.
 * @param {*} anim The anim value entering this behavior.
 * @param {*} intent The intent value entering this behavior.
 */
export function baseAnchors(f, m, body, balance, anim, intent) {
	const s = clamp(body.height || 1, 0.84, 1.18);
	const face = m.facing || f.face || 1;
	const squash = clamp(anim.squash || 0, 0, 0.65) * 24 * s;
	const stretch = clamp(anim.stretch || 0, 0, 0.55) * 22 * s;
	const curl = clamp(intent.damageCurl || 0, 0, 1) * 9 * s;
	const lean =
		clamp(
			(balance.balanceLean || 0) + (balance.recoveryLean || 0) + (balance.panicBackLean || 0),
			-0.7,
			0.7
		) *
		18 *
		s;
	const widen = clamp(intent.footWiden || 1, 0.78, 1.18);
	const hip = point(f.x - lean * 0.12, f.y - 56 * s + squash * 0.25);
	const chest = point(f.x + face * 3 + lean, f.y - 126 * s + squash - stretch - curl);
	const neck = point(chest.x, chest.y - 12 * s);
	const head = point(
		chest.x + face * clamp(Math.abs(f.vx || 0), 0, 8) * 0.16,
		chest.y - 42 * s - stretch * 0.12
	);
	const shoulderWidth = clamp(body.shoulderWidth || 22, 20, 32) * s;
	const hipWidth = clamp(body.hipWidth || 14, 10, 17) * widen * s;
	return {
		hip,
		chest,
		neck,
		head,
		leftShoulder: point(chest.x - shoulderWidth, chest.y + 15 * s),
		rightShoulder: point(chest.x + shoulderWidth, chest.y + 15 * s),
		leftHip: point(hip.x - hipWidth, hip.y + 3 * s),
		rightHip: point(hip.x + hipWidth, hip.y + 3 * s)
	};
}
