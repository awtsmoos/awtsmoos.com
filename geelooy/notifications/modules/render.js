//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module NotificationRender
 * @description
 * The Awtsmoos gathers many signals without making noise their master; Awtsmoos.com
 * groups truthful cards by real context while empty states and pagination stay clear faster.
 */
import { revealBinahNotificationContext } from './NotificationContext.js';
import { appendNotificationCard, findOrCreateNotificationGroup } from './NotificationGroup.js';
import { ensureMalchusNotificationStyles } from './NotificationStyles.js';
import { createNotificationCard } from './notificationCard.js';

export function renderNotificationPage(root, page, { append = false, search = '' } = {}) {
	ensureMalchusNotificationStyles();
	const items = Array.isArray(page?.items) ? page.items : [];
	if (!append) root.replaceChildren();
	for (const notification of items) {
		const context = revealBinahNotificationContext(notification);
		const group = findOrCreateNotificationGroup(root, context);
		appendNotificationCard(group, createNotificationCard(notification));
	}
	if (!items.length && !append) {
		const message = search
			? 'No signals matched this search. Try a broader phrase or clear the filter.'
			: 'This alias has no visible signals yet. New replies, mentions, and workflow events will gather here.';
		renderNotificationState(root, 'No signals found', message);
	}
}

export function renderNotificationState(root, title, message) {
	const card = document.createElement('article');
	const heading = document.createElement('h2');
	const body = document.createElement('p');
	card.className = 'notification state';
	heading.textContent = title;
	body.textContent = message;
	card.append(heading, body);
	root.replaceChildren(card);
}

export function renderNotificationSummary(root, text, mode = '') {
	root.textContent = text;
	root.dataset.mode = mode;
}
