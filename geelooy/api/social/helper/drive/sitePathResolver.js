//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module DriveSitePathResolver
 * @description
 * The Awtsmoos honors exact bytes before clean names and rewrites, preserving
 * directory slashes so every relative browser path returns to its intended root.
 */

const { firstMatchingRule, substituteDestination } = require('./siteRuleMatcher.js');
const { normalizeDrivePath } = require('./pathPolicy.js');

function resolveSitePath(options) {
	const path = normalizeDrivePath(options.requestPath || '', { allowRoot: true });
	const exact = publicFile(options.state, path);
	if (exact) return canonicalHtml(options, path, exact);
	const indexPath = path ? `${path}/index.html` : 'index.html';
	if (publicFile(options.state, indexPath)) {
		if (path && !options.hasTrailingSlash) return { redirectPath: `${path}/` };
		return { contentPath: indexPath };
	}
	const clean = cleanFile(options.state, path, options.config.cleanUrls);
	if (clean) return cleanCanonical(options, path, clean);
	const rewrite = firstMatchingRule(options.config.rewrites, path);
	if (!rewrite) return null;
	const destination = substituteDestination(rewrite.rule.destination, rewrite.match);
	return { contentPath: destinationContentPath(options.state, destination, options.config) };
}

function canonicalHtml(options, path, exact) {
	if (!options.config.cleanUrls || !path.toLowerCase().endsWith('.html')) {
		return { contentPath: exact.path };
	}
	const cleanPath = path.slice(0, -5);
	return { redirectPath: options.config.trailingSlash ? `${cleanPath}/` : cleanPath };
}

function cleanCanonical(options, path, clean) {
	if (options.config.trailingSlash && !options.hasTrailingSlash) {
		return { redirectPath: `${path}/` };
	}
	if (!options.config.trailingSlash && options.hasTrailingSlash) {
		return { redirectPath: path.replace(/\/+$/, '') };
	}
	return { contentPath: clean.path };
}

function destinationContentPath(state, destination, config) {
	const path = normalizeDrivePath(String(destination).split(/[?#]/, 1)[0], { allowRoot: true });
	const direct = publicFile(state, path);
	if (direct) return direct.path;
	const index = publicFile(state, path ? `${path}/index.html` : 'index.html');
	if (index) return index.path;
	const clean = cleanFile(state, path, config.cleanUrls);
	return clean?.path || path;
}

function cleanFile(state, path, enabled) {
	if (!enabled || !path || path.toLowerCase().endsWith('.html')) return null;
	const base = path.replace(/\/+$/, '');
	return publicFile(state, `${base}.html`);
}

function publicFile(state, path) {
	const entry = state.entries[path];
	return entry?.type === 'file' && !entry.trashedAt && entry.visibility === 'public'
		? entry
		: null;
}

module.exports = {
	resolveSitePath,
	publicFile
};
