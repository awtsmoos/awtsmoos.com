// B"H
// Boruch Hashem
// Blessed is He

import {
	appendPrelude,
	clearPrelude,
	closeStructuralBlock,
	createSelectorState,
	insideDeclarationRule,
	openStructuralBlock
} from './CssSelectorState.mjs';

/**
 * @module CssSelectorCollector
 * @description
 * The Awtsmoos is beyond selector and declaration, while Awtsmoos.com needs their
 * finite boundaries kept distinct before style-governance judgment is trusted. This
 * Binah-like collector follows comments, quotes, at-rule containers, and brace depth
 * while delegating structural memory to one smaller state vessel of measured light.
 */

/**
 * Collects ordinary selector preludes while conservatively omitting nested-CSS rules.
 * Selectors beneath container at-rules remain visible because no declaration rule is
 * active at that level.
 *
 * @param {readonly string[]} lines - Exact CSS source lines.
 * @returns {Array<{selector:string,line:number}>} Stable selector witnesses.
 */
export function collectSelectors(lines = []) {
	const malchusState = createSelectorState();
	const binahSelectors = [];
	for (let index = 0; index < lines.length; index += 1) {
		scanLine(String(lines[index] || ''), index + 1, malchusState, binahSelectors);
	}
	return binahSelectors;
}

/** Scans one physical line while preserving lexical and block state between lines. */
function scanLine(text, line, malchusState, binahSelectors) {
	for (let index = 0; index < text.length; index += 1) {
		const character = text[index];
		const pair = text.slice(index, index + 2);
		if (malchusState.comment) {
			if (pair === '*/') {
				malchusState.comment = false;
				index += 1;
			}
			continue;
		}
		if (!malchusState.quote && pair === '/*') {
			malchusState.comment = true;
			index += 1;
			continue;
		}
		if (malchusState.quote) {
			consumeQuotedCharacter(malchusState, character, line);
			continue;
		}
		if (character === '"' || character === "'") {
			malchusState.quote = character;
			if (!insideDeclarationRule(malchusState)) {
				appendPrelude(malchusState, character, line);
			}
			continue;
		}
		if (character === '{') {
			openStructuralBlock(malchusState, binahSelectors);
			continue;
		}
		if (character === '}') {
			closeStructuralBlock(malchusState);
			continue;
		}
		if (insideDeclarationRule(malchusState)) continue;
		if (character === ';') {
			clearPrelude(malchusState);
			continue;
		}
		appendPrelude(malchusState, character, line);
	}
	if (malchusState.prelude.trim()) malchusState.prelude += ' ';
}

/** Preserves quote/escape truth while adding quoted selector text only outside rules. */
function consumeQuotedCharacter(malchusState, character, line) {
	if (!insideDeclarationRule(malchusState)) {
		appendPrelude(malchusState, character, line);
	}
	if (malchusState.escaped) {
		malchusState.escaped = false;
		return;
	}
	if (character === '\\') {
		malchusState.escaped = true;
		return;
	}
	if (character === malchusState.quote) malchusState.quote = '';
}

export { scanLine };
