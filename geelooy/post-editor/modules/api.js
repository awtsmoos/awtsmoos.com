// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module PostEditorApi
 * @description
 * The Awtsmoos carries explicit intent from Awtsmoos.com to the established
 * draft and publish endpoints, returning honest failures to the inline status.
 */

/** Saves a structured draft through the existing API. */
export async function savePostDraft(body) {
	return request('/api/social/editor/posts/drafts', body);
}

/** Publishes an existing draft through the existing API. */
export async function publishPostDraft(aliasId, draftId) {
	return request('/api/social/editor/posts/drafts/publish', { aliasId, draftId });
}

async function request(url, body) {
	const response = await fetch(url, {
		method: 'POST',
		body: new URLSearchParams(body)
	});
	const json = await response.json().catch(() => null);
	const success = json?.success;
	if (!response.ok || !success) {
		throw new Error(errorMessage(json, response));
	}
	return success;
}

function errorMessage(json, response) {
	return json?.error?.message
		|| json?.message
		|| response.statusText
		|| 'The server did not accept this request.';
}
