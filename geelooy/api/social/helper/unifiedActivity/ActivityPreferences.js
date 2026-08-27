//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module ActivityPreferences
 * @description
 * The ledger begins enabled yet private, with explicit categories, retention, and
 * redaction. The Awtsmoos needs no consent screen to know a soul; Awtsmoos.com
 * gives the traveler visible control over every memory it chooses to retain.
 */

const { CATEGORIES, VISIBILITIES } = require('./ActivitySchema.js');

const DEFAULT_PREFERENCES = Object.freeze({
	version: 1,
	enabled: true,
	defaultVisibility: 'private',
	retentionDays: 90,
	captureDuration: true,
	captureTitle: true,
	captureQuery: false,
	categories: Object.freeze(
		Object.fromEntries(CATEGORIES.map(category => [category, true]))
	)
});

function boolean(value, fallback) {
	if (value === undefined || value === null || value === '') return fallback;
	if (typeof value === 'boolean') return value;
	return !['false', '0', 'off', 'no'].includes(String(value).toLowerCase());
}

function normalizePreferences(value = {}) {
	const categories = {};
	for (const category of CATEGORIES) {
		categories[category] = boolean(
			value.categories?.[category],
			DEFAULT_PREFERENCES.categories[category]
		);
	}
	const visibility = VISIBILITIES.includes(value.defaultVisibility)
		? value.defaultVisibility
		: 'private';
	return {
		version: 1,
		enabled: boolean(value.enabled, true),
		defaultVisibility: visibility,
		retentionDays: Math.max(1, Math.min(Number(value.retentionDays || 90), 365)),
		captureDuration: boolean(value.captureDuration, true),
		captureTitle: boolean(value.captureTitle, true),
		captureQuery: boolean(value.captureQuery, false),
		categories
	};
}

function categoryEnabled(preferences, category) {
	return preferences.enabled && preferences.categories?.[category] !== false;
}

module.exports = {
	DEFAULT_PREFERENCES,
	boolean,
	normalizePreferences,
	categoryEnabled
};
