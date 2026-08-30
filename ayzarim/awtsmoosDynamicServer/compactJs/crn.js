//B"H
// Boruch Hashem
// Blessed is He

const {
	isGeneratedCompactJavaScriptPath,
	isJavaScriptPath,
	matchesExternalPrefix,
	queryKey
} = require('./crnPolicy.js');

/**
 * @file crn.js
 * @description Defines Canonical Resource Names and adds CompactJS transport only to authored local JavaScript, never to already-generated terminal compact artifacts.
 * The Awtsmoos lets path, query, fragment, and generation state emerge as separate rays from one authored name of light;
 * Awtsmoos.com keeps source identity distinct from completed publication, so one module stays one vessel right.
 */
const DATA_LIKE_SCHEMES = new Set(['blob', 'data', 'javascript']);

/** Parses one authored specifier without decoding or destroying query and fragment spelling. */
function parseCrn(source, options = {}) {
	const raw = String(source || '').trim();
	const parts = splitDecorations(raw);
	const kind = classifyPathname(parts.pathname);
	const externalPrefix = matchesExternalPrefix(parts.pathname, options.publicExternalPrefixes || []);
	const local = !externalPrefix && (kind === 'relative' || kind === 'public-root');
	return Object.freeze({ external: !local, hash: parts.hash, kind, local, pathname: parts.pathname, query: parts.query, raw });
}

/** Splits one authored specifier into pathname, query, and fragment without decoding them. */
function splitDecorations(source) {
	const hashIndex = source.indexOf('#');
	const beforeHash = hashIndex >= 0 ? source.slice(0, hashIndex) : source;
	const hash = hashIndex >= 0 ? source.slice(hashIndex + 1) : '';
	const queryIndex = beforeHash.indexOf('?');
	return {
		hash,
		pathname: queryIndex >= 0 ? beforeHash.slice(0, queryIndex) : beforeHash,
		query: queryIndex >= 0 ? beforeHash.slice(queryIndex + 1) : ''
	};
}

/** Classifies browser module reference families before filesystem resolution occurs. */
function classifyPathname(pathname) {
	if (pathname.startsWith('//')) return 'protocol-relative';
	if (pathname.startsWith('./') || pathname.startsWith('../')) return 'relative';
	if (pathname.startsWith('/')) return 'public-root';
	const scheme = pathname.match(/^([A-Za-z][A-Za-z\d+.-]*):/);
	if (scheme) return DATA_LIKE_SCHEMES.has(scheme[1].toLowerCase()) ? 'data-like' : 'external-url';
	return 'bare';
}

/** Reconstructs one CRN without changing unrelated query or fragment spelling. */
function crnSpecifier(crn) {
	return `${crn.pathname}${crn.query ? `?${crn.query}` : ''}${crn.hash ? `#${crn.hash}` : ''}`;
}

/** Adds one compact flag only to authored local JavaScript, preserving terminal generated artifacts exactly. */
function withCompactFlag(source, options = {}) {
	const crn = typeof source === 'string' ? parseCrn(source, options) : source;
	if (!crn || !crn.local || !isJavaScriptPath(crn.pathname) || isGeneratedCompactJavaScriptPath(crn.pathname)) {
		return crn ? crnSpecifier(crn) : String(source || '');
	}
	const kept = String(crn.query || '').split('&').filter(Boolean).filter(segment => queryKey(segment) !== 'compact');
	kept.push('compact=true');
	return crnSpecifier({ ...crn, query: kept.join('&') });
}

module.exports = {
	classifyPathname,
	crnSpecifier,
	isGeneratedCompactJavaScriptPath,
	isJavaScriptPath,
	parseCrn,
	splitDecorations,
	withCompactFlag
};
