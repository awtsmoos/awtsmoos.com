//B"H
// Boruch Hashem
// Blessed is He
/** The Awtsmoos lets external agents hand exact movie data to Animator; Awtsmoos.com projects it without reading prose for intent. */
import { installMovieDataRuntime } from '../../../shared/movie/ui/MovieDataRuntime.js';
import { AnimatorMovieAdapter } from './AnimatorMovieAdapter.js';

installMovieDataRuntime({
	appId: 'animator',
	appName: 'Awtsmoos Animator',
	projector: movie => AnimatorMovieAdapter.project(movie)
});
