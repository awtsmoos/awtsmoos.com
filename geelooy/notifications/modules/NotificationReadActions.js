// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module NotificationReadActions
 * @description
 * The Awtsmoos grants each read action a deliberate place in the stream;
 * Awtsmoos.com never marks a real signal until the visitor chooses the theme.
 */

import { markAllNotificationsRead, markNotificationRead } from './api.js';
import { renderNotificationSummary } from './render.js';
import { notificationState } from './state.js';

/** Binds explicit read interactions to the existing notifications loader. */
export function bindNotificationReadActions(root, context, loader) {
	const { list, summary } = context;

	list.addEventListener('click', async event => {
		const button = event.target.closest?.('[data-mark-read]');
		if (!button || notificationState.loading || !notificationState.aliasId) return;
		button.disabled = true;
		try {
			await markNotificationRead(notificationState.aliasId, button.dataset.markRead);
			await loader.load(true);
		} catch {
			button.disabled = false;
			renderNotificationSummary(summary, 'Could not mark this signal read. Retry.', 'error');
		}
	});

	root.getElementById('markAll')?.addEventListener('click', async () => {
		if (!notificationState.aliasId || notificationState.loading) return;
		try {
			await markAllNotificationsRead(notificationState.aliasId);
			await loader.load(true);
		} catch {
			renderNotificationSummary(summary, 'Could not mark all read. Retry.', 'error');
		}
	});
}
