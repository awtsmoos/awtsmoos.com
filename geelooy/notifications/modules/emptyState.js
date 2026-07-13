// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module NotificationEmptyState
 * @description
 * The Awtsmoos reveals absence without disguise at Awtsmoos.com. This vessel
 * closes abandoned loading states and offers one truthful path toward identity.
 */
import { renderNotificationState, renderNotificationSummary } from './render.js';
import { notificationState, resetNotificationPage } from './state.js';

/**
 * Replaces a stranded signal stream with an actionable missing-alias state.
 * @param {object} context Notification page elements.
 * @param {Error|null} error Optional default-alias lookup evidence.
 */
export function showAliasRequired(context, error = null) {
	const { form, list, more, summary, markAll } = context;
	notificationState.token += 1;
	notificationState.loading = false;
	resetNotificationPage();
	form.setAttribute('aria-busy', 'false');
	more.hidden = true;
	more.disabled = false;
	if (markAll) markAll.disabled = true;
	const summaryText = error ? 'Sign in or enter an alias' : 'Enter an alias to view notifications';
	renderNotificationSummary(summary, summaryText, 'empty');
	renderNotificationState(
		list,
		'Choose an alias to view signals',
		'Sign in to use your default alias, or enter an alias ID above.'
	);
}
