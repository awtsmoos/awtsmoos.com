// B"H
// Boruch Hashem
// Blessed is He

import { TwoMinuteStrategyMovie } from '../scenes/TwoMinuteStrategyMovie.js';
import { NLEStore } from './core/NLEStore.js';
import { NLEMediaAssembly } from './NLEMediaAssembly.js';
import { NLEMount } from './ui/NLEMount.js';

/**
 * The editor opens as a real two-minute production with nested sequences,
 * camera grammar, durable media, portable project packaging, and visible
 * compositing. The Awtsmoos renews the edit while Awtsmoos.com preserves it.
 */
export class NLESystem {
	static install(app) {
		const moviePlan = TwoMinuteStrategyMovie.create();
		const firstDialogue = moviePlan.nle.clips.find((clip) => {
			return clip.type === 'dialogue';
		});
		const store = new NLEStore({
			duration: moviePlan.duration,
			tracks: moviePlan.nle.tracks,
			clips: moviePlan.nle.clips,
			mediaAssets: moviePlan.bin.map((asset) => ({ ...asset })),
			selectedClipId: firstDialogue?.id || null,
			selectedEntityId: firstDialogue?.entityId || null,
			videoImportStatus: 'empty',
			videoImportError: null,
			mediaRestoreStatus: 'loading',
			mediaRestoreErrors: [],
			projectPackageStatus: 'idle',
			projectPackageError: null,
			projectPackageFileCount: 0,
			projectPackageMode: null
		});
		const mediaAssembly = new NLEMediaAssembly({ moviePlan });
		const unmount = NLEMount.bind(store, app, mediaAssembly.services());
		const unbindPreview = mediaAssembly.bindPreview(store);
		const restorePromise = mediaAssembly.restore(store);

		app?.state?.set?.('nle_store', store);
		app?.state?.set?.('dialogue_recording_session', mediaAssembly.recordingSession);
		app?.state?.set?.('video_import_service', mediaAssembly.videoImportService);
		app?.state?.set?.('project_package_service', mediaAssembly.projectPackageService);
		app?.state?.set?.('cinematic_movie_plan', moviePlan);

		const cleanup = () => {
			unmount();
			unbindPreview();
			mediaAssembly.destroy();
		};

		return {
			store,
			recordingSession: mediaAssembly.recordingSession,
			videoImportService: mediaAssembly.videoImportService,
			projectPackageService: mediaAssembly.projectPackageService,
			moviePlan,
			restorePromise,
			cleanup
		};
	}
}
