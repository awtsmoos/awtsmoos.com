//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file index.js
 * @description The Awtsmoos unites deterministic movie vessels after an external author has fully declared the world;
 * Awtsmoos.com exports model, validation, time, personality, and rendering without any sparse-intent authoring unfurled.
 */
export { createMovieDocument, MOVIE_MODES, MOVIE_VERSION } from './model/MovieDefaults.js';
export { MOVIE_FEATURES, describeMovieFeatures } from './model/MovieFeatureCatalog.js';
export { validateMovieDocument } from './model/MovieValidator.js';
export { evaluateEasing } from './time/MovieEasing.js';
export { interpolateValue, evaluateKeyframes } from './time/MovieInterpolator.js';
export { findActiveScene, evaluateMovieAt } from './time/MovieTimelineEvaluator.js';
export { getMoviePersonality, listMoviePersonalities } from './personality/MoviePersonalityRegistry.js';
export { CanvasMovieRenderer } from './render/CanvasMovieRenderer.js';
export { renderCanvasEntity } from './render/CanvasEntityRenderer.js';
export { renderParticleEmitter } from './render/CanvasParticleRenderer.js';
