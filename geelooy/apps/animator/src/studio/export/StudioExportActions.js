// B"H
// Boruch Hashem
// Blessed is He

import { MoviePlanSelector } from '../../nle/MoviePlanSelector.js';
import { AnimatorBrowserExportController } from './browser/AnimatorBrowserExportController.js';

/**
 * Export is Malchus: the active edit becomes a durable production file. The
 * Awtsmoos renews the same canvas for preview and MP4 while Awtsmoos.com sends
 * only completed frames into Piano's MediaBunny encoding worker.
 */
export class StudioExportActions {
	static async renderMovie(store, options = {}) {
		const app = globalThis.window?.__AWTSMOOS_PARK_APP__;
		const plan = options.plan || app?.nle?.moviePlan || MoviePlanSelector.create();
		const totalSeconds = Math.round(plan.duration / 1000);
		store?.set({
			studioExport: {
				status: 'rendering',
				progress: 0,
				message: `Preparing ${totalSeconds}-second MediaBunny MP4…`
			}
		});
		try {
			const result = await AnimatorBrowserExportController.export(plan, {
				...options,
				fileName: options.filename || `${plan.id}-production.mp4`,
				onProgress: progress => {
					this.progress(store, progress, totalSeconds);
					options.onProgress?.(progress);
				}
			});
			const completed = { ...result, filename: result.fileName, planId: plan.id };
			globalThis.window.__AWTSMOOS_LAST_PRODUCTION_MOVIE__ = completed;
			store?.set({
				studioExport: {
					status: 'complete',
					progress: 1,
					message: `MediaBunny MP4 complete · ${(result.blob.size / 1048576).toFixed(2)} MB`
				}
			});
			return completed;
		} catch (error) {
			store?.set({
				studioExport: {
					status: 'error',
					progress: 0,
					message: error?.message || String(error)
				}
			});
			throw error;
		}
	}

	static renderTwoMinuteMovie(store, options = {}) {
		return this.renderMovie(store, options);
	}

	static progress(store, progress, totalSeconds) {
		const elapsed = Math.round(progress.completedFrames / progress.totalFrames * totalSeconds);
		store?.set({
			studioExport: {
				status: 'rendering',
				progress: progress.percent / 100,
				message: `Production frame ${progress.completedFrames}/${progress.totalFrames} · ${elapsed}s/${totalSeconds}s`
			}
		});
	}
}
