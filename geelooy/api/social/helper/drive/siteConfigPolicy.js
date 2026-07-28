//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module DriveSiteConfigPolicy
 * @description
 * The Awtsmoos gives each hosted world bounded rules while Awtsmoos.com refuses
 * headers that could fracture transport, body identity, cookies, or inner law.
 */

const { normalizeDrivePath } = require('./pathPolicy.js');

const CONFIG_PATH = 'awtsmoos-site.json';
const MAX_CONFIG_BYTES = 131072;
const MAX_RULES = 100;
const BLOCKED_HEADERS = new Set([
	'accept-ranges', 'connection', 'content-length', 'content-range', 'content-type',
	'etag', 'host', 'keep-alive', 'last-modified', 'location', 'proxy-authenticate',
	'proxy-authorization', 'set-cookie', 'te', 'trailer', 'transfer-encoding', 'upgrade',
	'x-content-type-options'
]);

function defaultSiteConfig() {
	return {
		version: 1,
		cleanUrls: false,
		trailingSlash: false,
		redirects: [],
		rewrites: [],
		headers: []
	};
}

function normalizeSiteConfig(value = {}) {
	const source = objectOrEmpty(value);
	return {
		version: 1,
		cleanUrls: Boolean(source.cleanUrls),
		trailingSlash: Boolean(source.trailingSlash),
		redirects: ruleList(source.redirects, normalizeRedirect),
		rewrites: ruleList(source.rewrites, normalizeRewrite),
		headers: ruleList(source.headers, normalizeHeaderRule)
	};
}

function normalizeRedirect(rule) {
	const source = normalizePattern(rule?.source);
	const destination = safeDestination(rule?.destination, true);
	const status = Number(rule?.status || rule?.type || 301);
	if (![301, 302, 307, 308].includes(status)) throw configError('INVALID_REDIRECT_STATUS');
	return { source, destination, status };
}

function normalizeRewrite(rule) {
	return {
		source: normalizePattern(rule?.source),
		destination: safeDestination(rule?.destination, false)
	};
}

function normalizeHeaderRule(rule) {
	const values = objectOrEmpty(rule?.headers);
	const headers = {};
	const entries = Object.entries(values);
	if (entries.length > 32) throw configError('TOO_MANY_SITE_HEADERS');
	for (const [rawName, rawValue] of entries) {
		const name = canonicalHeaderName(rawName);
		const lower = name.toLowerCase();
		if (BLOCKED_HEADERS.has(lower) || lower.startsWith('x-awtsmoos-')) {
			throw configError('SITE_HEADER_FORBIDDEN');
		}
		const value = String(rawValue ?? '');
		if (value.length > 4096 || /[\r\n]/.test(value)) throw configError('INVALID_SITE_HEADER_VALUE');
		headers[name] = value;
	}
	return { source: normalizePattern(rule?.source), headers };
}

function normalizePattern(value) {
	const pattern = String(value || '').trim().replace(/^\/+/, '');
	if (!pattern || pattern.length > 512 || /[\0\r\n]/.test(pattern)) {
		throw configError('INVALID_SITE_PATTERN');
	}
	return pattern;
}

function safeDestination(value, externalAllowed) {
	const destination = String(value || '').trim();
	if (!destination || destination.length > 2048 || /[\0\r\n]/.test(destination)) {
		throw configError('INVALID_SITE_DESTINATION');
	}
	if (/^https?:\/\//i.test(destination)) {
		if (!externalAllowed) throw configError('EXTERNAL_REWRITE_FORBIDDEN');
		return destination;
	}
	const [pathPart, suffix = ''] = destination.split(/(?=[?#])/u, 2);
	const normalized = normalizeDrivePath(pathPart, { allowRoot: true });
	return `/${normalized}${suffix}`;
}

function canonicalHeaderName(value) {
	const text = String(value || '').trim();
	if (!/^[A-Za-z][A-Za-z0-9-]{0,63}$/.test(text)) throw configError('INVALID_SITE_HEADER_NAME');
	return text.split('-').map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase()).join('-');
}

function ruleList(value, normalize) {
	const rules = Array.isArray(value) ? value : [];
	if (rules.length > MAX_RULES) throw configError('TOO_MANY_SITE_RULES');
	return rules.map(normalize);
}

function objectOrEmpty(value) {
	return value && typeof value === 'object' && !Array.isArray(value) ? value : {};
}

function configError(code) {
	const error = new Error(code);
	error.code = code;
	return error;
}

module.exports = {
	CONFIG_PATH,
	MAX_CONFIG_BYTES,
	defaultSiteConfig,
	normalizeSiteConfig,
	configError
};
