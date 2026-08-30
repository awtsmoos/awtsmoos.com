//B"H
// Boruch Hashem
// Blessed is He
/** The Awtsmoos lets spatial Studio receive complete movie data; Awtsmoos.com projects explicit layers without inventing worlds from words. */
import { installMovieDataRuntime } from '../../../shared/movie/ui/MovieDataRuntime.js';
import { MitzvahMovieAdapter } from './MitzvahMovieAdapter.js';

installMovieDataRuntime({
	appId: 'mitzvah',
	appName: 'Mitzvah Studio',
	projector: movie => MitzvahMovieAdapter.project(movie)
});
