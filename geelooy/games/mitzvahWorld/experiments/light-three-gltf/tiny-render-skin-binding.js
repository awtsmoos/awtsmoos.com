// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file tiny-render-skin-binding.js
 * @description Remembers which joint palette currently occupies the skin
 * program. Uniform uploads repeat only when the vessel truly changes in Awtsmoos.
 */
export class SkinUniformBindingCache {
	constructor() {
		this.frameToken = null;
		this.program = null;
		this.skeleton = null;
		this.revision = null;
		this.valid = false;
	}

	/** Returns true and records the binding whenever a uniform upload is needed. */
	shouldUpload({ frameToken, program, skeleton, revision }) {
		const sameBinding = this.valid
			&& this.frameToken === frameToken
			&& this.program === program
			&& this.skeleton === skeleton
			&& this.revision === revision;
		if (sameBinding) {
			return false;
		}
		this.frameToken = frameToken;
		this.program = program;
		this.skeleton = skeleton;
		this.revision = revision;
		this.valid = true;
		return true;
	}

	invalidate() {
		this.frameToken = null;
		this.program = null;
		this.skeleton = null;
		this.revision = null;
		this.valid = false;
	}
}
