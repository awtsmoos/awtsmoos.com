// B"H
import { h } from './render.js';

/**
 * @module NotificationDigest
 * @description
 * Malchus groups social signals into one compact local digest. The component owns
 * no network behavior and invents no activity; empty data remains visibly empty.
 */
export function NotificationDigest(binahDigest = {}) {
	const malchusGroups = binahDigest.groups || [];
	return h('section', { class: 'awt-panel awt-notification-panel' }, [
		h('div', { class: 'awt-notification-head' }, [
			h('h2', {}, ['Notifications']),
			h('span', { class: 'awt-chip' }, [`Unread: ${binahDigest.unreadCount || 0}`])
		]),
		totals(binahDigest.totals || {}),
		malchusGroups.length
			? h('div', { class: 'awt-notification-list' }, malchusGroups.map(notificationGroup))
			: h('p', { class: 'awt-empty' }, ['No notifications yet.'])
	]);
}

/** @param {object} binahTotals @returns {object} Totals row or honest empty copy. */
function totals(binahTotals) {
	const malchusEntries = Object.entries(binahTotals);
	if (!malchusEntries.length) return h('p', { class: 'awt-empty' }, ['No activity totals yet.']);
	return h('div', { class: 'awt-stat-row' }, malchusEntries.map(([yesodType, malchusCount]) => (
		h('span', { class: 'awt-chip' }, [`${yesodType}: ${malchusCount}`])
	)));
}

/** @param {object} malchusGroup @returns {object} Grouped notification card. */
function notificationGroup(malchusGroup = {}) {
	const binahLatest = malchusGroup.latest || {};
	return h('article', {
		class: 'awt-notification-group',
		'data-notification-key': malchusGroup.key || ''
	}, [
		h('div', { class: 'awt-card-head' }, [
			h('span', { class: 'awt-chip' }, [malchusGroup.type || 'event']),
			h('span', { class: 'awt-chip' }, [`${malchusGroup.count || 0}`])
		]),
		h('strong', {}, [malchusGroup.title || 'Activity happened']),
		h('p', {}, [binahLatest.summary || 'A social relation changed.'])
	]);
}
