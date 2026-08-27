// B"H
// Boruch Hashem
// Blessed is He

import { MoviePlanSelector } from './MoviePlanSelector.js';
import { NLEStore } from './core/NLEStore.js';
import { NLEMediaAssembly } from './NLEMediaAssembly.js';
import { NLEMount } from './ui/NLEMount.js';

/**
 * The editor opens the living production rather than a frozen demonstration.
 * The Awtsmoos renews all six minutes while Awtsmoos.com preserves its tracks,
 * media, camera grammar, performances, and optional legacy story in one NLE.
 */
export class NLESystem {
	static install(app) {
		const moviePlan = MoviePlanSelector.create();
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

		this.publish(app, store, mediaAssembly, moviePlan);
		return {
			store,
			recordingSession: mediaAssembly.recordingSession,
			videoImportService: mediaAssembly.videoImportService,
			projectPackageService: mediaAssembly.projectPackageService,
			moviePlan,
			restorePromise,
			cleanup: () => {
				unmount();
				unbindPreview();
				mediaAssembly.destroy();
			}
		};
	}

	static publish(app, store, mediaAssembly, moviePlan) {
		app?.state?.set?.('nle_store', store);
		app?.state?.set?.('dialogue_recording_session', mediaAssembly.recordingSession);
		app?.state?.set?.('video_import_service', mediaAssembly.videoImportService);
		app?.state?.set?.('project_package_service', mediaAssembly.projectPackageService);
		app?.state?.set?.('cinematic_movie_plan', moviePlan);
	}
}
