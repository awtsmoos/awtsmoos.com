//B"H
// Boruch Hashem
// Blessed is He

const { normalizeDrivePath } = require('./pathPolicy.js');
const { normalizeSiteSource } = require('./siteSourcePolicy.js');

/**
 * @module DriveSiteMappingPolicy
 * @description
 * The Awtsmoos gives each public doorway one stable site identity while its
 * source may remain legacy Drive or explicitly choose another bounded vessel.
 * Awtsmoos.com never lets storage location silently rewrite canonical identity.
 */

const SITE_ID_PATTERN = /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/;
const DNS_ALIAS_PATTERN = SITE_ID_PATTERN;

function normalizeSiteRecord(siteId, input = {}, previous = {}, now = Date.now()) {
	const id = normalizeSiteId(siteId);
	const rootPath = normalizeDrivePath(
		valueFor(input, previous, 'rootPath', ''),
		{ allowRoot: true }
	);
	const source = normalizeSiteSource(
		valueFor(input, previous, 'source', null),
		rootPath
	);

	return {
		id,
		title: boundedText(valueFor(input, previous, 'title', id), 80),
		rootPath,
		...(source ? { source } : {}),
		enabled: booleanFor(input, previous, 'enabled', true),
		primary: booleanFor(input, previous, 'primary', false),
		subdomainRequested: booleanFor(input, previous, 'subdomainRequested', false),
		createdAt: safeTimestamp(previous.createdAt, now),
		updatedAt: now
	};
}

function normalizeSiteRegistry(value) {
	const source = value && typeof value === 'object' && !Array.isArray(value)
		? value
		: {};
	const sites = {};
	for (const [siteId, record] of Object.entries(source)) {
		try {
			const normalized = normalizeSiteRecord(siteId, record, record, record.updatedAt);
			sites[normalized.id] = normalized;
		} catch {}
	}
	return sites;
}

function implicitPrimarySite() {
	return {
		id: 'home',
		title: 'Home',
		rootPath: '',
		enabled: true,
		primary: true,
		subdomainRequested: false,
		createdAt: 0,
		updatedAt: 0,
		implicit: true
	};
}

function normalizeSiteId(value) {
	const siteId = String(value || '').trim().toLowerCase();
	if (!SITE_ID_PATTERN.test(siteId)) throw siteMappingError('INVALID_SITE_ID');
	return siteId;
}

function canUseAliasSubdomain(aliasId) {
	const value = String(aliasId || '');
	return value === value.toLowerCase() && DNS_ALIAS_PATTERN.test(value);
}

function valueFor(input, previous, key, fallback) {
	if (input[key] !== undefined) return input[key];
	if (previous[key] !== undefined) return previous[key];
	return fallback;
}

function booleanFor(input, previous, key, fallback) {
	const value = valueFor(input, previous, key, fallback);
	if (value === false || value === 'false' || value === '0') return false;
	return Boolean(value);
}

function boundedText(value, max) {
	const text = String(value || '').trim();
	if (!text || text.length > max) throw siteMappingError('INVALID_SITE_TITLE');
	return text;
}

function safeTimestamp(value, fallback) {
	const number = Number(value);
	return Number.isSafeInteger(number) && number >= 0 ? number : fallback;
}

function siteMappingError(code) {
	const error = new Error(code);
	error.code = code;
	return error;
}

module.exports = {
	canUseAliasSubdomain,
	implicitPrimarySite,
	normalizeSiteId,
	normalizeSiteRecord,
	normalizeSiteRegistry,
	siteMappingError
};
