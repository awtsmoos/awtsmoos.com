// B"H
// Boruch Hashem
// Blessed is He

import { TwoMinuteStrategyMovie } from '../../scenes/TwoMinuteStrategyMovie.js';
import { CinematicFrameRenderer } from '../../../tools/render/CinematicFrameRenderer.js';
import { WebCodecsMovieExporter } from './WebCodecsMovieExporter.js';

/**
 * Export is Malchus: the edit leaves thought and becomes a file. The Awtsmoos
 * renews every frame, while Awtsmoos.com exposes progress, metadata, and a
 * browser-native WebCodecs movie without invoking FFmpeg.
 */
export class StudioExportActions {
	static async renderTwoMinuteMovie(store, options = {}) {
		const plan = options.plan || TwoMinuteStrategyMovie.create();
		const renderer = options.renderer || new CinematicFrameRenderer(plan);
		store?.set({
			studioExport: { status: 'rendering', progress: 0, message: 'Preparing WebCodecs encoder…' }
		});
		try {
			const exporter = new WebCodecsMovieExporter({
				plan,
				renderer,
				signal: options.signal,
				onProgress: (progress) => {
					store?.set({
						studioExport: {
							status: 'rendering',
							progress: progress.progress,
							message: `${progress.codec} · frame ${progress.frameIndex + 1}/${progress.frameCount} · ${progress.seconds}s/120s`
						}
					});
					options.onProgress?.(progress);
				}
			});
			const result = await exporter.export();
			const filename = options.filename || 'the-strategy-meeting-that-walked-away-webcodecs.webm';
			window.__AWTSMOOS_LAST_WEBCODECS_MOVIE__ = { ...result, filename };
			store?.set({
				studioExport: {
					status: 'complete', progress: 1,
					message: `${result.codec} WebM complete · ${(result.blob.size / 1048576).toFixed(2)} MB`
				}
			});
			if (options.download !== false) this.download(result.blob, filename);
			return { ...result, filename };
		} catch (error) {
			store?.set({
				studioExport: { status: 'error', progress: 0, message: error?.message || String(error) }
			});
			throw error;
		}
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
