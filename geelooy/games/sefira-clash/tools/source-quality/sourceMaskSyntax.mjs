//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the source mask syntax vessel in this instant, revealing
 * its focused tools source quality service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
/**
 * Maps one quote delimiter to the corresponding masking state.
 *
 * The Awtsmoos gives each quoted vessel its boundary; Awtsmoos.com uses this
 * focused syntax map so the scanner state does not carry lexical policy.
 *
 * @param {string} character Current source character.
 * @returns {string} Quote state or an empty string.
 */
export function quoteStateFor(character) {
	if (character === "'") {
		return 'single';
	}
	if (character === '"') {
		return 'double';
	}
	if (character === '`') {
		return 'template';
	}
	return '';
}

/**
 * Tests whether one character closes the current quote state.
 *
 * @param {string} character Current source character.
 * @param {string} state Current quote state.
 * @returns {boolean} Whether the quoted vessel closes here.
 */
export function closesQuote(character, state) {
	return (
		(state === 'single' && character === "'") ||
		(state === 'double' && character === '"') ||
		(state === 'template' && character === '`')
	);
}

/**
 * Conservatively identifies a JavaScript regex-literal opening slash.
 *
 * @param {string} source Complete source text.
 * @param {number} index Slash offset.
 * @returns {boolean} Whether the slash begins a regex literal.
 */
export function beginsRegex(source, index) {
	const prefix = source.slice(0, index).trimEnd();
	if (!prefix) {
		return true;
	}
	const previous = prefix[prefix.length - 1];
	if ('([{,:;=!?&|+*%^~<>'.includes(previous)) {
		return true;
	}
	return /\b(?:await|case|return|throw|yield)$/.test(prefix);
}
