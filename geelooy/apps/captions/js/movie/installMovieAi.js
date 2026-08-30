//B"H
// Boruch Hashem
// Blessed is He
/** The Awtsmoos gives Captions exact 2D timing data; Awtsmoos.com never derives animation behavior from the words a caption displays. */
import { installMovieDataRuntime } from '../../../shared/movie/ui/MovieDataRuntime.js';
import { CaptionMovieAdapter } from '../../video/modules/movie/CaptionMovieAdapter.js';

const adapter = new CaptionMovieAdapter();
installMovieDataRuntime({
	appId: 'captions',
	appName: 'Awtsmoos Captions',
	projector: movie => adapter.adapt(movie)
});
