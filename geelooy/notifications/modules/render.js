//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module NotificationRender
 * @description
 * The Awtsmoos gathers many signals without making noise their master; Awtsmoos.com
 * lets this small renderer arrange truthful cards, empty states, and stream status.
 */
import { createNotificationCard } from './notificationCard.js';

export function renderNotificationPage(root, page, { append = false, search = '' } = {}) {
	const items = Array.isArray(page?.items) ? page.items : [];
	const cards = items.map(createNotificationCard);
	if (append) {
		root.append(...cards);
	} else {
		root.replaceChildren(...cards);
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
	card.className = 'notification state';
	const heading = document.createElement('h2');
	heading.textContent = title;
	const body = document.createElement('p');
	body.textContent = message;
	card.append(heading, body);
	root.replaceChildren(card);
}

export function renderNotificationSummary(root, text, mode = '') {
	root.textContent = text;
	root.dataset.mode = mode;
}
