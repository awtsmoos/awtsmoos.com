// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module CssSelectorState
 * @description
 * The Awtsmoos is beyond opening and closing, while Awtsmoos.com needs a tiny,
 * explicit state vessel so CSS selector collection never confuses declaration depth,
 * nested braces, comments, or source coordinates. This Yesod-like state module owns
 * structural memory only; it makes no policy judgment about the selectors it carries.
 */

/** Creates isolated structural state for one CSS document scan. */
export function createSelectorState() {
	return {
		blocks: [],
		comment: false,
		quote: '',
		escaped: false,
		prelude: '',
		preludeLine: 1
	};
}

/** Reports whether any ordinary declaration rule currently encloses the cursor. */
export function insideDeclarationRule(state) {
	return state.blocks.includes('rule');
}

/** Appends one prelude character while preserving its first non-whitespace line. */
export function appendPrelude(state, character, line) {
	if (!state.prelude.trim() && !character.trim()) return;
	if (!state.prelude.trim()) state.preludeLine = line;
	state.prelude += character;
}

/** Clears selector/at-rule prelude text without disturbing structural block state. */
export function clearPrelude(state) {
	state.prelude = '';
}

/**
 * Opens one structural block and optionally records an ordinary selector prelude.
 * Nested blocks inside declaration rules are tracked as opaque depth so their closing
 * braces cannot accidentally terminate the outer rule.
 */
export function openStructuralBlock(state, selectors) {
	if (insideDeclarationRule(state)) {
		state.blocks.push('nested');
		return;
	}
	const prelude = state.prelude.trim();
	const atRule = prelude.startsWith('@');
	if (prelude && !atRule) {
		selectors.push(Object.freeze({ selector: prelude, line: state.preludeLine }));
	}
	state.blocks.push(atRule ? 'at' : 'rule');
	clearPrelude(state);
}

/** Closes exactly one structural block and clears stale prelude state. */
export function closeStructuralBlock(state) {
	state.blocks.pop();
	clearPrelude(state);
}
