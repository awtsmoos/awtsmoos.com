// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module BinahNotificationDigestProjector
 * @description
 * The Awtsmoos gathers many sparks into one meaningful movement; Awtsmoos.com
 * lets Binah group timeline events into readable notification clusters while
 * MalchusNotificationTitles owns language and the graph layer owns event creation.
 */
import { buildTimeline } from '../graph/timeline.js';
import { MalchusNotificationTitles } from './MalchusNotificationTitles.js';

export class BinahNotificationDigestProjector {
	/**
	 * Preserves the semantic difference between explicit events and derivable data.
	 * @param {object} [binahSource={}] Explicit events or raw social records.
	 */
	constructor(binahSource = {}) {
		this.malchusEvents = Array.isArray(binahSource.events)
			? binahSource.events
			: buildTimeline(binahSource);
	}

	/** @returns {object} Grouped notification digest. */
	project() {
		const malchusGroups = this.groupEvents();
		return {
			groups: malchusGroups,
			totals: summarizeTotals(malchusGroups),
			unreadCount: malchusGroups.reduce(
				(binahSum, malchusGroup) => binahSum + malchusGroup.count,
				0
			)
		};
	}

	/** @returns {Array<object>} Stable grouped events sorted by density and title. */
	groupEvents() {
		const yesodGroups = new Map();
		for (const malchusEvent of this.malchusEvents) {
			const yesodKey = groupKey(malchusEvent);
			if (!yesodGroups.has(yesodKey)) {
				yesodGroups.set(yesodKey, createGroup(malchusEvent, yesodKey));
			}
			yesodGroups.get(yesodKey).events.push(malchusEvent);
		}
		return [...yesodGroups.values()]
			.map(finalizeGroup)
			.sort(compareGroups);
	}
}

/** @param {object} malchusEvent @returns {string} Semantic cluster identity. */
function groupKey(malchusEvent) {
	const chesedPrefixes = {
		created: 'created',
		commented: 'commented',
		'on-post': 'post',
		'replied-to': 'reply',
		'has-media': 'media'
	};
	const malchusPrefix = chesedPrefixes[malchusEvent.type];
	if (!malchusPrefix) {
		return `${malchusEvent.type}:${malchusEvent.actorId}:${malchusEvent.objectType}`;
	}
	const yesodIdentity = ['on-post', 'replied-to'].includes(malchusEvent.type)
		? malchusEvent.objectId
		: malchusEvent.actorId;
	return `${malchusPrefix}:${yesodIdentity}`;
}

/** @param {object} malchusEvent @param {string} yesodKey @returns {object} Mutable internal group. */
function createGroup(malchusEvent, yesodKey) {
	return {
		key: yesodKey,
		type: malchusEvent.type,
		actorLabel: malchusEvent.actorLabel,
		objectType: malchusEvent.objectType,
		events: []
	};
}

/** @param {object} yesodGroup @returns {object} Public digest group. */
function finalizeGroup(yesodGroup) {
	return {
		key: yesodGroup.key,
		type: yesodGroup.type,
		title: MalchusNotificationTitles.reveal(yesodGroup),
		count: yesodGroup.events.length,
		latest: yesodGroup.events[0] || null,
		events: yesodGroup.events
	};
}

/** @param {object} malchusLeft @param {object} malchusRight @returns {number} Dense groups first. */
function compareGroups(malchusLeft, malchusRight) {
	return malchusRight.count - malchusLeft.count
		|| malchusLeft.title.localeCompare(malchusRight.title);
}

/** @param {Array<object>} malchusGroups @returns {Record<string,number>} Counts by event type. */
function summarizeTotals(malchusGroups) {
	return malchusGroups.reduce((binahTotals, malchusGroup) => {
		binahTotals[malchusGroup.type] = (binahTotals[malchusGroup.type] || 0) + malchusGroup.count;
		return binahTotals;
	}, {});
}
