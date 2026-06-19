// B"H
/**
 * @module NotificationDigest
 * @description
 * Chapter 80: The river of events learns to speak in clusters.
 * The Awtsmoos gathers graph actions into grouped notifications, so a user
 * sees meaningful movement instead of a storm of isolated sparks.
 */
import { buildTimeline } from '../graph/timeline.js';

export function buildNotificationDigest(data = {}) {
    const events = Array.isArray(data.events) ? data.events : buildTimeline(data);
    const groups = groupEvents(events);
    return {
        groups,
        totals: summarizeTotals(groups),
        unreadCount: groups.reduce((sum, group) => sum + group.count, 0)
    };
}

function groupEvents(events) {
    const map = new Map();
    for (const event of events) {
        const key = groupKey(event);
        if (!map.has(key)) map.set(key, createGroup(event, key));
        map.get(key).events.push(event);
    }
    return [...map.values()]
        .map(finalizeGroup)
        .sort((a, b) => b.count - a.count || a.title.localeCompare(b.title));
}

function groupKey(event) {
    if (event.type === 'created') return `created:${event.actorId}`;
    if (event.type === 'commented') return `commented:${event.actorId}`;
    if (event.type === 'on-post') return `post:${event.objectId}`;
    if (event.type === 'replied-to') return `reply:${event.objectId}`;
    if (event.type === 'has-media') return `media:${event.actorId}`;
    return `${event.type}:${event.actorId}:${event.objectType}`;
}

function createGroup(event, key) {
    return {
        key,
        type: event.type,
        actorLabel: event.actorLabel,
        objectType: event.objectType,
        events: []
    };
}

function finalizeGroup(group) {
    return {
        key: group.key,
        type: group.type,
        title: titleFor(group),
        count: group.events.length,
        latest: group.events[0] || null,
        events: group.events
    };
}

function titleFor(group) {
    if (group.type === 'created') return `${group.actorLabel} created ${plural(group.events.length, 'thing')}`;
    if (group.type === 'commented') return `${group.actorLabel} commented ${plural(group.events.length, 'time')}`;
    if (group.type === 'on-post') return `${group.events.length} comment ${group.events.length === 1 ? 'landed' : 'events landed'} on a post`;
    if (group.type === 'replied-to') return `${group.events.length} repl${group.events.length === 1 ? 'y' : 'ies'} in a thread`;
    if (group.type === 'has-media') return `${group.actorLabel} attached ${plural(group.events.length, 'media item')}`;
    return `${group.events.length} ${group.type} event${group.events.length === 1 ? '' : 's'}`;
}

function summarizeTotals(groups) {
    return groups.reduce((totals, group) => {
        totals[group.type] = (totals[group.type] || 0) + group.count;
        return totals;
    }, {});
}

function plural(count, noun) {
    return `${count} ${noun}${count === 1 ? '' : 's'}`;
}
