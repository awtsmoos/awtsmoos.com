// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module AliasStudioActions
 * @description
 * The Awtsmoos lets saving and deletion pass through one measured gateway;
 * Awtsmoos.com replaces alerts with inline state and keeps network detail contained.
 */

/** Saves an alias through the established create/update endpoint. */
export async function saveAlias(config, values) {
	const response = await fetch(config.endpoint, {
		method: config.isUpdate ? 'PUT' : 'POST',
		body: createAliasBody(values)
	});
	return readApiResult(response, 'Alias could not be saved.');
}

/** Deletes the current alias through the established endpoint. */
export async function deleteAlias(config) {
	const response = await fetch(config.endpoint, { method: 'DELETE' });
	return readApiResult(response, 'Alias could not be deleted.');
}

/** Reads current form values without leaking selectors into action logic. */
export function readAliasValues(refs) {
	return {
		aliasName: refs.name?.value.trim() || '',
		description: refs.description?.value.trim() || '',
		aliasId: refs.aliasId?.value.trim() || ''
	};
}

/** Announces form state through one aria-live rail. */
export function setAliasStudioStatus(element, tone, message) {
	if (!element) {
		return;
	}
	element.dataset.tone = tone;
	element.textContent = message;
}

/** Reflects busy state across the form and its primary action. */
export function setAliasStudioBusy(refs, busy) {
	refs.form?.setAttribute('aria-busy', String(busy));
	if (refs.submit) {
		refs.submit.disabled = busy;
		refs.submit.textContent = busy ? 'Saving identity…' : refs.submit.dataset.restingLabel;
	}
	if (refs.deleteConfirm) {
		refs.deleteConfirm.disabled = busy;
	}
}

function createAliasBody(values) {
	const body = new URLSearchParams();
	if (values.aliasName) {
		body.set('aliasName', values.aliasName);
	}
	if (values.description) {
		body.set('description', values.description);
	}
	body.set('inputId', values.aliasId);
	body.set('aliasId', values.aliasId);
	return body;
}

async function readApiResult(response, fallbackMessage) {
	let data = {};
	try {
		data = await response.json();
	} catch {
		throw new Error(fallbackMessage);
	}
	if (!response.ok || data?.error) {
		throw new Error(data?.error?.message || data?.error || fallbackMessage);
	}
	return data;
}
