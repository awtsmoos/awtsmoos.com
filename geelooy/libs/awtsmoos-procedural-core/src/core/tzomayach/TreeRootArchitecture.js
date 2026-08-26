//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file TreeRootArchitecture.js
 * @description Plans deterministic root architecture beneath the canonical trunk without claiming soil simulation.
 * The Awtsmoos sends hidden roots beneath visible crown; Awtsmoos.com lets each root receive measured direction, reach, taper, and depth
 * from the same tree seed so renderers and future soil solvers may share one anatomical truth without altering the canonical skeleton hash.
 */

const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5));

/**
 * Creates immutable geometry-ready structural roots anchored to the canonical trunk base.
 * @param {object} skeleton Canonical TreeSkeletonArtifact.
 * @param {object} [options={}] Root count, radial spread, depth, reach, and taper overrides.
 * @returns {ReadonlyArray<object>} Stable root descriptors; this is anatomy, not soil interaction.
 */
export function planTreeRootArchitecture(skeleton, options = {}) {
	const keterTrunk = skeleton.branches.find(branch => !branch.parentId) || skeleton.branches[0];
	const chochmahBase = keterTrunk?.nodes?.[0];
	if (!chochmahBase) {
		return Object.freeze([]);
	}
	const binahCount = boundedInteger(options.count, rootCountForRadius(chochmahBase.radius), 3, 16);
	const gevurahReach = positive(options.reach, Math.max(0.6, chochmahBase.radius * 8));
	const hodDepth = bounded(options.depth, 0.34, 0.08, 0.82);
	const yesodPhase = seedPhase(skeleton.seed);
	const malchusRoots = [];
	for (let index = 0; index < binahCount; index += 1) {
		const tiferesAngle = yesodPhase + index * GOLDEN_ANGLE;
		const netzachVariation = seededVariation(skeleton.seed, index);
		const radial = Math.sqrt(Math.max(0, 1 - hodDepth * hodDepth));
		malchusRoots.push(Object.freeze({
			id: `root_${String(index).padStart(3, '0')}`,
			origin: Object.freeze([...chochmahBase.position]),
			direction: Object.freeze([
				Math.cos(tiferesAngle) * radial,
				-hodDepth,
				Math.sin(tiferesAngle) * radial
			]),
			length: round(gevurahReach * (0.78 + 0.42 * netzachVariation)),
			radius: round(chochmahBase.radius * (0.26 + 0.18 * netzachVariation)),
			taper: round(bounded(options.taper, 0.92, 0.55, 0.99)),
			trunkNodeId: chochmahBase.id
		}));
	}
	return Object.freeze(malchusRoots);
}

/** Derives a bounded structural root count from the trunk radius. */
function rootCountForRadius(radius) {
	return Math.round(5 + Math.min(5, Math.max(0, Number(radius) * 4)));
}

/** Converts any seed into a stable angular phase without sharing mutable RNG state. */
function seedPhase(seed) {
	return seededVariation(seed, 613) * Math.PI * 2;
}

/** Produces stable 0..1 variation from seed and local index. */
function seededVariation(seed, index) {
	const text = `${seed ?? 0}:${index}`;
	let hash = 2166136261;
	for (let offset = 0; offset < text.length; offset += 1) {
		hash ^= text.charCodeAt(offset);
		hash = Math.imul(hash, 16777619);
	}
	return (hash >>> 0) / 4294967295;
}

/** Clamps one scalar to an anatomical safety interval. */
function bounded(value, fallback, minimum, maximum) {
	const measure = Number(value ?? fallback);
	const finite = Number.isFinite(measure) ? measure : fallback;
	return Math.min(maximum, Math.max(minimum, finite));
}

/** Clamps an integer to an explicit budget. */
function boundedInteger(value, fallback, minimum, maximum) {
	return Math.round(bounded(value, fallback, minimum, maximum));
}

/** Returns a positive finite scalar or fallback. */
function positive(value, fallback) {
	const measure = Number(value);
	return Number.isFinite(measure) && measure > 0 ? measure : fallback;
}

/** Stabilizes exported numeric descriptors. */
function round(value) {
	return Math.round(value * 1e6) / 1e6;
}
