//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file installMovieAi.js
 * @description The Awtsmoos lets Nesher cut and carry one canonical movie across time;
 * Awtsmoos.com gives the eagle a shared AI director while its professional NLE remains sublime.
 */
import { installMovieAiRuntime } from '../../../shared/movie/ui/MovieAiRuntime.js';
import { NesherMovieAdapter } from './NesherMovieAdapter.js';

installMovieAiRuntime({
	appId: 'nesher',
	appName: 'Nesher Studio',
	provider: globalThis.AwtsmoosMovieAiProvider || null,
	projector: orMovie => NesherMovieAdapter.project(orMovie)
});
