// B"H
/**
 * @module NotificationDigestComponent
 * @description
 * Chapter 81: Notifications become lamps instead of sparks.
 * Each group shows count, title, latest event, and type so the user can feel
 * the network moving without drowning in every raw graph edge.
 */
import { h } from './render.js';

export function NotificationDigest(digest = {}) {
    const groups = digest.groups || [];
    return h('section', { class: 'awt-panel awt-notification-panel' }, [
        h('div', { class: 'awt-notification-head' }, [
            h('h2', {}, ['Notifications']),
            h('span', { class: 'awt-chip' }, [`Unread: ${digest.unreadCount || 0}`])
        ]),
        totals(digest.totals || {}),
        groups.length ? h('div', { class: 'awt-notification-list' }, groups.map(groupCard)) : h('p', { class: 'awt-empty' }, ['No notifications yet.'])
    ]);
}

function totals(source) {
    const entries = Object.entries(source);
    if (!entries.length) return h('p', { class: 'awt-empty' }, ['No activity totals yet.']);
    return h('div', { class: 'awt-stat-row' }, entries.map(([type, count]) => h('span', { class: 'awt-chip' }, [`${type}: ${count}`])));
}

function groupCard(group) {
    const latest = group.latest || {};
    return h('article', { class: 'awt-notification-group', 'data-notification-key': group.key || '' }, [
        h('div', { class: 'awt-card-head' }, [
            h('span', { class: 'awt-chip' }, [group.type || 'event']),
            h('span', { class: 'awt-chip' }, [`${group.count || 0}`])
        ]),
        h('strong', {}, [group.title || 'Activity happened']),
        h('p', {}, [latest.summary || 'A social relation changed.'])
    ]);
}
