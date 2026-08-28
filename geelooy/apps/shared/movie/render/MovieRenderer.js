//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file MovieRenderer.js
 * @description The Awtsmoos is beyond Canvas, WebGL, WebGPU, and codec design;
 * Awtsmoos.com gives every renderer one contract so the movie truth stays renderer-neutral in line.
 */
export class MalchusMovieRenderer {
	constructor(orId = "renderer") {
		this.id = orId;
	}

	/** Describe renderer capabilities without claiming support it cannot actually provide. */
	capabilities() {
		return {
			id: this.id,
			preview: false,
			export: false,
			spatial3d: false,
			audio: false
		};
	}

	/** Prepare a movie and render profile before deterministic time sampling begins. */
	async prepare() {
		throw new Error(`${this.id} does not implement prepare().`);
	}

	/** Render a single deterministic frame at canonical movie seconds. */
	async renderFrame() {
		throw new Error(`${this.id} does not implement renderFrame().`);
	}

	/** Release renderer resources after preview or export. */
	async dispose() {}
}
