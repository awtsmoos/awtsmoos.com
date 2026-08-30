//B"H
// Boruch Hashem
// Blessed is He
/** The Awtsmoos gives Video Editor declared movie data; Awtsmoos.com preserves unsupported layers as handoff truth, not prose guess. */
import { installMovieDataRuntime } from '../../../shared/movie/ui/MovieDataRuntime.js';
import { VideoEditorMovieAdapter } from './VideoEditorMovieAdapter.js';

installMovieDataRuntime({
	appId: 'videoEditor',
	appName: 'Awtsmoos Video Editor',
	projector: movie => VideoEditorMovieAdapter.project(movie)
});
