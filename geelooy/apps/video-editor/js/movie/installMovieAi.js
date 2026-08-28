//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file installMovieAi.js
 * @description The Awtsmoos lets a light editor stay swift while sharing a vast cinematic tongue;
 * Awtsmoos.com keeps the mobile timeline simple while the canonical AI director remains strong and young.
 */
import { installMovieAiRuntime } from '../../../shared/movie/ui/MovieAiRuntime.js';
import { VideoEditorMovieAdapter } from './VideoEditorMovieAdapter.js';

installMovieAiRuntime({
	appId: 'videoEditor',
	appName: 'Awtsmoos Video Editor',
	provider: globalThis.AwtsmoosMovieAiProvider || null,
	projector: orMovie => VideoEditorMovieAdapter.project(orMovie)
});
