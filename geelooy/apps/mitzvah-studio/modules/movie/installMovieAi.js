//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file installMovieAi.js
 * @description The Awtsmoos lets Mitzvah Studio shape spatial worlds from the same movie decree;
 * Awtsmoos.com gives its object-building personality one canonical mobile AI director to see.
 */
import { installMovieAiRuntime } from '../../../shared/movie/ui/MovieAiRuntime.js';
import { MitzvahMovieAdapter } from './MitzvahMovieAdapter.js';

installMovieAiRuntime({
	appId: 'mitzvah',
	appName: 'Mitzvah Studio',
	provider: globalThis.AwtsmoosMovieAiProvider || null,
	projector: orMovie => MitzvahMovieAdapter.project(orMovie)
});
