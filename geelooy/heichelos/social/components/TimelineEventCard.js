// B"H
/**
 * @module TimelineEventCard
 * @description
 * Chapter 73: The graph edge receives a face.
 * A hidden relation becomes a visible social moment: who acted, what changed,
 * and which vessel was touched in the unfolding stream.
 */
import { h } from './render.js';

export function TimelineEventCard(event = {}) {
    return h('article', { class: 'awt-timeline-event', 'data-event-id': event.eventId || '' }, [
        h('div', { class: 'awt-card-head' }, [
            h('span', { class: 'awt-chip' }, [event.type || 'event']),
            h('span', { class: 'awt-chip' }, [event.objectType || 'object'])
        ]),
        h('p', {}, [event.summary || 'A relation moved through the graph.']),
        h('div', { class: 'awt-card-actions' }, [
            h('span', { class: 'awt-media-pill' }, [`Actor: ${event.actorLabel || event.actorId || 'unknown'}`]),
            h('span', { class: 'awt-media-pill' }, [`Object: ${event.objectLabel || event.objectId || 'unknown'}`])
        ])
    ]);
}
