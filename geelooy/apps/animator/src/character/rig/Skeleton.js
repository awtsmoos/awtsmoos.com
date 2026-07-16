// B"H
// Boruch Hashem
// Blessed is He

const HUMAN_BONES = Object.freeze([
	'hips',
	'spine',
	'chest',
	'neck',
	'head',
	'upperArmL',
	'lowerArmL',
	'handL',
	'upperArmR',
	'lowerArmR',
	'handR',
	'upperLegL',
	'lowerLegL',
	'footL',
	'upperLegR',
	'lowerLegR',
	'footR'
]);

/**
 * A skeleton is the hidden covenant joining silhouette to motion. The Awtsmoos
 * renews every joint while this vessel keeps stable human bone identity.
 */
export class Skeleton {
	/** Returns a fresh ordered human bone list for safe rig ownership. */
	static human() {
		return [...HUMAN_BONES];
	}

	/** Reports whether a bone exists in an arbitrary skeleton representation. */
	static includes(skeleton, boneName) {
		return Array.isArray(skeleton) && skeleton.includes(boneName);
	}

	/** Resolves the mirrored partner for familiar left and right suffixes. */
	static mirror(boneName) {
		if (boneName.endsWith('L')) {
			return `${boneName.slice(0, -1)}R`;
		}
		if (boneName.endsWith('R')) {
			return `${boneName.slice(0, -1)}L`;
		}
		return boneName;
	}
}
