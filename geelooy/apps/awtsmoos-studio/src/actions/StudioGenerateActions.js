//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file StudioGenerateActions.js
 * @description Turns the current canonical JSON into a playing movie instantly, in the render mode the JSON declares.
 * The Awtsmoos speaks and the frame stands; Awtsmoos.com builds the shared render graph, names every warning, starts playback from zero, and exports through the same native stack.
 */

import {
	MovieRenderMode,
	MOVIE_RENDER_MODE_DESCRIPTIONS,
	MovieRenderModes,
	resolveSceneRenderMode
} from '../../../shared/movie/render/MovieRenderModes.js';
import { buildRenderGraph } from '../../../shared/movie/render/RenderGraph.js';
import { createInstantMovieTemplate } from '../../../shared/movie/examples/InstantMovieTemplates.js';
import {
	movieImageSources,
	sharedPhotoImageCache
} from '../../../shared/movie/runtime/PhotoImageCache.js';
import { commitStudioEditorMovie } from '../editor/StudioEditorCommit.js';
import { studioExportFileName, studioExportResolution } from '../export/StudioExportSettings.js';

export function createStudioGenerateActions(session) {
	return {
		/** Write the chosen render mode into the canonical movie itself, so JSON, preview, and export agree. */
		selectGenerateRenderMode({ event, store }) {
			const mode = event?.currentTarget?.dataset?.renderMode;
			if (!MovieRenderModes.includes(mode)) return;
			const movie = structuredClone(store.get('movie'));
			movie.render = { ...(movie.render || {}), mode };
			const committed = commitStudioEditorMovie(session, store, movie, {
				historyLabel: 'Set render mode',
				status: `Render mode · ${labelFor(mode)} — ${MOVIE_RENDER_MODE_DESCRIPTIONS[mode]}`
			});
			store.set('viewportMode', effectiveViewportMode(committed, store));
		},

		/** Generate from the current JSON (the draft box when edited, else the loaded movie) and play it now. */
		async generateInstantMovie({ store }) {
			try {
				let movie = store.get('movie');
				const draft = store.get('jsonDraft');
				if (draft && draft.trim() && draft !== JSON.stringify(movie, null, 2)) {
					await session.loadDocument(JSON.parse(draft));
					movie = store.get('movie');
				}
				presentGeneratedMovie(session, store, movie);
			} catch (error) {
				store.set('status', `Generate error: ${error.message}`);
			}
		},

		/** Load one of the three instant proof templates and generate it immediately. */
		async loadInstantTemplate({ event, store }) {
			const id = event?.currentTarget?.dataset?.instantTemplate;
			try {
				await session.loadDocument(createInstantMovieTemplate(id));
				presentGeneratedMovie(session, store, store.get('movie'));
			} catch (error) {
				store.set('status', `Template error: ${error.message}`);
			}
		},

		/** One-click MP4 export of the current movie through Studio's existing native export stack and selected mode. */
		async generateInstantExport({ store }) {
			if (store.get('exporting')) return;
			const movie = structuredClone(store.get('movie'));
			const size = studioExportResolution(store.get('exportResolution'));
			store.update(state => {
				state.exporting = true;
				state.exportProgress = 0;
				state.exportStatus = 'Preparing instant export…';
			});
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
					state.exportStatus = `Export complete · ${result.fileName}`;
					state.status = state.exportStatus;
				});
			} catch (error) {
				store.update(state => {
					state.exporting = false;
					state.exportStatus = `Export failed: ${error.message}`;
					state.status = state.exportStatus;
				});
			}
		}
	};
}

/** Summarize the render graph honestly, warm the photographs, rewind, and play. */
function presentGeneratedMovie(session, store, movie) {
	const graph = buildRenderGraph(movie);
	const counts = { '2d': 0, '3d': 0, hybrid: 0 };
	for (const plan of graph.scenes) counts[plan.mode.effective] += 1;
	const summary = Object.entries(counts)
		.filter(([, count]) => count > 0)
		.map(([mode, count]) => `${count} scene${count === 1 ? '' : 's'} ${labelFor(mode)}`)
		.join(' · ');
	void sharedPhotoImageCache.preload(movieImageSources(movie))
		.then(() => session.rebind?.());
	let note = '';
	const needsStage = graph.scenes.some(plan => plan.mode.effective !== MovieRenderMode.TWO_D);
	if (needsStage && !probeWebGL()) {
		note = ' WebGL is unavailable in this browser, so stage scenes show the flat renderer instead; switch the render mode to 2D Photo for the full photographic treatment.';
		store.set('viewportMode', MovieRenderMode.TWO_D);
	}
	const warningNote = graph.warnings.length
		? ` Warnings: ${graph.warnings.length} — first: ${graph.warnings[0].message}`
		: '';
	session.seek(0);
	session.playback.play(store.get('movie'));
	store.set('status', `Generated instantly · ${summary}.${note}${warningNote}`);
}

function effectiveViewportMode(movie, store) {
	const playhead = Number(store.get('playhead') || 0);
	const scene = (movie?.scenes || []).find(entry =>
		playhead >= entry.start && playhead < entry.start + entry.duration) || movie?.scenes?.[0];
	return resolveSceneRenderMode(movie, scene).effective;
}

function labelFor(mode) {
	if (mode === MovieRenderMode.TWO_D) return '2D Photo';
	if (mode === MovieRenderMode.THREE_D) return '3D Stage';
	if (mode === MovieRenderMode.HYBRID) return 'Hybrid';
	return 'Auto';
}

function probeWebGL() {
	try {
		if (typeof document === 'undefined') return false;
		const canvas = document.createElement('canvas');
		return Boolean(canvas.getContext('webgl2') || canvas.getContext('webgl'));
	} catch {
		return false;
	}
}
