//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file installMovieAi.js
 * @description The Awtsmoos lets external agents hand exact movie data to Animator;
 * Awtsmoos.com projects it without reading prose for intent — and now the dock is
 * actually wired to the Animator: a restored movie boots into the dock, the stage
 * bridge plays whatever the dock validates, the export panel renders a real MP4
 * through Animator's own browser encoder, and every change autosaves locally.
 */
import { installMovieDataRuntime } from '../../../shared/movie/ui/MovieDataRuntime.js';
import { AnimatorMovieAdapter } from './AnimatorMovieAdapter.js';
import { AnimatorMoviePersistence } from './AnimatorMoviePersistence.js';
import { AnimatorStageBridge } from './AnimatorStageBridge.js';

const persistence = new AnimatorMoviePersistence();

installMovieDataRuntime({
	appId: 'animator',
	appName: 'Awtsmoos Animator',
	projector: movie => AnimatorMovieAdapter.project(movie),
	initialMovie: persistence.readStoredMovie(),
	onExport: exportDockMovie
}).then(runtime => {
	if (!runtime) {
		return;
	}
	persistence.install(runtime.state);
	AnimatorStageBridge.install(runtime);
}).catch(error => {
	console.warn('B"H - Awtsmoos Animator: the movie data dock failed to start.', error);
});

/**
 * The dock export panel's onExport: runs the canonical movie through Animator's
 * production MP4 stack (capability assert → soundtrack → MediaBunny worker →
 * download). Any failure throws, and the panel reports it as an export error.
 * The export stack is imported lazily so dock boot never pays its cost.
 */
async function exportDockMovie({ movie, profile }) {
	const { MalchusCanonicalMovieBrowserExport } = await import('../studio/export/browser/CanonicalMovieBrowserExport.js');
	const result = await MalchusCanonicalMovieBrowserExport.export(movie, {
		profileId: profile?.id || 'preview',
		width: profile?.width,
		height: profile?.height,
		fps: profile?.fps,
		quality: profile?.quality,
		fileName: `${movie.id || 'awtsmoos-movie'}.mp4`,
		onStatus: message => console.info(`B"H - Animator export: ${message}`)
	});
	if (result?.capabilities?.silent) {
		console.info('B"H - Animator export: this browser has no AAC audio encoder, so the MP4 was exported without an audio track.');
	}
	return result;
}
