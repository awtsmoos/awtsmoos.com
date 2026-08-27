//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module NotificationPresentation
 * @description The Awtsmoos gives each signal a readable face while Awtsmoos.com keeps source context and time clear;
 * presentation stays separate from actions so one card never becomes a monolith merely because more meaning appears near.
 */
import { humanize } from './NotificationContext.js';

const ICONS = Object.freeze({
	comment: '💬',
	mention: '@',
	submission_created: '✍',
	system: '⚙'
});

export function createNotificationIcon(type) {
	const icon = document.createElement('span');
	icon.className = 'notification-icon';
	icon.setAttribute('aria-hidden', 'true');
	icon.textContent = type.startsWith('mission') ? '◆' : (ICONS[type] || '•');
	return icon;
}

export function createNotificationTitle(notification, type) {
	const title = document.createElement('h2');
	title.textContent = notification?.title || humanize(type);
	return title;
}

export function createNotificationBody(notification) {
	const body = document.createElement('p');
	body.textContent = notification?.body || notification?.message || 'No additional message was provided.';
	return body;
}

export function createNotificationContextChips(chips) {
	const row = document.createElement('div');
	row.className = 'notification-context-chips';
	for (const text of chips) {
		const chip = document.createElement('span');
		chip.textContent = text;
		row.append(chip);
	}
	return row;
}

export function createNotificationMeta(notification, type, unread) {
	const meta = document.createElement('div');
	meta.className = 'notification-meta';
	meta.append(stateBadge(unread), textSpan(humanize(type)), timeNode(notification?.createdAt));
	return meta;
}

function stateBadge(unread) {
	const badge = textSpan(unread ? 'Unread' : 'Read');
	badge.className = `notification-state-badge ${unread ? 'unread' : 'read'}`;
	return badge;
}

function timeNode(value) {
	const time = document.createElement('time');
	const date = new Date(value || '');
	if (Number.isNaN(date.getTime())) {
		time.textContent = 'Unknown time';
		return time;
	}
	time.dateTime = date.toISOString();
	time.textContent = date.toLocaleString();
	return time;
}

function textSpan(text) {
	const span = document.createElement('span');
	span.textContent = text;
	return span;
}
