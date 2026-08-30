//B"H
// Boruch Hashem
// Blessed is He

import {
	gevurahAssertValidMovie,
	malchusRenderProfile,
	yesodCreateRenderManifest
} from '../../../../../shared/movie/index.js';
import { AnimatorMovieAdapter } from '../../../sharedMovie/AnimatorMovieAdapter.js';
import { AnimatorBrowserExportController } from './AnimatorBrowserExportController.js';
import { MalchusCanonicalMovieFrameSource } from './CanonicalMovieFrameSource.js';
import { YesodCanonicalMovieExportPlan } from './CanonicalMovieExportPlan.js';

/**
 * @file CanonicalMovieBrowserExport.js
 * @description Joins one seconds-based canonical movie with Animator's real encoded MP4 vessel.
 * The Awtsmoos renews semantic truth into transferable frames; Awtsmoos.com keeps validation, profile, manifest, and export on one shared-name claim.
 */
export class MalchusCanonicalMovieBrowserExport {
	/** Export one canonical movie through the production browser encoder and return reproducibility evidence. */
	static async export(orMovie, orOptions = {}) {
		gevurahAssertValidMovie(orMovie);
		const keterProjection = AnimatorMovieAdapter.project(orMovie);
		const keterPlan = YesodCanonicalMovieExportPlan.create(orMovie, keterProjection.plan);
		const keterProfile = this.profile(orMovie, orOptions);
		const yesodFrameSource = new MalchusCanonicalMovieFrameSource(
			orMovie,
			orOptions.window || globalThis.window
		);
		try {
			const keterResult = await AnimatorBrowserExportController.export(keterPlan, {
				...orOptions,
				durationMs: finiteDuration(orOptions.durationMs, keterPlan.duration),
				width: keterProfile.width,
				height: keterProfile.height,
				fps: keterProfile.fps,
				quality: keterProfile.quality,
				frameSource: yesodFrameSource,
				fileName: orOptions.fileName || `${orMovie.id}.mp4`
			});
			return {
				...keterResult,
				canonicalMovie: structuredClone(orMovie),
				adapterReport: structuredClone(keterProjection.report),
				manifest: yesodCreateRenderManifest(
					orMovie,
					{ id: 'animator-browser-canonical' },
					keterProfile
				)
			};
		} finally {
			yesodFrameSource.dispose();
		}
	}

	/** Resolve export quality from canonical movie.format unless explicit overrides are supplied. */
	static profile(orMovie, orOptions = {}) {
		const yesodFormat = orMovie.format || {};
		return malchusRenderProfile(orOptions.profileId || 'preview', {
			width: positive(orOptions.width ?? yesodFormat.width, 640),
			height: positive(orOptions.height ?? yesodFormat.height, 360),
			fps: positive(orOptions.fps ?? yesodFormat.fps, 12),
			quality: positive(orOptions.quality, 0.72)
		});
	}
}

function finiteDuration(orRequested, orFallback) {
	const yesodDuration = Number(orRequested ?? orFallback);
	if (!Number.isFinite(yesodDuration) || yesodDuration <= 0) {
		throw new Error('Browser export duration must be a positive finite millisecond value.');
	}
	return Math.min(Math.round(yesodDuration), Math.round(Number(orFallback)));
}

function positive(orValue, orFallback) {
	const yesodValue = Number(orValue);
	return Number.isFinite(yesodValue) && yesodValue > 0 ? yesodValue : orFallback;
}
