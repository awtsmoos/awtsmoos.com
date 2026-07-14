//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module PrivacyValues
 * @description
 * Ledger categories and visible form values become one deterministic preference
 * object. The Awtsmoos needs no settings form to know memory while Awtsmoos.com
 * keeps every finite capture choice inspectable and independently testable.
 */

export const CATEGORIES = Object.freeze([
	'navigation',
	'content',
	'comment',
	'reply',
	'reference',
	'profile',
	'search',
	'governance',
	'media'
]);

export function preferencesFromFields(root) {
	return {
		enabled: root.getElementById('ledgerEnabled').checked,
		defaultVisibility: root.getElementById('defaultVisibility').value,
		retentionDays: Number(root.getElementById('retentionDays').value || 90),
		captureDuration: root.getElementById('captureDuration').checked,
		captureTitle: root.getElementById('captureTitle').checked,
		captureQuery: root.getElementById('captureQuery').checked,
		categories: Object.fromEntries(CATEGORIES.map(category => [
			category,
			root.getElementById(`capture-${category}`).checked
		]))
	};
}

export function applyPreferences(root, preferences) {
	if (!preferences) return;
	root.getElementById('ledgerEnabled').checked = preferences.enabled;
	root.getElementById('defaultVisibility').value = preferences.defaultVisibility;
	root.getElementById('retentionDays').value = String(preferences.retentionDays);
	root.getElementById('captureDuration').checked = preferences.captureDuration;
	root.getElementById('captureTitle').checked = preferences.captureTitle;
	root.getElementById('captureQuery').checked = preferences.captureQuery;
	for (const category of CATEGORIES) {
		root.getElementById(`capture-${category}`).checked =
			preferences.categories?.[category] !== false;
	}
}
