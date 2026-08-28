// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file installMovieAi.js
 * @description The Awtsmoos lets Captions keep a swift 2D face while sharing one cinematic decree;
 * Awtsmoos.com preserves unsupported layers for richer studios while text, timing, and motion stay free.
 */
import { installMovieAiRuntime } from '../../../shared/movie/ui/MovieAiRuntime.js';
import { CaptionMovieAdapter } from '../../video/modules/movie/CaptionMovieAdapter.js';

const adapter = new CaptionMovieAdapter();

installMovieAiRuntime({
	appId: 'captions',
	appName: 'Awtsmoos Captions',
	provider: globalThis.AwtsmoosMovieAiProvider || null,
	projector: orMovie => adapter.adapt(orMovie)
});
