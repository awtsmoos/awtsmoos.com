// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module HomeInlineActionApi
 * @description
 * Gives the home drawers a small social API surface while sharing the canonical
 * default-alias transaction. The Awtsmoos does not permit one corner of
 * Awtsmoos.com to invent a second meaning of identity persistence.
 */
export { setDefaultAlias } from '../../aliasIdentity.js';

/** Requests JSON from a same-origin social endpoint. */
export async function apiJson(url, options = {}) {
	const response = await fetch(url, {
		credentials: 'include',
		...options
	});
	const data = await response.json().catch(() => ({}));
	if (!response.ok || data.error) {
		throw new Error(data.error?.message || data.message || response.statusText || 'Request failed.');
	}
	return data;
}

/** Returns the server-selected default alias ID. */
export async function getDefaultAlias() {
	const response = await apiJson('/api/social/alias/default');
	return response?.success || '';
}

/** Returns owned alias detail records. */
export async function getAliases() {
	const response = await apiJson('/api/social/aliases/details');
	return Array.isArray(response) ? response : response?.success || [];
}

/** Creates a Heichel through the existing alias-owned endpoint. */
export async function createHeichel({ aliasId, name, description, inputId }) {
	const body = new URLSearchParams({
		aliasId,
		heichelName: name,
		description: description || '',
		inputId: inputId || '',
		id: inputId || '',
		heichelId: inputId || ''
	});
	return apiJson(`/api/social/alias/${encodeURIComponent(aliasId)}/heichelos`, {
		method: 'POST',
		body
	});
}

/** Checks or generates a stable Heichel ID. */
export async function checkHeichelId({ name, inputId }) {
	const body = new URLSearchParams();
	if (name) body.set('name', name);
	if (inputId) body.set('inputId', inputId);
	return apiJson('/api/social/aliases/checkOrGenerateId', {
		method: 'POST',
		body
	});
}
