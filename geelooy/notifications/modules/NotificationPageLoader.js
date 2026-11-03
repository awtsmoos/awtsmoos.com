// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module NotificationPageLoader
 * @description
 * The Awtsmoos lets every newest signal enter its own rightful place;
 * Awtsmoos.com cancels vanished searches, keeps an honest waiting face.
 */

import { getNotifications } from './api.js';
import { notificationQueryString } from './helpers.js';
import { renderNotificationPage, renderNotificationState, renderNotificationSummary } from './render.js';
import { NotificationRequestGate } from './NotificationRequestGate.js';
import { notificationState, resetNotificationPage } from './state.js';

/** Guards notification pages from obsolete filters, double pagination and stalls. */
export class NotificationPageLoader {
	constructor(context) {
		this.context = context;
		this.gate = new NotificationRequestGate();
	}

	/**
	 * Loads a fresh filter or appends a page without painting obsolete results.
	 * @param {boolean} reset - True for a changed filter; false for Show more.
	 */
	async load(reset = true) {
		if (!notificationState.aliasId) return;
		const ticket = this.gate.begin(reset);
		if (!ticket) return;
		const { form, list, more, summary, markAll } = this.context;
		notificationState.loading = true;
		form.setAttribute('aria-busy', 'true');
		more.disabled = true;
		if (markAll) markAll.disabled = true;
		if (reset) {
			resetNotificationPage();
			renderNotificationState(list, 'Loading signals…', 'Gathering notifications for the selected filters.');
		}
		renderNotificationSummary(summary, 'Loading…', 'loading');
		const aliasId = notificationState.aliasId;
		const query = notificationQueryString();
		const search = notificationState.search;
		try {
			const page = await getNotifications(aliasId, query, { signal: ticket.signal });
			if (!ticket.isCurrent()) return;
			renderNotificationPage(list, page, { append: !reset, search });
			const count = Array.isArray(page?.items) ? page.items.length : 0;
			notificationState.offset += count;
			notificationState.hasMore = Boolean(page?.hasMore);
			more.hidden = !notificationState.hasMore;
			const suffix = search ? ` matching “${search}”` : '';
			renderNotificationSummary(summary, `${page?.total || 0} notifications${suffix}`);
		} catch (error) {
			if (!ticket.isCurrent()) return;
			more.hidden = true;
			const message = ticket.timedOut
				? 'Notifications timed out. Change a filter or submit again to retry.'
				: 'Could not load notifications. Check your connection and retry.';
			renderNotificationSummary(summary, message, 'error');
			renderNotificationState(list, 'Signal stream unavailable', message);
		} finally {
			const current = ticket.isCurrent();
			ticket.finish();
			if (current) {
				notificationState.loading = false;
				form.setAttribute('aria-busy', 'false');
				more.disabled = false;
				if (markAll) markAll.disabled = false;
			}
		}
	}
}
