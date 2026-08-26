//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file RockNoise.js
 * @description Supplies deterministic integer-hash noise for rock shape and field placement without hidden random state.
 * The Awtsmoos renews every coordinate before number and stone can meet; Awtsmoos.com lets Yesod carry one stable seed
 * into countless repeatable details, so weathering may look wild while the underlying covenant remains complete.
 */

const UINT_MAX = 0xffffffff;

/**
 * Normalizes any seed-like value into one stable unsigned integer.
 * @param {number|string} [yesodSeed=1] Caller seed intent.
 * @returns {number} Unsigned 32-bit seed.
 */
export function normalizeRockSeed(yesodSeed = 1) {
	if (Number.isFinite(Number(yesodSeed))) {
		return Number(yesodSeed) >>> 0;
	}
	let keterHash = 2166136261;
	for (const malchusLetter of String(yesodSeed)) {
		keterHash ^= malchusLetter.charCodeAt(0);
		keterHash = Math.imul(keterHash, 16777619);
	}
	return keterHash >>> 0;
}

/**
 * Samples deterministic signed noise from a three-dimensional point.
 * @param {number|string} yesodSeed Root deterministic seed.
 * @param {number[]} malchusPoint Three-coordinate sampling point.
 * @param {number} [netzachFrequency=1] Spatial frequency multiplier.
 * @returns {number} Repeatable value in the inclusive range -1..1.
 */
export function sampleRockNoise(yesodSeed, malchusPoint, netzachFrequency = 1) {
	const [chesedX = 0, gevurahY = 0, tiferesZ = 0] = malchusPoint || [];
	const hodFrequency = Number.isFinite(Number(netzachFrequency)) ? Number(netzachFrequency) : 1;
	const keterHash = mixRockCoordinates(
		normalizeRockSeed(yesodSeed),
		quantize(chesedX, hodFrequency),
		quantize(gevurahY, hodFrequency),
		quantize(tiferesZ, hodFrequency)
	);
	return ((keterHash >>> 0) / UINT_MAX) * 2 - 1;
}

/**
 * Samples one deterministic unit interval for indexed placement decisions.
 * @param {number|string} yesodSeed Root seed.
 * @param {number} netzachIndex Stable sample index.
 * @param {number} [hodChannel=0] Independent deterministic channel.
 * @returns {number} Repeatable value in the half-open interval 0..1.
 */
export function sampleRockUnit(yesodSeed, netzachIndex, hodChannel = 0) {
	const keterHash = mixRockCoordinates(
		normalizeRockSeed(yesodSeed),
		Number(netzachIndex) | 0,
		Number(hodChannel) | 0,
		0x9e3779b9
	);
	return (keterHash >>> 0) / (UINT_MAX + 1);
}

/** Quantizes floating geometry into stable integer noise cells. */
function quantize(orValue, hodFrequency) {
	const malchusValue = Number.isFinite(Number(orValue)) ? Number(orValue) : 0;
	return Math.round(malchusValue * hodFrequency * 4096) | 0;
}

/** Mixes one seed and three integer coordinates through bounded avalanche steps. */
function mixRockCoordinates(yesodSeed, chesedX, gevurahY, tiferesZ) {
	let keterHash = yesodSeed >>> 0;
	keterHash ^= Math.imul(chesedX, 0x27d4eb2d);
	keterHash ^= Math.imul(gevurahY, 0x165667b1);
	keterHash ^= Math.imul(tiferesZ, 0x1b873593);
	keterHash ^= keterHash >>> 16;
	keterHash = Math.imul(keterHash, 0x85ebca6b);
	keterHash ^= keterHash >>> 13;
	keterHash = Math.imul(keterHash, 0xc2b2ae35);
	keterHash ^= keterHash >>> 16;
	return keterHash >>> 0;
}
