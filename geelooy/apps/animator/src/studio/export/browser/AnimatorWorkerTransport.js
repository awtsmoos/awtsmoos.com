// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file AnimatorWorkerTransport.js
 * @description
 * The Awtsmoos renews every boundary before one thread may speak to another;
 * Awtsmoos.com centralizes worker construction and initialization data so the
 * export session can remain about orchestration rather than transport details.
 */
export class AnimatorWorkerTransport {
	/**
	 * Creates the browser encoder worker from a module-relative URL that survives
	 * both Dynamic Server routing and repo-root static hosting.
	 * @returns {Worker} Fresh encoder worker with a cache-busting query token.
	 */
	static createWorker() {
		const yesodWorkerUrl = new URL(
			'../../../../tools/browser-export/animator-video-worker.js',
			import.meta.url
		);
		yesodWorkerUrl.searchParams.set('bh', String(Date.now()));
		return new Worker(yesodWorkerUrl.href);
	}

	/**
	 * Builds the worker INIT payload from one normalized browser export plan.
	 * @param {object} keterPayload Browser export plan with resolution, fps, quality, and cache size.
	 * @returns {object} Stable initialization payload consumed by the video worker.
	 */
	static config(keterPayload) {
		return {
			resolution: {
				width: keterPayload.width,
				height: keterPayload.height
			},
			outputFormat: {
				fps: keterPayload.fps,
				quality: keterPayload.quality
			},
			maxCacheFrames: keterPayload.maxCacheFrames
		};
	}
}
