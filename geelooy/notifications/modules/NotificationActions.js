//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module NotificationActions
 * @description The Awtsmoos lets each signal point somewhere real without making every possible command equally loud;
 * Awtsmoos.com keeps the guarded deep link direct and folds secondary read-state work beneath one native disclosure cloud.
 */
import { createProgressiveDisclosure } from '../../shared/social/ui/ProgressiveDisclosure.js';

/**
 * Builds one clean notification action region from verified capabilities.
 * @param {object} notification Notification data returned by the canonical API.
 * @param {string} type Notification type used only for honest action labeling.
 * @param {boolean} unread Whether the notification still needs read-state acknowledgement.
 * @returns {HTMLElement} Action container preserving controller event delegation.
 */
export function createNotificationActions(notification, type, unread) {
	const actions = document.createElement('div');
	const link = safeActionLink(notification?.actionUrl, type);
	const id = notification?.id || notification?.notificationId;
	actions.className = 'notification-row-actions';
	if (link) actions.append(link);
	if (unread && id) {
		const mark = markButton(id);
		if (link) actions.append(secondaryReadDisclosure(mark));
		else actions.append(mark);
	}
	return actions;
}

/** Creates the canonical delegated mark-read control. */
export function markButton(id) {
	const button = document.createElement('button');
	button.type = 'button';
	button.className = 'notification-mark-read';
	button.dataset.markRead = String(id);
	button.textContent = 'Mark read';
	return button;
}

/** Hides secondary read-state work without removing keyboard reachability. */
function secondaryReadDisclosure(button) {
	const disclosure = createProgressiveDisclosure({
		document,
		label: 'More',
		detail: 'read state',
		content: button,
		variant: 'compact',
		className: 'notification-secondary-actions'
	});
	return disclosure.root;
}

/** Creates a same-origin deep link and rejects every foreign destination. */
export function safeActionLink(value, type) {
	if (!value) return null;
	try {
		const url = new URL(String(value), location.href);
		if (url.origin !== location.origin) return null;
		const link = document.createElement('a');
		link.className = 'g-button notification-primary-action';
		link.href = `${url.pathname}${url.search}${url.hash}`;
		link.textContent = actionLabel(type);
		return link;
	} catch {
		return null;
	}
}

/** Returns the truthful destination label for a known signal type. */
export function actionLabel(type = '') {
	if (type === 'comment' || type === 'mention') return 'Open conversation';
	if (type.includes('submission')) return 'Review submission';
	if (type.startsWith('mission')) return 'Open mission';
	return 'View details';
}

export { secondaryReadDisclosure };
