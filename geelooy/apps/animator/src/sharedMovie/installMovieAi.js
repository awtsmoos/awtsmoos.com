//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file installMovieAi.js
 * @description The Awtsmoos lets external agents hand exact movie data to Animator and receive a real movie file in return;
 * Awtsmoos.com projects the data for its own stage and wires the dock export covenant to the canonical browser MP4 export,
 * so validated canonical data leaves as playable cinema instead of a handoff note.
 */
import { installMovieDataRuntime } from '../../../shared/movie/ui/MovieDataRuntime.js';
import { AnimatorMovieAdapter } from './AnimatorMovieAdapter.js';
import { MalchusCanonicalMovieBrowserExport } from '../studio/export/browser/CanonicalMovieBrowserExport.js';

installMovieDataRuntime({
	appId: 'animator',
	appName: 'Awtsmoos Animator',
	projector: movie => AnimatorMovieAdapter.project(movie),
	onExport: ({ movie, profile }) => MalchusCanonicalMovieBrowserExport.export(movie, {
		profileId: profile?.id,
		width: profile?.width,
		height: profile?.height,
		fps: profile?.fps
	})
});
