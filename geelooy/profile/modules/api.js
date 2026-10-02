//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module ProfileApi
 * @description
 * The Awtsmoos lets Awtsmoos.com receive API truth without turning structured
 * server errors into the empty mask of "[object Object]". Each request has a
 * clock, each payload keeps its meaning, and every failure becomes human speech.
 */

const DEFAULT_TIMEOUT_MS = 12000;
const FALLBACK_ERROR = 'Profile API request failed.';

/** Creates one abortable request vessel with a bounded lifetime. */
function withTimeout(options = {}) {
	const controller = new AbortController();
	const timeout = setTimeout(
		() => controller.abort(),
		options.timeoutMs || DEFAULT_TIMEOUT_MS
	);
	return {
		controller,
		timeout,
		options: { ...options, signal: controller.signal }
	};
}

/** Turns strings, Errors, and nested server error objects into visible speech. */
function errorText(value, fallback = FALLBACK_ERROR) {
	if (typeof value === 'string' && value.trim()) {
		if (/not logged in/i.test(value)) {
			return 'You are not logged in. Sign in to load your profile.';
		}
		return value.trim();
	}
	if (!value || typeof value !== 'object') return fallback;
	if (value.code === 'NO_DEFAULT') return 'No default alias is set yet.';
	return errorText(
		value.message || value.error || value.detail || value.reason,
		fallback
	);
}

/** Resolves the best message supplied by an API response. */
function messageFrom(data, response) {
	if (data?.error) return errorText(data.error);
	if (data?.message) return errorText(data.message);
	if (response?.statusText) return response.statusText;
	return FALLBACK_ERROR;
}

/** Extracts list-shaped API payloads without inventing records. */
function listFrom(data) {
	if (Array.isArray(data)) return data;
	if (Array.isArray(data?.success)) return data.success;
	if (Array.isArray(data?.data)) return data.data;
	if (Array.isArray(data?.items)) return data.items;
	return [];
}

/** Gives every alias one stable string id for renderers and state. */
function normalizeAlias(alias) {
	const id = alias?.id || alias?.aliasId || alias?.inputId || alias?.name || '';
	return { ...alias, id: String(id) };
}

/** Fetches JSON with timeout, shape-aware error handling, and deterministic cleanup. */
export async function apiJson(url, options = {}) {
	const { timeoutMs, ...fetchOptions } = options;
	const timed = withTimeout({ ...fetchOptions, timeoutMs });
	try {
		const response = await fetch(url, timed.options);
		const data = await response.json().catch(() => null);
		if (!response.ok || data?.error) throw new Error(messageFrom(data, response));
		return data;
	} catch (error) {
		if (error?.name === 'AbortError') {
			throw new Error(`Profile API timed out: ${url}`);
		}
		throw error;
	} finally {
		clearTimeout(timed.timeout);
	}
}

/** Reads the account's default publishing identity. */
export async function getDefaultAlias() {
	const result = await apiJson('/api/social/alias/default');
	return result?.success || result?.data || '';
}

/** Reads and normalizes aliases suitable for Profile cards. */
export async function getAliasDetails() {
	return listFrom(await apiJson('/api/social/aliases/details'))
		.map(normalizeAlias)
		.filter(alias => alias.id);
}

/** Reads Heichel details owned by one explicit alias. */
export async function getHeichelosForAlias(aliasId) {
	const encoded = encodeURIComponent(aliasId);
	return listFrom(await apiJson(
		`/api/social/alias/${encoded}/heichelos/details`,
		{ timeoutMs: 9000 }
	));
}

/** Persists the selected default alias and proves server acknowledgement. */
export async function setDefaultAlias(aliasId) {
	const body = `alias=${encodeURIComponent(aliasId)}`;
	const result = await apiJson('/api/social/alias/default', {
		method: 'POST',
		headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
		body
	});
	if (!result?.success) throw new Error('Default alias was not saved.');
	return aliasId;
}
