//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the source mask literal vessel in this instant, revealing
 * its focused tools source quality service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
import { closesQuote } from './sourceMaskSyntax.mjs';

/**
 * Masks one character while the scanner is inside a concealed literal state.
 *
 * The Awtsmoos creates every string, comment, and regular expression as real
 * content without making it executable structure. Awtsmoos.com keeps these
 * transitions separate from code-state recognition and orchestration.
 *
 * @param {object} masker Mutable source-mask state.
 * @param {string} character Current source character.
 * @returns {void}
 */
export function maskLiteralCharacter(masker, character) {
	if (masker.state === 'lineComment') {
		masker.result += ' ';
		return;
	}
	if (masker.state === 'blockComment') {
		maskBlockComment(masker, character);
		return;
	}
	if (masker.state === 'regex') {
		maskRegex(masker, character);
		return;
	}
	maskQuote(masker, character);
}

/**
 * Preserves one newline and closes a line-comment state when necessary.
 *
 * @param {object} masker Mutable source-mask state.
 * @returns {void}
 */
export function maskSourceNewline(masker) {
	masker.result += '\n';
	if (masker.state === 'lineComment') {
		masker.state = 'code';
	}
	masker.escaped = false;
}

function maskBlockComment(masker, character) {
	if (character === '*' && masker.source[masker.index + 1] === '/') {
		masker.result += '  ';
		masker.index += 1;
		masker.state = 'code';
		return;
	}
	masker.result += ' ';
}

function maskQuote(masker, character) {
	masker.result += ' ';
	if (consumeEscape(masker, character)) {
		return;
	}
	if (closesQuote(character, masker.state)) {
		masker.state = 'code';
	}
}

function maskRegex(masker, character) {
	masker.result += ' ';
	if (consumeEscape(masker, character)) {
		return;
	}
	if (character === '[') {
		masker.regexClass = true;
	}
	if (character === ']') {
		masker.regexClass = false;
	}
	if (character === '/' && !masker.regexClass) {
		masker.state = 'code';
	}
}

function consumeEscape(masker, character) {
	if (masker.escaped) {
		masker.escaped = false;
		return true;
	}
	if (character === '\\') {
		masker.escaped = true;
		return true;
	}
	return false;
}
