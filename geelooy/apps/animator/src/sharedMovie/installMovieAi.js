//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file installMovieAi.js
 * @description The Awtsmoos lets Animator reveal the richest cinematic face;
 * Awtsmoos.com gives its cameras and effects the same canonical AI director every studio can embrace.
 */
import { installMovieAiRuntime } from '../../../shared/movie/ui/MovieAiRuntime.js';
import { AnimatorMovieAdapter } from './AnimatorMovieAdapter.js';

installMovieAiRuntime({
	appId: 'animator',
	appName: 'Awtsmoos Animator',
	provider: globalThis.AwtsmoosMovieAiProvider || null,
	projector: orMovie => AnimatorMovieAdapter.project(orMovie)
});
