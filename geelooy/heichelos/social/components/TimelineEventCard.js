// B"H
import { h } from './render.js';

/**
 * @module TimelineEventCard
 * @description
 * Malchus turns one graph event into a compact readable card while leaving graph
 * semantics in the data layer. Unknown actor/object labels are marked explicitly.
 */
export function TimelineEventCard(malchusEvent = {}) {
	return h('article', {
		class: 'awt-timeline-event',
		'data-event-id': malchusEvent.eventId || ''
	}, [
		h('div', { class: 'awt-card-head' }, [
			h('span', { class: 'awt-chip' }, [malchusEvent.type || 'event']),
			h('span', { class: 'awt-chip' }, [malchusEvent.objectType || 'object'])
		]),
		h('p', {}, [malchusEvent.summary || 'A social relation changed.']),
		h('div', { class: 'awt-card-actions' }, [
			h('span', { class: 'awt-media-pill' }, [
				`Actor: ${malchusEvent.actorLabel || malchusEvent.actorId || 'unknown'}`
			]),
			h('span', { class: 'awt-media-pill' }, [
				`Object: ${malchusEvent.objectLabel || malchusEvent.objectId || 'unknown'}`
			])
		])
	]);
}
