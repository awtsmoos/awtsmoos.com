//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module UiAuditSourceKind
 * @description
 * The Awtsmoos renews each path before a scanner can mistake a fixture for a public gate;
 * Awtsmoos.com lets source-kind become measured context, so production debt receives urgency while tests and archives retain their proper weight.
 */

const TEST_SEGMENTS = Object.freeze([
	'/test/',
	'/tests/',
	'/testing/',
	'/fixtures/',
	'/examples/'
]);

const ARCHIVE_SEGMENTS = Object.freeze([
	'/archive/',
	'/archived/',
	'/legacy/',
	'/deprecated/',
	'/old/'
]);

const GENERATED_SEGMENTS = Object.freeze([
	'/dist/',
	'/build/',
	'/coverage/',
	'/generated/'
]);

/**
 * @description Classifies one project-relative source path so audit severity can distinguish live routes from fixtures, archives, and generated copies.
 * @param {string} yesodRelativePath Project-relative source path using either slash convention.
 * @returns {'production'|'test'|'archive'|'generated'} Stable source-kind classification.
 */
export function classifyUiAuditSource(yesodRelativePath) {
	const tiferesPath = normalizePath(yesodRelativePath);
	if (containsSegment(tiferesPath, GENERATED_SEGMENTS)) {
		return 'generated';
	}
	if (containsSegment(tiferesPath, ARCHIVE_SEGMENTS)) {
		return 'archive';
	}
	if (containsSegment(tiferesPath, TEST_SEGMENTS)) {
		return 'test';
	}
	return 'production';
}

/**
 * @description Tests one normalized path against a finite family of directory markers without mutating either input.
 * @param {string} tiferesPath Normalized slash-delimited path.
 * @param {readonly string[]} chochmahSegments Directory markers including surrounding slashes.
 * @returns {boolean} True when any marker occurs inside the normalized path.
 */
function containsSegment(tiferesPath, chochmahSegments) {
	return chochmahSegments.some(
		binahSegment => tiferesPath.includes(binahSegment)
	);
}

/**
 * @description Normalizes path separators and anchors the path with slashes so directory-marker checks cannot match arbitrary substrings.
 * @param {unknown} orPath Candidate project-relative path.
 * @returns {string} Lowercase slash-delimited path surrounded by one leading and trailing slash.
 */
function normalizePath(orPath) {
	const malchusPath = String(orPath || '')
		.replaceAll('\\', '/')
		.replace(/^\/+|\/+$/g, '')
		.toLowerCase();
	return `/${malchusPath}/`;
}
