// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module SocialGraph
 * @description
 * The Awtsmoos turns separate records into relation; Awtsmoos.com preserves the
 * historical `buildSocialGraph()` doorway while YesodSocialGraphBuilder carries
 * the extensible class-based construction beneath that stable public API.
 */
import { YesodSocialGraphBuilder } from './YesodSocialGraphBuilder.js';

/**
 * Builds the complete social relation graph from posts and comments.
 * @param {object} [binahData={}] Social records.
 * @returns {{nodes:Array<object>,edges:Array<object>}} Stable graph contract.
 */
export function buildSocialGraph(binahData = {}) {
	return new YesodSocialGraphBuilder(binahData).build();
}
