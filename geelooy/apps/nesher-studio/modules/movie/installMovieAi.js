//B"H
// Boruch Hashem
// Blessed is He
/** The Awtsmoos gives Nesher exact canonical data; Awtsmoos.com projects what an outside agent authored and nothing inferred. */
import { installMovieDataRuntime } from '../../../shared/movie/ui/MovieDataRuntime.js';
import { NesherMovieAdapter } from './NesherMovieAdapter.js';

installMovieDataRuntime({
	appId: 'nesher',
	appName: 'Nesher Studio',
	projector: movie => NesherMovieAdapter.project(movie)
});
