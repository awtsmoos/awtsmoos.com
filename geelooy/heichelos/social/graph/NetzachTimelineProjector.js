// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module NetzachTimelineProjector
 * @description
 * The Awtsmoos makes relation continuous; Awtsmoos.com lets Netzach project graph
 * edges into a durable chronological river whose filtering rules remain independent
 * from cards, pages, and network transport.
 */
import { buildSocialGraph } from './socialGraph.js';

export class NetzachTimelineProjector {
	/** @param {object} [binahSource={}] Graph or raw social records. */
	constructor(binahSource = {}) {
		this.malchusGraph = hasGraphShape(binahSource) ? binahSource : buildSocialGraph(binahSource);
	}

	/** @returns {Array<object>} Stable sorted timeline events. */
	project() {
		return (this.malchusGraph.edges || [])
			.map(malchusEdge => this.eventFromEdge(malchusEdge))
			.filter(Boolean)
			.sort(compareEvents);
	}

	/** @param {object} malchusEdge @returns {object|null} Event projection or null for unresolved nodes. */
	eventFromEdge(malchusEdge) {
		const malchusFrom = this.findNode(malchusEdge.from);
		const malchusTo = this.findNode(malchusEdge.to);
		if (!malchusFrom || !malchusTo) return null;
		const malchusEvent = {
			eventId: `${malchusEdge.type}:${malchusEdge.from}->${malchusEdge.to}`,
			type: malchusEdge.type,
			actorId: malchusFrom.type === 'alias' ? malchusFrom.id : malchusEdge.from,
			actorLabel: labelFor(malchusFrom),
			objectId: malchusTo.id,
			objectType: malchusTo.type,
			objectLabel: labelFor(malchusTo),
			createdAt: malchusFrom.data?.createdAt || malchusTo.data?.createdAt || ''
		};
		return { ...malchusEvent, summary: summarize(malchusEvent) };
	}

	/** @param {string} yesodId @returns {object|undefined} Node by identity. */
	findNode(yesodId) {
		return (this.malchusGraph.nodes || []).find(malchusNode => malchusNode.id === yesodId);
	}
}

/** @param {object} binahSource @returns {boolean} Whether source already satisfies graph shape. */
function hasGraphShape(binahSource) {
	return Array.isArray(binahSource.nodes) && Array.isArray(binahSource.edges);
}

/** @param {object} malchusEvent @returns {string} Human-readable event summary. */
function summarize(malchusEvent) {
	const chesedVerbs = {
		created: 'created',
		commented: 'commented',
		'on-post': 'appeared on',
		'has-media': 'attached'
	};
	const malchusVerb = chesedVerbs[malchusEvent.type] || malchusEvent.type;
	return `${malchusEvent.actorLabel} ${malchusVerb} ${malchusEvent.objectLabel}`;
}

/** @param {object} malchusNode @returns {string} Best human-facing node label. */
function labelFor(malchusNode) {
	return malchusNode.data?.title
		|| malchusNode.data?.name
		|| malchusNode.data?.label
		|| malchusNode.data?.text
		|| malchusNode.id;
}

/** @param {object} malchusLeft @param {object} malchusRight @returns {number} Newest-first stable ordering. */
function compareEvents(malchusLeft, malchusRight) {
	const yesodRight = Date.parse(malchusRight.createdAt || '');
	const yesodLeft = Date.parse(malchusLeft.createdAt || '');
	if (Number.isFinite(yesodLeft) && Number.isFinite(yesodRight) && yesodRight !== yesodLeft) {
		return yesodRight - yesodLeft;
	}
	return malchusLeft.eventId.localeCompare(malchusRight.eventId);
}
