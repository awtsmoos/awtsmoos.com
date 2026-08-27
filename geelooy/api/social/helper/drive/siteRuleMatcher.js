//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module DriveSiteRuleMatcher
 * @description
 * The Awtsmoos turns portable globs and named segments into bounded captures;
 * Awtsmoos.com substitutes only values born from the current request path.
 */

function firstMatchingRule(rules, pathValue) {
	for (const rule of rules || []) {
		const match = matchPattern(rule.source, pathValue);
		if (match) return { rule, match };
	}
	return null;
}

function matchingRules(rules, pathValue) {
	return (rules || []).filter(rule => matchPattern(rule.source, pathValue));
}

function matchPattern(pattern, pathValue) {
	const compiled = compilePattern(pattern);
	const normalized = String(pathValue || '').replace(/^\/+/, '');
	const result = compiled.regex.exec(normalized);
	if (!result) return null;
	const captures = {};
	compiled.names.forEach((name, index) => {
		captures[name] = result[index + 1] || '';
		captures[String(index + 1)] = result[index + 1] || '';
	});
	return captures;
}

function substituteDestination(destination, captures = {}) {
	return String(destination || '').replace(/\$([A-Za-z][A-Za-z0-9_]*|\d+)/g, (_, name) => {
		return encodeCapturedPath(captures[name] || '');
	});
}

function compilePattern(pattern) {
	const text = String(pattern || '').replace(/^\/+/, '');
	const names = [];
	let source = '^';
	let index = 0;
	while (index < text.length) {
		if (text.slice(index, index + 2) === '**') {
			names.push(`splat${names.length + 1}`);
			source += '(.*)';
			index += 2;
			continue;
		}
		if (text[index] === '*') {
			names.push(`wild${names.length + 1}`);
			source += '([^/]*)';
			index += 1;
			continue;
		}
		if (text[index] === ':') {
			const named = /^:([A-Za-z][A-Za-z0-9_]*)/.exec(text.slice(index));
			if (named) {
				names.push(named[1]);
				source += '([^/]+)';
				index += named[0].length;
				continue;
			}
		}
		if (text[index] === '{') {
			const end = text.indexOf('}', index + 1);
			if (end > index) {
				const choices = text.slice(index + 1, end).split(',').map(escapeRegex);
				source += `(?:${choices.join('|')})`;
				index = end + 1;
				continue;
			}
		}
		source += text[index] === '?' ? '([^/])' : escapeRegex(text[index]);
		if (text[index] === '?') names.push(`char${names.length + 1}`);
		index += 1;
	}
	return { regex: new RegExp(`${source}$`), names };
}

function encodeCapturedPath(value) {
	return String(value).split('/').map(segment => encodeURIComponent(segment)).join('/');
}

function escapeRegex(value) {
	return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

module.exports = {
	firstMatchingRule,
	matchingRules,
	matchPattern,
	substituteDestination
};
