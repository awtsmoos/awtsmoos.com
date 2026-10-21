//B"H
//Blessed is He
//Boruch Hashem


/**
 * @module siteConfigPolicyConfig
 * @description
 * Default site config and whole-config normalization.
 */

const { ruleList, normalizeHeaderRule, objectOrEmpty } = require('./siteConfigPolicyRules.js');

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

module.exports = {
	defaultSiteConfig,
	normalizeSiteConfig,
	normalizeRedirect,
	normalizeRewrite
};
