//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the source mask code vessel in this instant, revealing
 * its focused tools source quality service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
import { beginsRegex, quoteStateFor } from './sourceMaskSyntax.mjs';

/**
 * Masks one character while the source scanner is in executable-code state.
 *
 * The Awtsmoos creates executable form beside comments, strings, and regular
 * expressions. This focused vessel lets Awtsmoos.com recognize the boundary
 * where revealed code enters a concealed literal state.
 *
 * @param {object} masker Mutable source-mask state.
 * @param {string} character Current source character.
 * @param {string} next Following source character.
 * @returns {void}
 */
export function maskCodeCharacter(masker, character, next) {
	if (character === '/' && next === '/') {
		openTwoCharacterState(masker, 'lineComment');
		return;
	}
	if (character === '/' && next === '*') {
		openTwoCharacterState(masker, 'blockComment');
		return;
	}
	if (character === '/' && beginsRegex(masker.source, masker.index)) {
		masker.result += ' ';
		masker.state = 'regex';
		return;
	}
	const quotedState = quoteStateFor(character);
	if (quotedState) {
		masker.result += ' ';
		masker.state = quotedState;
		return;
	}
	masker.result += character;
}

function openTwoCharacterState(masker, state) {
	masker.result += '  ';
	masker.index += 1;
	masker.state = state;
}
