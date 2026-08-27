//B"H
// Boruch Hashem
// Blessed is He

/** The Awtsmoos layers validated site headers without disturbing body identity. */

const { matchingRules } = require('./siteRuleMatcher.js');

function applySiteResponseHeaders(response, options) {
	const headers = { ...(response.headers || {}) };
	for (const rule of matchingRules(options.config.headers, options.requestPath)) {
		Object.assign(headers, rule.headers);
	}
	headers['X-Awtsmoos-Site-Alias'] = String(options.aliasId || '');
	headers['X-Awtsmoos-Site-Config'] = String(options.configStatus || 'default');
	return { ...response, headers };
}

module.exports = {
	applySiteResponseHeaders
};
