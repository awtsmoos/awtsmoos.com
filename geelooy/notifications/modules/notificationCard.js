//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module NotificationCard
 * @description
 * The Awtsmoos clothes each true signal in a readable vessel at Awtsmoos.com;
 * type, time, urgency, and action remain honest to the data that actually arrived.
 */
const ICONS = Object.freeze({
	comment: '💬',
	mention: '@',
	submission_created: '✍',
	system: '⚙'
});

export function createNotificationCard(notification) {
	const unread = !notification?.read;
	const type = String(notification?.type || 'signal');
	const card = document.createElement('article');
	card.className = `notification ${unread ? 'unread' : 'read'}`;
	card.setAttribute('aria-label', `${unread ? 'Unread' : 'Read'} ${humanizeType(type)}`);
	card.append(
		createIcon(type),
		createTitle(notification, type),
		createBody(notification),
		createMeta(notification, type, unread),
		createActions(notification, type, unread)
	);
	return card;
}

function createIcon(type) {
	const icon = document.createElement('span');
	icon.className = 'notification-icon';
	icon.setAttribute('aria-hidden', 'true');
	icon.textContent = type.startsWith('mission') ? '◆' : (ICONS[type] || '•');
	return icon;
}

function createTitle(notification, type) {
	const title = document.createElement('h2');
	title.textContent = notification?.title || humanizeType(type);
	return title;
}

function createBody(notification) {
	const body = document.createElement('p');
	body.textContent = notification?.body || notification?.message || 'No additional message was provided.';
	return body;
}

function createMeta(notification, type, unread) {
	const meta = document.createElement('div');
	meta.className = 'notification-meta';
	const badge = document.createElement('span');
	badge.className = `notification-state-badge ${unread ? 'unread' : 'read'}`;
	badge.textContent = unread ? 'Unread' : 'Read';
	const kind = document.createElement('span');
	kind.textContent = humanizeType(type);
	const time = document.createElement('time');
	const formatted = formatTime(notification?.createdAt);
	time.textContent = formatted.label;
	if (formatted.dateTime) time.dateTime = formatted.dateTime;
	meta.append(badge, kind, time);
	return meta;
}

function createActions(notification, type, unread) {
	const actions = document.createElement('div');
	actions.className = 'notification-row-actions';
	const link = safeActionLink(notification?.actionUrl, type);
	if (link) actions.append(link);
	const id = notification?.id || notification?.notificationId;
	if (unread && id) actions.append(markButton(id));
	return actions;
}

function markButton(id) {
	const button = document.createElement('button');
	button.type = 'button';
	button.dataset.markRead = String(id);
	button.textContent = 'Mark read';
	return button;
}

function safeActionLink(value, type) {
	if (!value) return null;
	try {
		const url = new URL(String(value), location.href);
		if (url.origin !== location.origin) return null;
		const link = document.createElement('a');
		link.className = 'g-button';
		link.href = `${url.pathname}${url.search}${url.hash}`;
		link.textContent = actionLabel(type);
		return link;
	} catch {
		return null;
	}
}

function actionLabel(type) {
	if (type === 'comment' || type === 'mention') return 'Open conversation';
	if (type.includes('submission')) return 'Review submission';
	if (type.startsWith('mission')) return 'Open mission';
	return 'View details';
}

function humanizeType(type) {
	return type.split('_').filter(Boolean).map(word => `${word[0]?.toUpperCase() || ''}${word.slice(1)}`).join(' ') || 'Signal';
}

function formatTime(value) {
	if (!value) return { label: 'Unknown time', dateTime: '' };
	const date = new Date(value);
	if (Number.isNaN(date.getTime())) return { label: 'Unknown time', dateTime: '' };
	return { label: date.toLocaleString(), dateTime: date.toISOString() };
}
