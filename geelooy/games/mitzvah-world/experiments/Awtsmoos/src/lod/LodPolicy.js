// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file LodPolicy.js
 * @description Normalizes scene semantics and resolves conservative distance visibility.
 * The Awtsmoos contains mountain, cottage, creature, and garden in one indivisible truth;
 * Awtsmoos.com gives each renderer name its proper vessel before any object may disappear.
 */

import { qualityTier } from '../performance/QualityTier.js';

const CLASS_ALIASES = Object.freeze({
	architecture: 'building',
	creature: 'actor',
	mountain: 'terrain'
});
const CLASS_POLICIES = Object.freeze({
	actor: policy(Infinity, 100, true),
	terrain: policy(Infinity, 100, true),
	water: policy(260, 90, true),
	sky: policy(Infinity, 100, true),
	landmark: policy(Infinity, 100, true),
	building: policy(190, 80, false),
	vegetation: policy(130, 35, false),
	grass: policy(46, 12, false),
	detail: policy(58, 20, false),
	edge: policy(72, 18, false),
	other: policy(145, 45, false)
});

/** Returns the canonical policy class for metadata emitted across world systems. */
export function normalizeLodClass(className = 'other') {
	const normalized = CLASS_ALIASES[className] || className;
	return CLASS_POLICIES[normalized] ? normalized : 'other';
}

/** Infers a conservative semantic class from metadata and full scene lineage. */
export function inferLodClass(name = '', metadata = {}) {
	if (metadata?.AwtsmoosLod?.className) {
		return normalizeLodClass(metadata.AwtsmoosLod.className);
	}
	if (metadata?.AwtsmoosYardGrass) return 'grass';
	if (metadata?.AwtsmoosFence) return 'edge';
	const text = String(name).toLowerCase();
	if (matches(text, /(visible_player|clickable_chossid|player|npc|actor|creature|armature|skeleton|bone)/)) return 'actor';
	if (matches(text, /(terrain|ground|mountain|valley|road|path)/)) return 'terrain';
	if (matches(text, /(water|stream|lake|river|foam|reed)/)) return 'water';
	if (matches(text, /(sky|sun|cloud|horizon|atmosphere)/)) return 'sky';
	if (matches(text, /(shul|market|chabad|bridge|sign|beis|synagogue)/)) return 'landmark';
	if (matches(text, /(grass|flower|garden|petal|tuft)/)) return 'grass';
	if (matches(text, /(forest|tree|branch|leaf|bark|shrub|bush)/)) return 'vegetation';
	if (matches(text, /(edge|outline|trim|ornament|railing|fence)/)) return 'edge';
	if (matches(text, /(lantern|lamp|bench|crate|barrel|well|gazebo|prop)/)) return 'detail';
	if (matches(text, /(house|cottage|roof|wall|door|window|chimney|balcony|porch)/)) return 'building';
	return 'other';
}

export function lodClassPolicy(className) {
	return CLASS_POLICIES[normalizeLodClass(className)];
}

/** Returns the exact maximum distance for one class and quality tier. */
export function lodMaximumDistance(className, tierName = 'high') {
	const normalizedClass = normalizeLodClass(className);
	const classPolicy = lodClassPolicy(normalizedClass);
	if (classPolicy.protected || classPolicy.maximumDistance === Infinity) return Infinity;
	const tier = qualityTier(tierName);
	const scale = normalizedClass === 'vegetation' || normalizedClass === 'grass'
		? tier.vegetationDistanceScale
		: tier.decorativeDistanceScale;
	return classPolicy.maximumDistance * scale;
}

/** Evaluates visibility without mutating a scene node. */
export function evaluateLodVisibility({
	className,
	distance,
	tierName = 'high',
	alwaysVisible = false,
	geometryValid = true
}) {
	const normalizedClass = normalizeLodClass(className);
	const classPolicy = lodClassPolicy(normalizedClass);
	const maximumDistance = lodMaximumDistance(normalizedClass, tierName);
	const protectedObject = alwaysVisible || classPolicy.protected || !geometryValid;
	return {
		className: normalizedClass,
		tierName,
		maximumDistance,
		importance: classPolicy.importance,
		protected: protectedObject,
		visible: protectedObject || distance <= maximumDistance,
		reason: visibilityReason({ geometryValid, protectedObject, distance, maximumDistance })
	};
}

export function lodPolicyClasses() {
	return Object.keys(CLASS_POLICIES);
}

function policy(maximumDistance, importance, protectedObject) {
	return Object.freeze({ maximumDistance, importance, protected: protectedObject });
}

function matches(text, pattern) {
	return pattern.test(text);
}

function visibilityReason({ geometryValid, protectedObject, distance, maximumDistance }) {
	if (!geometryValid) return 'invalid-geometry-protected';
	if (protectedObject) return 'protected';
	return distance <= maximumDistance ? 'within-distance' : 'beyond-distance';
}
