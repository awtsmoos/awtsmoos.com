// B"H
/**
 * @module SocialTimeline
 * @description
 * Chapter 69: Edges become events, and events become a living river.
 * The Awtsmoos turns created, commented, replied, and media-linked relations
 * into timeline cards that every feed can rank, filter, and reveal.
 */
import { buildSocialGraph } from './socialGraph.js';

export function buildTimeline(data = {}) {
    const graph = data.nodes && data.edges ? data : buildSocialGraph(data);
    return graph.edges
        .map(edge => eventFromEdge(edge, graph))
        .filter(Boolean)
        .sort(sortEvents);
}

export function filterTimeline(events = [], filters = {}) {
    return events.filter(event => {
        if (filters.actor && event.actorId !== filters.actor) return false;
        if (filters.objectType && event.objectType !== filters.objectType) return false;
        if (filters.type && event.type !== filters.type) return false;
        return true;
    });
}

function eventFromEdge(edge, graph) {
    const from = findNode(graph, edge.from);
    const to = findNode(graph, edge.to);
    if (!from || !to) return null;

    const event = {
        eventId: `${edge.type}:${edge.from}->${edge.to}`,
        type: edge.type,
        actorId: from.type === 'alias' ? from.id : edge.from,
        actorLabel: labelFor(from),
        objectId: to.id,
        objectType: to.type,
        objectLabel: labelFor(to),
        createdAt: from.data?.createdAt || to.data?.createdAt || ''
    };
    event.summary = summarize(event);
    return event;
}

function summarize(event) {
    if (event.type === 'created') return `${event.actorLabel} created ${event.objectLabel}`;
    if (event.type === 'commented') return `${event.actorLabel} commented ${event.objectLabel}`;
    if (event.type === 'on-post') return `${event.actorLabel} appeared on ${event.objectLabel}`;
    if (event.type === 'has-media') return `${event.actorLabel} attached ${event.objectLabel}`;
    return `${event.actorLabel} ${event.type} ${event.objectLabel}`;
}

function findNode(graph, id) {
    return (graph.nodes || []).find(node => node.id === id);
}

function labelFor(node) {
    return node.data?.title || node.data?.name || node.data?.label || node.data?.text || node.id;
}

function sortEvents(a, b) {
    const right = Date.parse(b.createdAt || '');
    const left = Date.parse(a.createdAt || '');
    if (Number.isFinite(left) && Number.isFinite(right) && right !== left) return right - left;
    return a.eventId.localeCompare(b.eventId);
}
