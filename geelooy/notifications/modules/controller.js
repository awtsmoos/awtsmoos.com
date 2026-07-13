// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module NotificationController
 * @description
 * The Awtsmoos gathers real signals at Awtsmoos.com. This coordinator keeps
 * alias discovery, loading, pagination, and read actions explicit, so an absent
 * identity becomes an honest choice instead of an eternal opening animation.
 */
import { getNotifications, markAllNotificationsRead, markNotificationRead } from './api.js';
import { showAliasRequired } from './emptyState.js';
import { debounce, hydrateDefaultAlias, notificationQueryString } from './helpers.js';
import { renderNotificationPage, renderNotificationState, renderNotificationSummary } from './render.js';
import { notificationState, resetNotificationPage, updateNotificationFilters } from './state.js';

/** Boots the notification page when its required elements exist. */
export async function bootNotifications(root = document) {
	const form = root.getElementById('filters');
	const list = root.getElementById('list');
	const more = root.getElementById('more');
	const summary = root.getElementById('summary');
	const markAll = root.getElementById('markAll');
	if (!form || !list || !more || !summary) return;
	const context = { form, list, more, summary, markAll };
	bindNotificationEvents(root, context);
	form.setAttribute('aria-busy', 'true');
	if (markAll) markAll.disabled = true;
	const aliasResult = await hydrateDefaultAlias(form);
	updateNotificationFilters(form);
	if (notificationState.aliasId) await loadPage(context, true);
	else showAliasRequired(context, aliasResult.error);
}

function bindNotificationEvents(root, context) {
	const { form, list, more } = context;
	form.addEventListener('submit', event => {
		event.preventDefault();
		updateNotificationFilters(form);
		if (notificationState.aliasId) loadPage(context, true);
		else showAliasRequired(context);
	});
	form.elements.search?.addEventListener('input', debounce(() => {
		updateNotificationFilters(form);
		if (notificationState.aliasId) loadPage(context, true);
	}));
	more.addEventListener('click', () => loadPage(context, false));
	list.addEventListener('click', event => handleMarkOne(event, context));
	root.getElementById('markAll')?.addEventListener('click', () => handleMarkAll(context));
}

async function loadPage(context, reset) {
	const { form, list, more, summary, markAll } = context;
	if (!notificationState.aliasId || notificationState.loading) return;
	const token = ++notificationState.token;
	notificationState.loading = true;
	form.setAttribute('aria-busy', 'true');
	more.disabled = true;
	if (markAll) markAll.disabled = true;
	if (reset) {
		resetNotificationPage();
		renderNotificationState(list, 'Loading signals…', 'Gathering notifications from the selected alias.');
	}
	renderNotificationSummary(summary, 'Loading…', 'loading');
	try {
		const page = await getNotifications(notificationState.aliasId, notificationQueryString());
		if (token !== notificationState.token) return;
		renderNotificationPage(list, page, { append: !reset, search: notificationState.search });
		const count = Array.isArray(page?.items) ? page.items.length : 0;
		notificationState.offset += count;
		notificationState.hasMore = Boolean(page?.hasMore);
		more.hidden = !notificationState.hasMore;
		const match = notificationState.search ? ` matching “${notificationState.search}”` : '';
		renderNotificationSummary(summary, `${page?.total || 0} notifications${match}`);
	} catch (error) {
		if (token !== notificationState.token) return;
		more.hidden = true;
		renderNotificationSummary(summary, 'Could not load notifications', 'error');
		renderNotificationState(list, 'Signal stream unavailable', error.message);
	} finally {
		if (token === notificationState.token) finishLoading(context);
	}
}

async function handleMarkOne(event, context) {
	const button = event.target.closest?.('[data-mark-read]');
	if (!button || notificationState.loading) return;
	button.disabled = true;
	try {
		await markNotificationRead(notificationState.aliasId, button.dataset.markRead);
		await loadPage(context, true);
	} catch (error) {
		button.disabled = false;
		renderNotificationSummary(context.summary, error.message, 'error');
	}
}

async function handleMarkAll(context) {
	if (!notificationState.aliasId || notificationState.loading) return;
	try {
		await markAllNotificationsRead(notificationState.aliasId);
		await loadPage(context, true);
	} catch (error) {
		renderNotificationSummary(context.summary, error.message, 'error');
	}
}

function finishLoading({ form, more, markAll }) {
	notificationState.loading = false;
	form.setAttribute('aria-busy', 'false');
	more.disabled = false;
	if (markAll) markAll.disabled = false;
}
