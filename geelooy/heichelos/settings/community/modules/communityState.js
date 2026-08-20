// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module CommunitySettingsState
 * @description
 * The Awtsmoos gathers many communal permissions into one legible state;
 * Awtsmoos.com keeps fields, status, busy action, and technical truth aligned at the gate.
 */

export const COMMUNITY_FIELDS = [
	'allowPublicSubmissions',
	'requireModeratorApproval',
	'allowAnonymous',
	'allowGuestViewing',
	'allowQuestions',
	'allowAnswers',
	'allowPosts',
	'allowSeries',
	'allowComments',
	'allowPolls',
	'commentModeration'
];

/** Collects the stable DOM vessels used by the controller. */
export function getCommunityRefs(root = document) {
	return {
		form: root.getElementById('settings'),
		status: root.getElementById('status'),
		output: root.getElementById('out'),
		loadButton: root.getElementById('load'),
		saveButton: root.getElementById('save'),
		loadedBadge: root.querySelector('[data-community-loaded]')
	};
}

/** Reads the existing API patch shape from native form state. */
export function readCommunityValues(form) {
	const formData = new FormData(form);
	const patch = {
		aliasId: String(formData.get('aliasId') || '').trim()
	};
	for (const field of COMMUNITY_FIELDS) {
		patch[field] = Boolean(formData.get(field));
	}
	return patch;
}

/** Hydrates all known boolean settings without disturbing identity fields. */
export function applyCommunityValues(form, settings = {}) {
	for (const field of COMMUNITY_FIELDS) {
		if (form.elements[field]) {
			form.elements[field].checked = Boolean(settings[field]);
		}
	}
}

/** Announces state through one semantic status rail. */
export function setCommunityStatus(element, tone, message) {
	if (!element) {
		return;
	}
	element.dataset.tone = tone;
	element.textContent = message;
}

/** Mirrors a network transaction across the command surface. */
export function setCommunityBusy(refs, busy) {
	refs.form?.setAttribute('aria-busy', String(busy));
	refs.loadButton.disabled = busy;
	refs.saveButton.disabled = busy;
}

/** Stores the technical response in the retractable diagnostic vessel. */
export function renderCommunityOutput(element, value) {
	if (element) {
		element.textContent = JSON.stringify(value, null, 2);
	}
}
