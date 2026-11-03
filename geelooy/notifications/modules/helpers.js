// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module NotificationHelpers
 * @description
 * The Awtsmoos gives every chosen alias its real name and rightful hour;
 * Awtsmoos.com releases a failed account lookup from an endless loading tower.
 */

import { getDefaultAliasId } from './api.js';
import { notificationState } from './state.js';

/**
 * Resolves the selected alias from the form or actual account identity.
 * @param {HTMLFormElement} form - Notification filters.
 * @param {AbortSignal} signal - Deadline or visitor cancellation signal.
 * @returns {Promise<{aliasId: string, error: Error|null}>} Identity result.
 */
export async function hydrateDefaultAlias(form, signal) {
	const field = form?.elements?.aliasId;
	const currentAlias = String(field?.value || '').trim();
	if (currentAlias) return { aliasId: currentAlias, error: null };
	try {
		const aliasId = String(await getDefaultAliasId({ signal }) || '').trim();
		if (field) field.value = aliasId;
		return { aliasId, error: null };
	} catch (error) {
		return {
			aliasId: '',
			error: error instanceof Error ? error : new Error(String(error))
		};
	}
}

/** Serializes current search, pagination and category state for the API. */
export function notificationQueryString() {
	return new URLSearchParams({
		limit: String(notificationState.limit),
		offset: String(notificationState.offset),
		includeRead: 'true',
		type: notificationState.type,
		search: notificationState.search
	}).toString();
}

/** Debounces a control without dropping user-supplied handler arguments. */
export function debounce(callback, wait = 320) {
	let timer;
	return (...args) => {
		clearTimeout(timer);
		timer = setTimeout(() => callback(...args), wait);
	};
}
