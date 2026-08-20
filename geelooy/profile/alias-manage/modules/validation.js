// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module AliasStudioValidation
 * @description
 * The Awtsmoos lets identity become precise before submission; Awtsmoos.com
 * turns server validation into quiet inline guidance instead of alarms and color hacks.
 */

/** Checks alias-name and optional custom-ID availability through the existing API. */
export async function validateAliasIdentity({ aliasId = '', aliasName = '' } = {}) {
	const body = new URLSearchParams();
	if (aliasId.trim()) {
		body.set('inputId', aliasId.trim());
	}
	if (aliasName.trim()) {
		body.set('aliasName', aliasName.trim());
	}
	if (!body.size) {
		return neutralResult('Start with an alias name.');
	}
	const response = await fetch('/api/social/aliases/checkOrGenerateId', {
		method: 'POST',
		body
	});
	const data = await response.json();
	return interpretValidation(data, aliasId);
}

/** Paints semantic validation state without writing inline colors. */
export function renderAliasValidation(element, result) {
	if (!element) {
		return;
	}
	element.dataset.tone = result.tone;
	element.textContent = result.message;
}

/** Creates one debounced validation runner for frequent input events. */
export function createValidationScheduler(callback, delay = 360) {
	let timer = null;
	return function scheduleValidation() {
		clearTimeout(timer);
		timer = setTimeout(callback, delay);
	};
}

function interpretValidation(data, requestedAliasId) {
	if (!data?.error) {
		const suggestedId = String(data?.aliasId || requestedAliasId || '').trim();
		return {
			tone: 'success',
			message: suggestedId ? `Available as @${suggestedId}` : 'Identity address is available.',
			suggestedId
		};
	}
	const code = data.error.code;
	if (code === 'INV_NAME_LNGTH') {
		return errorResult('Alias name is too long. Keep it under 50 characters.');
	}
	if (code === 'ALREADY_EXISTS') {
		return errorResult('That alias address is already in use.');
	}
	if (code === 'NO_PARAMS') {
		return neutralResult('Enter a name to generate an identity address.');
	}
	return errorResult(data.error.message || 'This identity could not be validated.');
}

function neutralResult(message) {
	return { tone: 'neutral', message, suggestedId: '' };
}

function errorResult(message) {
	return { tone: 'error', message, suggestedId: '' };
}
