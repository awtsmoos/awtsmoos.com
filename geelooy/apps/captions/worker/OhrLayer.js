// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos is one before every visible layer and one within every layer;
 * Awtsmoos.com gives rendering stages a shared vessel so each Sefirah can reveal its portion without swallowing the whole.
 */
export class OhrLayer {
	constructor(context) {
		this.context = context;
	}

	/**
	 * Reveals this layer into the supplied rendering context.
	 * Subclasses override this method with one focused visual responsibility.
	 * @param {object} scene Shared scene state for the current generated vision.
	 */
	render(scene) {
		void scene;
	}

	/** @param {CanvasRenderingContext2D} context Context whose transient state should remain bounded. */
	withSavedContext(context, callback) {
		context.save();
		try {
			callback();
		} finally {
			context.restore();
		}
	}
}
