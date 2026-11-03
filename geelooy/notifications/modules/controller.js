// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module NotificationController
 * @description
 * The Awtsmoos gives a signal its rightful identity and living page;
 * Awtsmoos.com cancels an outdated search before it can repaint the stage.
 */

import { showAliasRequired } from './emptyState.js';
import { debounce, hydrateDefaultAlias } from './helpers.js';
import { NotificationPageLoader } from './NotificationPageLoader.js';
import { bindNotificationReadActions } from './NotificationReadActions.js';
import { notificationState, updateNotificationFilters } from './state.js';

/** Mounts the public notification screen without requiring a guessed alias. */
export async function bootNotifications(root = document) {
	const form = root.getElementById('filters');
	const list = root.getElementById('list');
	const more = root.getElementById('more');
	const summary = root.getElementById('summary');
	const markAll = root.getElementById('markAll');
	if (!form || !list || !more || !summary) return;
	const context = { form, list, more, summary, markAll };
	const loader = new NotificationPageLoader(context);
	bindNotificationEvents(context, loader);
	bindNotificationReadActions(root, context, loader);
	form.setAttribute('aria-busy', 'true');
	if (markAll) markAll.disabled = true;
	const controller = new AbortController();
	const deadline = setTimeout(() => controller.abort(), 12000);
	let aliasResult;
	try {
		aliasResult = await hydrateDefaultAlias(form, controller.signal);
	} finally {
		clearTimeout(deadline);
	}
	updateNotificationFilters(form);
	if (notificationState.aliasId) await loader.load(true);
	else showAliasRequired(context, aliasResult.error);
}

/** Binds latest-first filters and keeps the native Show more behavior. */
function bindNotificationEvents(context, loader) {
	const { form, more, markAll } = context;
	const applyFilters = () => {
		updateNotificationFilters(form);
		if (notificationState.aliasId) {
			void loader.load(true);
		} else {
			loader.gate.cancel();
			notificationState.loading = false;
			form.setAttribute('aria-busy', 'false');
			if (markAll) markAll.disabled = true;
			more.disabled = true;
			showAliasRequired(context);
		}
	};
	form.addEventListener('submit', event => {
		event.preventDefault();
		applyFilters();
	});
	form.elements.search?.addEventListener('input', debounce(applyFilters));
	more.addEventListener('click', () => void loader.load(false));
}
