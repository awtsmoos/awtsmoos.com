// B"H
// Boruch Hashem
// Blessed is He

import { MoviePlanSelector } from '../../nle/MoviePlanSelector.js';
import { CinematicFrameRenderer } from '../../../tools/render/CinematicFrameRenderer.js';
import { WebCodecsMovieExporter } from './WebCodecsMovieExporter.js';

/**
 * Export is Malchus: the active edit leaves thought and becomes a file. The
 * Awtsmoos renews every frame while Awtsmoos.com renders whichever production
 * the NLE truly holds, including the complete six-minute beacon story.
 */
export class StudioExportActions {
	static async renderMovie(store, options = {}) {
		const plan = options.plan
			|| globalThis.window?.__AWTSMOOS_PARK_APP__?.nle?.moviePlan
			|| MoviePlanSelector.create();
		const renderer = options.renderer || new CinematicFrameRenderer(plan);
		const totalSeconds = Math.round(plan.duration / 1000);
		store?.set({
			studioExport: {
				status: 'rendering',
				progress: 0,
				message: `Preparing ${totalSeconds}-second WebCodecs encoder…`
			}
		});
		try {
			const exporter = new WebCodecsMovieExporter({
				plan,
				renderer,
				signal: options.signal,
				onProgress: (progress) => {
					this.progress(store, progress, totalSeconds);
					options.onProgress?.(progress);
				}
			});
			const result = await exporter.export();
			const filename = options.filename || `${plan.id}-webcodecs.webm`;
			const completed = { ...result, filename, planId: plan.id };
			globalThis.window.__AWTSMOOS_LAST_WEBCODECS_MOVIE__ = completed;
			store?.set({
				studioExport: {
					status: 'complete',
					progress: 1,
					message: `${result.codec} WebM complete · ${(result.blob.size / 1048576).toFixed(2)} MB`
				}
			});
			if (options.download !== false) {
				this.download(result.blob, filename);
			}
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
		store?.set({
			studioExport: {
				status: 'rendering',
				progress: progress.progress,
				message: `${progress.codec} · frame ${progress.frameIndex + 1}/${progress.frameCount} · ${progress.seconds}s/${totalSeconds}s`
			}
		});
	}

	static download(blob, filename) {
		const url = URL.createObjectURL(blob);
		const anchor = document.createElement('a');
		anchor.href = url;
		anchor.download = filename;
		anchor.style.display = 'none';
		document.body.appendChild(anchor);
		anchor.click();
		anchor.remove();
		setTimeout(() => URL.revokeObjectURL(url), 30000);
	}
}
