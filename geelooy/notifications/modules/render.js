// B"H
/**
 * @module NotificationRender
 * @description Builds signal cards with DOM text, never trusting notification
 * strings as markup. The letter receives a safe garment before it is revealed.
 */
const ICONS = Object.freeze({ comment: '💬', mention: '@', submission_created: '✍', system: '⚙' });

/** Replaces or appends a notification page. */
export function renderNotificationPage(root, page, { append = false, search = '' } = {}) {
	const items = Array.isArray(page?.items) ? page.items : [];
	const cards = items.map(createNotificationCard);
	if (append) root.append(...cards);
	else root.replaceChildren(...cards);
	if (!items.length && !append) renderNotificationState(root, 'No signals found', search ? 'No notifications matched this search.' : 'This alias has no visible notifications yet.');
}

/** Renders a simple status card into the notification list. */
export function renderNotificationState(root, title, message) {
	const card = document.createElement('article');
	card.className = 'notification state';
	const heading = document.createElement('h2');
	heading.textContent = title;
	const body = document.createElement('p');
	body.textContent = message;
	card.append(heading, body);
	root.replaceChildren(card);
}

/** Updates the visible result summary. */
export function renderNotificationSummary(root, text, mode = '') {
	root.textContent = text;
	root.dataset.mode = mode;
}

function createNotificationCard(notification) {
	const card = document.createElement('article');
	card.className = `notification ${notification?.read ? 'read' : 'unread'}`;
	const icon = document.createElement('span');
	icon.className = 'notification-icon';
	icon.setAttribute('aria-hidden', 'true');
	icon.textContent = ICONS[notification?.type] || '•';
	const title = document.createElement('h2');
	title.textContent = notification?.title || notification?.type || 'Notification';
	const body = document.createElement('p');
	body.textContent = notification?.body || notification?.message || 'A new movement was recorded.';
	const meta = document.createElement('small');
	meta.textContent = `${notification?.type || 'signal'} · ${formatTime(notification?.createdAt)}`;
	const actions = document.createElement('div');
	actions.className = 'notification-row-actions';
	const link = safeActionLink(notification?.actionUrl);
	if (link) actions.append(link);
	const id = notification?.id || notification?.notificationId;
	if (!notification?.read && id) actions.append(markButton(id));
	card.append(icon, title, body, meta, actions);
	return card;
}

function markButton(id) {
	const button = document.createElement('button');
	button.type = 'button';
	button.dataset.markRead = String(id);
	button.textContent = 'Mark read';
	return button;
}

function safeActionLink(value) {
	if (!value) return null;
	try {
		const url = new URL(String(value), location.href);
		if (url.origin !== location.origin) return null;
		const link = document.createElement('a');
		link.className = 'g-button';
		link.href = `${url.pathname}${url.search}${url.hash}`;
		link.textContent = 'Open';
		return link;
	} catch {
		return null;
	}
}

function formatTime(value) {
	const date = new Date(value || Date.now());
	return Number.isNaN(date.getTime()) ? 'Unknown time' : date.toLocaleString();
}
