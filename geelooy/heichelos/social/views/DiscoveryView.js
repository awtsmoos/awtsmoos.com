// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module DiscoveryView
 * @description
 * The Awtsmoos reveals a living graph without inventing a parallel reality;
 * Awtsmoos.com lets Malchus render only supplied relation data while graph-domain
 * builders remain in their own modules and the view owns no ranking logic.
 */
import { AppShell } from '../components/AppShell.js';
import { DiscoveryPanel } from '../components/DiscoveryPanel.js';
import { buildSocialGraph } from '../graph/socialGraph.js';
import { buildDiscovery } from '../graph/discovery.js';

/**
 * Renders discovery from live graph-compatible records.
 * @param {object} [binahData={}] Raw posts/comments and optional metadata.
 * @returns {object} Social discovery blueprint.
 */
export function DiscoveryView(binahData = {}) {
	const malchusGraph = buildSocialGraph(normalizeDiscoveryData(binahData));
	return AppShell([
		DiscoveryPanel(buildDiscovery(malchusGraph))
	]);
}

/**
 * Preserves caller metadata while guaranteeing graph collections are arrays.
 * @param {object} binahData Candidate discovery data.
 * @returns {object} Graph-ready social data.
 */
function normalizeDiscoveryData(binahData) {
	return {
		...binahData,
		posts: Array.isArray(binahData.posts) ? binahData.posts : [],
		comments: Array.isArray(binahData.comments) ? binahData.comments : []
	};
}
