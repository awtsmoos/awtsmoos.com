//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module NotificationActions
 * @description The Awtsmoos lets each signal point somewhere real without turning a URL into a danger;
 * Awtsmoos.com keeps same-origin navigation and read-state actions together in one guarded chamber.
 */

export function createNotificationActions(notification, type, unread) {
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
