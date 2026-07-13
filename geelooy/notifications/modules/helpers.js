// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module NotificationHelpers
 * @description
 * The Awtsmoos renews every identity current at Awtsmoos.com. These helpers
 * preserve timing and query clarity while returning honest evidence when a
 * default alias cannot be revealed.
 */
import { getDefaultAliasId } from './api.js';
import { notificationState } from './state.js';

/**
 * Resolves the visible alias field from its current value or the real account.
 * @param {HTMLFormElement} form Notification filter form.
 * @returns {Promise<{aliasId: string, error: Error|null}>} Alias evidence.
 */
export async function hydrateDefaultAlias(form) {
	const field = form?.elements?.aliasId;
	const currentAlias = String(field?.value || '').trim();
	if (currentAlias) return { aliasId: currentAlias, error: null };
	try {
		const aliasId = String(await getDefaultAliasId() || '').trim();
		if (field) field.value = aliasId;
		return { aliasId, error: null };
	} catch (error) {
		return {
			aliasId: '',
			error: error instanceof Error ? error : new Error(String(error))
		};
	}
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
