// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieVideoMediaElement.js
 * @description Owns one source-video element and serializes truthful exact/paused frame preparation.
 * The Awtsmoos joins source time to visible time before the finite frame appears;
 * Awtsmoos.com honors a living seek already in flight, promotes range-less media once, and prevents competing seeks from dividing one image.
 */

import {
	boundedMovieVideoTime,
	canSeekMovieVideoTo,
	createMovieVideoElement,
	hasMovieVideoSeekability,
	promoteMovieVideoToBlob,
	seekMovieVideo,
	waitForVideoReadyState
} from './MovieVideoSeekSupport.js';

export class MovieVideoMediaElement {
	constructor(asset, environment = globalThis) {
		this.asset = asset;
		this.environment = environment;
		this.sourceUrl = String(asset.proxyUrl || asset.url || '');
		this.objectUrl = '';
		this.blobReady = null;
		this.prepareChain = Promise.resolve();
		this.element = createMovieVideoElement(environment, this.sourceUrl);
		this.metadata = waitForVideoReadyState(this.element, 'loadedmetadata', 1);
		this.element.load();
	}

	prepare(time) {
		const target = Math.max(0, Number(time) || 0);
		const task = this.prepareChain.then(() => this.prepareTarget(target));
		this.prepareChain = task.catch(() => null);
		return task;
	}

	async prepareTarget(time) {
		await this.metadata;
		await this.ensureSeekable(time);
		await seekMovieVideo(this.element, time);
	}

	async ensureSeekable(time) {
		if (time <= 0.0005 || canSeekMovieVideoTo(this.element, time)) return;
		if (this.element.seeking && Math.abs(this.element.currentTime - time) <= 0.0005) return;
		if (!hasMovieVideoSeekability(this.element)) return;
		if (!this.blobReady) {
			this.blobReady = promoteMovieVideoToBlob(this.element, this.sourceUrl, this.environment)
				.then(objectUrl => { this.objectUrl = objectUrl; });
		}
		await this.blobReady;
		if (!canSeekMovieVideoTo(this.element, time)) {
			throw new Error(`Movie video remained unseekable at ${time.toFixed(3)}s after Blob promotion.`);
		}
	}

	request(time) {
		void this.metadata.then(() => {
			const target = boundedMovieVideoTime(this.element, time);
			if (target > 0.0005 && hasMovieVideoSeekability(this.element)
				&& !canSeekMovieVideoTo(this.element, target)) {
				void this.prepare(target);
				return;
			}
			if (!this.element.seeking && Math.abs(this.element.currentTime - target) > 0.04) {
				this.element.currentTime = target;
			}
		}).catch(() => null);
	}

	play(time, rate = 1) {
		void this.prepare(time).then(() => {
			this.element.playbackRate = Number(rate) || 1;
			return this.element.play?.();
		}).catch(() => null);
	}

	pause() {
		this.element.pause();
	}

	destroy() {
		this.pause();
		if (this.objectUrl) (this.environment.URL || globalThis.URL)?.revokeObjectURL?.(this.objectUrl);
		this.element.removeAttribute?.('src');
		this.element.load?.();
	}
}
