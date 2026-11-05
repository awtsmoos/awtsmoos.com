// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file TalkingMouth.js
 * @description A mouth that talks. The canonical Chossid GLB ships two authored
 * mouth morphs — "O" (open round) and "S" (teeth-pressed sibilant) — plus real
 * teeth geometry. This driver turns text into living lip-sync: every character
 * of speech becomes a viseme, visemes become morph weights, and the mouth moves
 * with the words. Jaw motion comes free: the O morph carries the lower face.
 *
 * Usage:
 *   const talker = speakText(model, "Shalom aleichem!");
 *   // ...in the render loop: talker.update(nowSeconds); when done: talker.stop()
 */

const MORPH_O = 'O';
const MORPH_S = 'S';

/** Character → [openWeight, sibilantWeight]. Tuned by mouth shape, not IPA. */
function visemeFor(ch) {
	const c = ch.toLowerCase();
	if ('aouou'.includes(c)) return [0.95, 0.0];          // open vowels → O
	if ('eiy'.includes(c)) return [0.55, 0.25];           // spread vowels → half O
	if ('sz'.includes(c) || c === 'x') return [0.08, 0.9]; // sibilants → S teeth
	if ('fv'.includes(c)) return [0.25, 0.55];           // labiodental → teeth+lip
	if ('mbp'.includes(c)) return [0.0, 0.0];            // bilabials → closed
	if ('lr'.includes(c)) return [0.35, 0.3];            // liquids → mid
	if ('tdn'.includes(c)) return [0.3, 0.45];           // alveolars → teeth
	if ('kghj'.includes(c)) return [0.5, 0.1];           // velars/glottals → open
	if (c === ' ' || c === '\n') return [0.0, 0.0];      // pauses → rest
	if (',;:.!?—-'.includes(c)) return [0.12, 0.0];       // punctuation → near rest
	return [0.4, 0.2];                                   // default murmur
}

function setMorph(model, name, value) {
	let count = 0;
	model.traverse(object => {
		if ((object.isMesh || object.isSkinnedMesh) && object.morphTargetDictionary) {
			const i = object.morphTargetDictionary[name];
			if (i !== undefined) {
				object.morphTargetInfluences[i] = Math.max(0, Math.min(1, value));
				count++;
			}
		}
	});
	return count;
}

/**
 * Speaks text through the model's mouth. Returns a controller; call update(t)
 * every frame with seconds. CPS = characters per second (speech rate).
 */
export function speakText(model, text, opts = {}) {
	const cps = opts.cps || 11;
	const chars = String(text || '').split('');
	const plan = chars.map(visemeFor);
	const duration = Math.max(0.4, chars.length / cps) + 0.35;
	let stopped = false;
	let lastO = -1, lastS = -1;

	function poseAt(t) {
		if (t <= 0 || t >= duration) return [0, 0];
		const idx = Math.min(plan.length - 1, Math.floor(t * cps));
		const frac = (t * cps) - Math.floor(t * cps);
		const [o0, s0] = plan[idx];
		const [o1, s1] = plan[Math.min(plan.length - 1, idx + 1)] || [0, 0];
		// Smoothstep between visemes so the mouth glides instead of snapping.
		const k = frac * frac * (3 - 2 * frac);
		return [o0 + (o1 - o0) * k, s0 + (s1 - s0) * k];
	}

	return {
		duration,
		update(t) {
			if (stopped) return false;
			const [o, s] = poseAt(t);
			if (Math.abs(o - lastO) > 0.004) { setMorph(model, MORPH_O, o); lastO = o; }
			if (Math.abs(s - lastS) > 0.004) { setMorph(model, MORPH_S, s); lastS = s; }
			if (t >= duration) { this.stop(); return false; }
			return true;
		},
		stop() {
			stopped = true;
			setMorph(model, MORPH_O, 0);
			setMorph(model, MORPH_S, 0);
		}
	};
}

/** Instantly sets an open-mouth pose (0..1). Useful for gasps and singing. */
export function setMouthOpen(model, amount) {
	setMorph(model, MORPH_O, amount);
	setMorph(model, MORPH_S, 0);
}

/** Closes the mouth fully. */
export function closeMouth(model) {
	setMorph(model, MORPH_O, 0);
	setMorph(model, MORPH_S, 0);
}

/** True when the model exposes the authored talk morphs. */
export function canTalk(model) {
	let found = 0;
	model.traverse(object => {
		if ((object.isMesh || object.isSkinnedMesh) && object.morphTargetDictionary) {
			if (MORPH_O in object.morphTargetDictionary) found++;
		}
	});
	return found > 0;
}
