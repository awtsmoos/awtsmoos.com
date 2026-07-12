// B"H
/**
 * @module NotificationHelpers
 * @description Small timing, query, and default-alias helpers keep the main
 * controller focused on visible user flow.
 */
import { getDefaultAliasId } from './api.js';
import { notificationState } from './state.js';

/** Fills the alias field from the real account default when it is empty. */
export async function hydrateDefaultAlias(form) {
	if (form.elements.aliasId.value) return;
	try {
		form.elements.aliasId.value = await getDefaultAliasId();
	} catch {}
}

/** Builds the exact notification query string from current state. */
export function notificationQueryString() {
	return new URLSearchParams({
		limit: String(notificationState.limit),
		offset: String(notificationState.offset),
		includeRead: 'true',
		type: notificationState.type,
		search: notificationState.search
	}).toString();
}

/** Debounces a callback while preserving its arguments. */
export function debounce(callback, wait = 320) {
	let timer;
	return (...args) => {
		clearTimeout(timer);
		timer = setTimeout(() => callback(...args), wait);
	};
}
