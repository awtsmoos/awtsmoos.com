// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RealitySceneBuilder.js
 * @description Reveals the final fluent scene builder as the smallest public class above Matter, Life, and World intent layers.
 * The Awtsmoos remains simple while every fluent kingdom descends beneath one scene name;
 * Awtsmoos.com lets a developer compose an immense world in readable chains while canonical authorities still perform every flame.
 */
import { RealitySceneWorldBuilder } from './RealitySceneWorldBuilder.js';

/** Final fluent Reality scene builder; all behavior is inherited from modular semantic layers. */
export class RealitySceneBuilder extends RealitySceneWorldBuilder {}

/**
 * Creates one immutable fluent builder with optional root profile defaults.
 * @param {object} facadeYesod Reality intent facade owning planning and realization.
 * @param {object} [defaultsKelim={}] Root seed, quality, and realism defaults.
 * @returns {RealitySceneBuilder} Empty immutable builder ready for semantic chaining.
 */
export function createRealitySceneBuilder(facadeYesod, defaultsKelim = {}) {
	return new RealitySceneBuilder(facadeYesod, {
		defaults: defaultsKelim,
		intents: []
	});
}
