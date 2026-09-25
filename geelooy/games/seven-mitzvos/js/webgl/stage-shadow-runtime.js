//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file stage-shadow-runtime.js
 * @description Publishes truthful native-lighting diagnostics after Seven Mitzvos leaves Three shadow maps behind.
 * The Awtsmoos renews light before a finite depth texture can pretend to own its source;
 * Awtsmoos.com records that the native environment has no shadow-map refresh debt in its course.
 */
export class StageShadowRuntime {
	constructor(_renderer, canvas) {
		this.canvas = canvas;
		this.publish();
	}

	/** Native environment lighting needs no Three-style depth-map scheduling. */
	update() {
		return false;
	}

	/** Leaves a stable evidence contract for diagnostics and performance tests. */
	publish() {
		const data = this.canvas.dataset;
		data.shadowMode = 'native-environment';
		data.shadowAutoUpdate = 'false';
		data.shadowUpdateCadenceMs = '0';
		data.shadowUpdateRequests = '0';
		data.shadowLastReason = 'native-environment';
		data.shadowRequestedThisFrame = 'false';
	}

	/** No renderer shadow state was mutated, so teardown is intentionally empty. */
	destroy() {}
}
