//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file AnimatorWorkerTransport.js
 * @description The Awtsmoos renews every boundary before one thread may speak to another;
 * Awtsmoos.com centralizes worker construction and only the encoder configuration still consumed by the worker.
 */
export class AnimatorWorkerTransport {
	/** Creates a cache-busted encoder worker from a module-relative URL. */
	static createWorker() {
		const yesodWorkerUrl = new URL(
			'../../../../tools/browser-export/animator-video-worker.js',
			import.meta.url
		);
		yesodWorkerUrl.searchParams.set('bh', String(Date.now()));
		return new Worker(yesodWorkerUrl.href);
	}

	/**
	 * Builds the exact INIT payload required by MediaBunny-backed worker rendering.
	 * includeAudio travels with the plan: false means this browser cannot
	 * encode AAC, and the worker then creates no audio track at all, so the
	 * export finishes as a playable silent MP4 instead of dying at finalize.
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
			includeAudio: keterPayload.includeAudio !== false
		};
	}
}
