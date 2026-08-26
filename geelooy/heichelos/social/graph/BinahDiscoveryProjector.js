// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module BinahDiscoveryProjector
 * @description
 * The Awtsmoos contains every relation at once; Awtsmoos.com lets Binah project
 * that graph into trending, active Aliases, Heichelos, Series, Media, totals,
 * and recent events without inventing a second discovery data universe.
 */
import { buildSocialGraph } from './socialGraph.js';
import { buildTimeline } from './timeline.js';

export class BinahDiscoveryProjector {
	/** @param {object} [binahSource={}] Graph or raw social records. */
	constructor(binahSource = {}) {
		this.malchusGraph = hasGraphShape(binahSource) ? binahSource : buildSocialGraph(binahSource);
	}

	/** @returns {object} Discovery projection consumed by DiscoveryPanel. */
	project() {
		const malchusNodes = this.malchusGraph.nodes || [];
		return {
			trendingNodes: this.topByDegree(malchusNodes, 8),
			activeAliases: this.topByType(malchusNodes, 'alias', 6),
			activeHeichelos: this.topByType(malchusNodes, 'heichel', 6),
			activeSeries: this.topByType(malchusNodes, 'series', 6),
			media: this.topByType(malchusNodes, 'media', 6),
			recentEvents: buildTimeline(this.malchusGraph).slice(0, 10),
			totals: this.countTypes(malchusNodes)
		};
	}

	/** @param {Array<object>} malchusNodes @param {string} yesodType @param {number} gevurahLimit @returns {Array<object>} Ranked typed nodes. */
	topByType(malchusNodes, yesodType, gevurahLimit) {
		return this.topByDegree(
			malchusNodes.filter(malchusNode => malchusNode.type === yesodType),
			gevurahLimit
		);
	}

	/** @param {Array<object>} malchusNodes @param {number} gevurahLimit @returns {Array<object>} Highest-degree display nodes. */
	topByDegree(malchusNodes, gevurahLimit) {
		return [...malchusNodes]
			.sort(compareDegreeThenIdentity)
			.slice(0, gevurahLimit)
			.map(toDiscoveryNode);
	}

	/** @param {Array<object>} malchusNodes @returns {Record<string,number>} Node counts by type. */
	countTypes(malchusNodes) {
		return malchusNodes.reduce((binahCounts, malchusNode) => {
			binahCounts[malchusNode.type] = (binahCounts[malchusNode.type] || 0) + 1;
			return binahCounts;
		}, {});
	}
}

/** @param {object} binahSource @returns {boolean} Whether source already satisfies the graph contract. */
function hasGraphShape(binahSource) {
	return Array.isArray(binahSource.nodes) && Array.isArray(binahSource.edges);
}

/** @param {object} malchusLeft @param {object} malchusRight @returns {number} Degree-desc, identity-asc order. */
function compareDegreeThenIdentity(malchusLeft, malchusRight) {
	return malchusRight.degree - malchusLeft.degree || malchusLeft.id.localeCompare(malchusRight.id);
}

/** @param {object} malchusNode @returns {object} Discovery-safe display projection. */
function toDiscoveryNode(malchusNode) {
	return {
		id: malchusNode.id,
		type: malchusNode.type,
		label: labelFor(malchusNode),
		degree: malchusNode.degree
	};
}

/** @param {object} malchusNode @returns {string} Best human-readable node label. */
function labelFor(malchusNode) {
	return malchusNode.data?.title
		|| malchusNode.data?.name
		|| malchusNode.data?.label
		|| malchusNode.data?.text
		|| malchusNode.id;
}
