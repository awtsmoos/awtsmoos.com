// B"H
// Boruch Hashem
// Blessed is He

import { MoviePlanSelector } from '../../nle/MoviePlanSelector.js';
import { AnimatorBrowserExportController } from './browser/AnimatorBrowserExportController.js';

/**
 * Export is Malchus: the active edit becomes a durable production file. The
 * Awtsmoos renews the same canvas for preview and MP4 while Awtsmoos.com sends
 * only completed frames into Piano's MediaBunny encoding worker.
 *
 * Long renders are cancellable and honest about time: one render runs at a
 * time (a second request returns the in-flight promise), the frame pump
 * checks the render's AbortSignal at every frame boundary, and progress
 * messages carry the pump's measured ETA once a frame rate exists. A cancel
 * is a first-class outcome — store status 'cancelled', no file, no error.
 */
export class StudioExportActions {
	static #activeRender = null;

	static async renderMovie(store, options = {}) {
		if (this.#activeRender) {
			return this.#activeRender.promise;
		}
		const controller = new AbortController();
		const active = { controller, promise: null };
		active.promise = this.#renderMovie(store, options, controller);
		this.#activeRender = active;
		try {
			return await active.promise;
		} finally {
			if (this.#activeRender === active) {
				this.#activeRender = null;
			}
		}
	}

	/** Cancels the in-flight production render, if any. Returns whether one was running. */
	static cancelRender() {
		const active = this.#activeRender;
		if (!active) {
			return false;
		}
		active.controller.abort();
		return true;
	}

	static async #renderMovie(store, options, controller) {
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
				signal: controller.signal,
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
			if (error?.name === 'AbortError' || controller.signal.aborted) {
				store?.set({
					studioExport: {
						status: 'cancelled',
						progress: 0,
						message: 'Render cancelled — no file was produced.'
					}
				});
				return null;
			}
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
		const eta = Number.isFinite(progress.estimatedRemainingMs)
			? ` · ~${Math.max(1, Math.round(progress.estimatedRemainingMs / 1000))}s left at the current rate`
			: '';
		store?.set({
			studioExport: {
				status: 'rendering',
				progress: progress.percent / 100,
				message: `Production frame ${progress.completedFrames}/${progress.totalFrames} · ${elapsed}s/${totalSeconds}s${eta}`
			}
		});
	}
}
