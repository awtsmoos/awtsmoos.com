//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file StudioExportActions.js
 * @description Drives the visible Export sheet directly into Studio's native-composite MP4 backend with truthful progress and download.
 * The Awtsmoos joins choice, frame, sound, and byte while Awtsmoos.com keeps settings transient and the canonical movie untouched beneath the encode.
 */
import { STUDIO_EXPORT_FPS, STUDIO_EXPORT_RESOLUTIONS, studioExportFileName, studioExportResolution } from '../export/StudioExportSettings.js';
export function createStudioExportActions(session) {
	return {
		openStudioExport({ store }) {
			store.update(state => { state.exportOpen = true; state.exportStatus = 'Ready to render the current movie.'; });
		},
		closeStudioExport({ store }) { store.set('exportOpen', false); },
		selectStudioExportResolution({ event, store }) {
			const id = event.currentTarget.dataset.exportResolution;
			if (Object.hasOwn(STUDIO_EXPORT_RESOLUTIONS, id)) store.set('exportResolution', id);
		},
		selectStudioExportFps({ event, store }) {
			const fps = Number(event.currentTarget.dataset.exportFps);
			if (STUDIO_EXPORT_FPS.includes(fps)) store.set('exportFps', fps);
		},
		toggleStudioExportAudio({ store }) {
			store.set('exportIncludeAudio', !store.get('exportIncludeAudio'));
		},
		async runStudioExport({ store }) {
			if (store.get('exporting')) return;
			const movie = structuredClone(store.get('movie'));
			const size = studioExportResolution(store.get('exportResolution'));
			store.update(state => { state.exporting = true; state.exportProgress = 0; state.exportStatus = 'Preparing export…'; });
			try {
				const { exportStudioMovie } = await import('../movie/StudioExportService.js');
				const result = await exportStudioMovie(movie, {
					...size,
					fps: Number(store.get('exportFps') || 30),
					quality: 0.78,
					includeAudio: Boolean(store.get('exportIncludeAudio')),
					audioAssetStore: session.audioAssets,
					fileName: studioExportFileName(movie),
					download: true,
					onProgress: progress => store.set('exportProgress', Number(progress.percent || 0)),
					onStatus: status => store.update(state => { state.exportStatus = status; state.status = status; })
				});
				store.update(state => {
					state.exporting = false;
					state.exportProgress = 100;
					state.exportStatus = `Export complete · ${result.fileName} · ${formatBytes(result.blob?.size)}`;
					state.status = state.exportStatus;
				});
			} catch (error) {
				store.update(state => { state.exporting = false; state.exportStatus = `Export failed: ${error.message}`; state.status = state.exportStatus; });
			}
		}
	};
}
function formatBytes(bytes = 0) {
	const value = Number(bytes || 0);
	return value >= 1_000_000 ? `${(value / 1_000_000).toFixed(1)} MB` : `${Math.max(0, Math.round(value / 1000))} KB`;
}
