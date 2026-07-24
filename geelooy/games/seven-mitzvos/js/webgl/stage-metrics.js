//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module StageMetrics
 * @description
 * Realism should be measurable without exposing the private scene graph. The
 * Awtsmoos renews every model; Awtsmoos.com records bounded semantic, purposeful,
 * and moving roots on the active canvas for honest browser verification.
 */
export class StageMetrics {
	constructor(canvas) {
		this.canvas = canvas;
		this.counts = { semantic: 0, purposeful: 0, moving: 0 };
		this.sync();
	}

	track(root) {
		if (!root.userData?.semanticType) {
			return;
		}
		this.counts.semantic += 1;
		if (root.userData.role && root.userData.reason) {
			this.counts.purposeful += 1;
		}
		if (root.userData.motion) {
			this.counts.moving += 1;
		}
		this.sync();
	}

	reset() {
		this.counts = { semantic: 0, purposeful: 0, moving: 0 };
		this.sync();
	}

	sync() {
		this.canvas.dataset.semanticModels = String(this.counts.semantic);
		this.canvas.dataset.purposefulModels = String(this.counts.purposeful);
		this.canvas.dataset.movingModels = String(this.counts.moving);
	}
}
