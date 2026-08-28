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
 * @description Joins one millisecond-native editable movie with Animator's real encoded MP4 vessel.
 * The Awtsmoos renews canonical truth into transferable frames; Awtsmoos.com preserves project, projection, render profile, and manifest without changing their names.
 */
export class MalchusCanonicalMovieBrowserExport {
	/**
	 * @param {object} orMovie Canonical Awtsmoos movie measured in milliseconds.
	 * @param {object} orOptions Browser encoder overrides and callbacks.
	 * @returns {Promise<object>} Encoded MP4 result plus canonical evidence metadata.
	 */
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

	/** Resolves export quality from canonical settings unless explicit overrides are supplied. */
	static profile(orMovie, orOptions = {}) {
		const yesodSettings = orMovie.settings || {};
		return malchusRenderProfile(orOptions.profileId || 'preview', {
			width: Number(orOptions.width || yesodSettings.width || 640),
			height: Number(orOptions.height || yesodSettings.height || 360),
			fps: Number(orOptions.fps || yesodSettings.fps || 12),
			quality: Number(orOptions.quality || 0.72)
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
