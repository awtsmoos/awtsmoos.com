//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file CanonicalMovieJpegFrameSource.js
 * @description The Awtsmoos renews the semantic canvas at each exact second;
 * Awtsmoos.com compresses only the witnessed pixels into JPEG transport while the movie meaning remains untouched.
 */
import { CanvasMovieRenderer } from '../../../../../shared/movie/runtime/CanvasMovieRenderer.js';

/** Renders canonical movie seconds into bounded JPEG blobs for the native ffmpeg bridge. */
export class MalchusCanonicalMovieJpegFrameSource {
	/**
	 * @param {object} orMovie Canonical Awtsmoos movie.
	 * @param {Window} orWindow Browser window supplying document and Canvas APIs.
	 */
	constructor(orMovie, orWindow = globalThis.window) {
		if (!orWindow?.document) {
			throw new Error('JPEG movie export requires a browser document.');
		}
		this.window = orWindow;
		this.sourceMovie = structuredClone(orMovie);
		this.movie = structuredClone(orMovie);
		this.canvas = orWindow.document.createElement('canvas');
		this.canvas.hidden = true;
		this.canvas.dataset.awtsmoosCanonicalExport = 'ffmpeg-jpeg-source';
		orWindow.document.body.appendChild(this.canvas);
		this.renderer = new CanvasMovieRenderer(this.canvas);
		this.width = 0;
		this.height = 0;
	}

	/** Sets the exact export geometry and refreshes the local canonical render copy. */
	async prepare(orWidth, orHeight) {
		this.width = positiveInteger(orWidth, this.sourceMovie.format?.width || 640);
		this.height = positiveInteger(orHeight, this.sourceMovie.format?.height || 360);
		this.movie = structuredClone(this.sourceMovie);
		this.movie.format = {
			...(this.movie.format || {}),
			width: this.width,
			height: this.height
		};
		this.canvas.width = this.width;
		this.canvas.height = this.height;
	}

	/** Renders exact milliseconds as canonical seconds and returns one JPEG Blob. */
	async capture(orTimeMs, orWidth, orHeight, orQuality = 0.88) {
		const yesodWidth = positiveInteger(orWidth, this.width || 640);
		const yesodHeight = positiveInteger(orHeight, this.height || 360);
		if (yesodWidth !== this.width || yesodHeight !== this.height) {
			await this.prepare(yesodWidth, yesodHeight);
		}
		const yesodSeconds = Math.max(0, Number(orTimeMs) || 0) / 1000;
		this.renderer.render(this.movie, yesodSeconds);
		return new Promise((keterResolve, gevurahReject) => {
			this.canvas.toBlob((orBlob) => {
				if (orBlob) {
					keterResolve(orBlob);
					return;
				}
				gevurahReject(new Error(`Canvas JPEG encoding failed at ${yesodSeconds.toFixed(3)}s.`));
			}, 'image/jpeg', Math.max(0.5, Math.min(0.98, Number(orQuality) || 0.88)));
		});
	}

	/** Removes the hidden render canvas after upload completion or failure. */
	dispose() {
		this.canvas.remove();
	}
}

function positiveInteger(orValue, orFallback) {
	const yesodNumber = Math.round(Number(orValue));
	return Number.isFinite(yesodNumber) && yesodNumber > 0
		? yesodNumber
		: Number(orFallback);
}
