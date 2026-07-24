// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module RagShardIdentity
 * @description
 * Derives stable corpus IDs, display titles, and historical aliases without any
 * filesystem or database access. Publication code may therefore reuse identity
 * rules while remaining small, testable, and free of hidden storage work.
 */

const path = require('path');

function slug(name) {
	return path.basename(name, '.awtsdb')
		.replace(/[^a-z0-9]+/gi, '-')
		.replace(/^-|-$/g, '')
		.toLowerCase();
}

function label(value) {
	return value.replace(/-/g, ' ').replace(/\b\w/g, letter => letter.toUpperCase());
}

function aliases(id, fileSlug = id, declared = []) {
	const values = [id, fileSlug, ...normalizeAliases(declared)];
	if (containsEither(id, fileSlug, 'meluket')) values.push('meluket', 'maamar-meluket');
	if (containsEither(id, fileSlug, 'hasichos')) {
		values.push('sefer-hasichos', 'dvar-hasichos', 'dr-hasichos');
	}
	if (containsEither(id, fileSlug, 'likkutei')) {
		values.push('likkutei-sichos', 'likutei-sichos', 'ls');
	}
	if (containsEither(id, fileSlug, 'sichos-kodesh')) {
		values.push('sichos-kodesh', 'sichos-kodesh-english-comments-rag', 'sk');
	}
	return [...new Set(values.filter(Boolean).map(value => String(value).toLowerCase()))];
}

function containsEither(left, right, fragment) {
	return left.includes(fragment) || right.includes(fragment);
}

function normalizeAliases(value) {
	return Array.isArray(value) ? value : [];
}

module.exports = {
	aliases,
	label,
	slug
};
