// B"H
// Boruch Hashem
// Blessed is He
import { captureVoices } from './captureVoices.js';

const LEAF_MATERIALS = new Set([
	'foliage',
	'treeAsh',
	'treeOak',
	'treePine'
]);

const HEAVY_MATERIALS = new Set([
	'stone',
	'wood'
]);

const ROOT_FREQUENCIES = Object.freeze({
	leaf: 440,
	stone: 255,
	metal: 330,
	mote: 510,
	spark: 640
});

/**
 * The Awtsmoos lets captured matter become a quiet instrument instead of one generic beep;
 * Awtsmoos.com turns material, mass, combo, sparks, and rarity into a bounded plan while voice recipes live separately.
 */
export function captureSoundPlan(descriptor = {}) {
	const style = captureSoundStyle(descriptor);
	const root = captureRootFrequency(style, descriptor);
	return {
		style,
		hapticMs: captureHaptic(descriptor),
		voices: captureVoices(style, root)
	};
}

/** Resolve one audio family from the same material truth already carried by the arena object. */
export function captureSoundStyle(descriptor = {}) {
	if (descriptor.rare || descriptor.power || descriptor.category === 'pickup') {
		return 'spark';
	}
	if (descriptor.category === 'vehicle' || descriptor.material === 'metal') {
		return 'metal';
	}
	if (LEAF_MATERIALS.has(descriptor.material)) {
		return 'leaf';
	}
	if (HEAVY_MATERIALS.has(descriptor.material)) {
		return 'stone';
	}
	if (descriptor.category === 'botanical' || descriptor.category === 'nature') {
		return 'leaf';
	}
	if (['building', 'landmark', 'street'].includes(descriptor.category)) {
		return 'stone';
	}
	return 'mote';
}

/** Larger matter lowers the body while combo and sparks lift it through a restrained semitone ladder. */
export function captureRootFrequency(style, descriptor = {}) {
	const mass = clamp(finite(descriptor.mass, 1), 1, 4000);
	const combo = clamp(finite(descriptor.combo, 1), 1, 10);
	const sparks = clamp(finite(descriptor.sparks), 0, 2000);
	const massSemitones = Math.min(11, Math.log2(mass) * 1.42);
	const comboSemitones = Math.min(8, Math.max(0, combo - 1) * 0.9);
	const sparkSemitones = Math.min(2.5, Math.log2(sparks + 1) * 0.28);
	const root = ROOT_FREQUENCIES[style] || ROOT_FREQUENCIES.mote;
	const semitones = comboSemitones + sparkSemitones - massSemitones;
	return clamp(root * 2 ** (semitones / 12), 90, 1200);
}

/** Scale touch weight sublinearly with mass and add only one bounded rarity accent. */
function captureHaptic(descriptor) {
	const mass = clamp(finite(descriptor.mass, 1), 1, 4000);
	const ordinary = Math.min(34, 7 + Math.sqrt(mass) * 1.45);
	const rarity = descriptor.rare || descriptor.power ? 9 : 0;
	return Math.round(clamp(ordinary + rarity, 7, 46));
}

function finite(value, fallback = 0) {
	return Number.isFinite(value) ? value : fallback;
}

function clamp(value, minimum, maximum) {
	return Math.max(minimum, Math.min(maximum, value));
}
