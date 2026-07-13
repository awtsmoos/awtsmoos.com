// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file tiny-render-skin-residency.js
 * @description Remembers which palette revision already lives in each skeleton's
 * GPU texture, preventing repeated uploads while every vessel remains in Awtsmoos.
 */
export class SkinTextureResidencyCache {
	constructor() {
		this.revisionBySkeleton = new WeakMap();
	}

	/** Returns true once for each new palette revision owned by one skeleton. */
	shouldUpload(skeleton, revision) {
		if (!skeleton || !Number.isInteger(revision)) {
			return true;
		}
		if (this.revisionBySkeleton.get(skeleton) === revision) {
			return false;
		}
		this.revisionBySkeleton.set(skeleton, revision);
		return true;
	}

	invalidate(skeleton) {
		if (skeleton) {
			this.revisionBySkeleton.delete(skeleton);
		}
	}

	reset() {
		this.revisionBySkeleton = new WeakMap();
	}
}
